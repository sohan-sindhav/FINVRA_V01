import transactions from "../models/transaction.models.js";
import BankHistory from "../models/Bankhistory.models.js";
import BankAcc from "../models/bankAcc.models.js";

/**
 * GET /api/flowchart
 *
 * Builds a directed graph (nodes + edges) tracing all money movement:
 *   Connection ──[txn]──► BankAcc ──[transfer]──► BankAcc
 *
 * Strategy: fetch BankAccounts separately and build an ID→doc map so
 * we never depend on populate() silently returning null for stale refs.
 */
export const getFlowchartData = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. Fetch everything in parallel ──────────────────────────────────────
    const [txnList, historyList, bankAccList] = await Promise.all([
      transactions
        .find({ userId })
        .populate("from", "name mobile")   // Connection
        .populate("to",   "nickname bank"), // BankAcc (name fields)
      BankHistory
        .find({ userId, transactionType: "transfer" })
        .populate("from", "nickname bank")
        .populate("to",   "nickname bank"),
      BankAcc
        .find({ userId })                  // all user's bank accounts (with balance)
        .select("nickname bank balance"),
    ]);

    console.log(`[flowchart] txns=${txnList.length}  history=${historyList.length}  accounts=${bankAccList.length}`);

    // ── 2. Build an ID→BankAcc lookup (for balance + fallback labels) ─────────
    const accLookup = {};
    for (const acc of bankAccList) {
      accLookup[String(acc._id)] = acc;
    }

    // ── 3. Node + Edge maps ───────────────────────────────────────────────────
    const nodeMap = {}; // sid → node
    const edgeMap = {}; // `${src}__${tgt}` → edge

    const upsertNode = (id, label, subLabel, type) => {
      const sid = String(id);
      if (!nodeMap[sid]) {
        const accInfo = type === "bankAccount" ? accLookup[sid] : null;
        nodeMap[sid] = {
          id:       sid,
          label:    label    || accInfo?.nickname || "Unknown",
          subLabel: subLabel || accInfo?.bank     || "",
          type,
          balance:  accInfo?.balance,
        };
      }
      return sid;
    };

    const upsertEdge = (src, tgt, amount, reversed = false) => {
      const key = `${src}__${tgt}`;
      if (edgeMap[key]) {
        edgeMap[key].amount += amount;
        // if any of the transactions for this pair is active, keep animated
        if (!reversed) edgeMap[key].reversed = false;
      } else {
        edgeMap[key] = { id: key, source: src, target: tgt, amount, reversed };
      }
    };

    // ── 4. Transactions: Connection → BankAcc ────────────────────────────────
    for (const txn of txnList) {
      // `from` is Connection (must be populated; no fallback needed)
      // `to` is BankAcc (fall back to accLookup if populate returned null)
      const fromDoc = txn.from;
      const toId    = String(txn.to?._id || txn.to); // might be an ObjectId

      if (!fromDoc) continue; // Connection deleted — skip
      if (!toId || toId === "null" || toId === "undefined") continue;

      const fromId = upsertNode(fromDoc._id, fromDoc.name, fromDoc.mobile ? `+91 ${fromDoc.mobile}` : "Contact", "connection");

      // Use populated data OR fall back to accLookup
      const toAcc = txn.to?._id ? txn.to : accLookup[toId];
      upsertNode(toId, toAcc?.nickname, toAcc?.bank, "bankAccount");

      upsertEdge(fromId, toId, Number(txn.amount), txn.reversed || false);
    }

    // ── 5. Bank transfers: BankAcc → BankAcc ────────────────────────────────
    for (const entry of historyList) {
      // Use populated data OR fall back to accLookup
      const fromRawId = String(entry.from?._id || entry.from);
      const toRawId   = String(entry.to?._id   || entry.to);

      if (!fromRawId || fromRawId === "null" || fromRawId === "undefined") continue;
      if (!toRawId   || toRawId   === "null" || toRawId   === "undefined") continue;

      const fromAcc = entry.from?._id ? entry.from : accLookup[fromRawId];
      const toAcc   = entry.to?._id   ? entry.to   : accLookup[toRawId];

      console.log(`[flowchart] transfer: ${fromAcc?.nickname || fromRawId} → ${toAcc?.nickname || toRawId}  ₹${entry.amount}`);

      upsertNode(fromRawId, fromAcc?.nickname, fromAcc?.bank, "bankAccount");
      upsertNode(toRawId,   toAcc?.nickname,   toAcc?.bank,   "bankAccount");
      upsertEdge(fromRawId, toRawId, Number(entry.amount), entry.reversed || false);
    }

    const result = {
      success: true,
      nodes:   Object.values(nodeMap),
      edges:   Object.values(edgeMap),
    };

    console.log(`[flowchart] returning nodes=${result.nodes.length}  edges=${result.edges.length}`);
    return res.status(200).json(result);

  } catch (error) {
    console.error("[flowchart] Error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
