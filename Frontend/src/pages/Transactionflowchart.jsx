import { useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import axiosInstance from "../configs/AxiosInstance";
import { useNavigate } from "react-router-dom";

// ─── Layout ──────────────────────────────────────────────────────────────────
const NODE_W = 190;
const NODE_H = 80;

function applyDagreLayout(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  // LR = left-to-right: chains flow horizontally; connections branch vertically
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120, edgesep: 20 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return { ...n, position: { x: x - NODE_W / 2, y: y - NODE_H / 2 } };
  });
}

// ─── Custom Node ──────────────────────────────────────────────────────────────
function FlowNode({ data }) {
  const isBank = data.type === "bankAccount";
  const accent = isBank ? "#3B82F6" : "#A855F7";
  const bg     = isBank ? "#0c1e3a" : "#1a0b2e";
  const glow   = isBank ? "#3B82F618" : "#A855F718";

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: accent,
          width: 9,
          height: 9,
          border: "2px solid #060a12",
        }}
      />

      <div
        style={{
          background: bg,
          border: `1.5px solid ${accent}`,
          borderRadius: 14,
          padding: "10px 18px",
          width: NODE_W,
          minHeight: NODE_H,
          boxShadow: `0 0 22px ${glow}, inset 0 0 0 1px ${accent}22`,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          boxSizing: "border-box",
        }}
      >
        {/* badge */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accent,
            opacity: 0.8,
          }}
        >
          {isBank ? data.subLabel || "Bank" : "Contact"}
        </span>

        {/* name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#F1F5F9",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {data.label}
        </span>

        {/* balance — only for bank accounts */}
        {isBank && data.balance !== undefined && data.balance !== null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#22C55E",
              marginTop: 2,
            }}
          >
            ₹{Number(data.balance).toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: accent,
          width: 9,
          height: 9,
          border: "2px solid #060a12",
        }}
      />
    </>
  );
}

const nodeTypes = { flowNode: FlowNode };

// ─── Map API data → ReactFlow nodes + edges ───────────────────────────────────
function buildReactFlowData(apiNodes, apiEdges) {
  const rfNodes = apiNodes.map((n) => ({
    id: n.id,
    type: "flowNode",
    data: {
      label:    n.label,
      subLabel: n.subLabel,
      type:     n.type,
      balance:  n.balance,
    },
    position: { x: 0, y: 0 }, // will be overwritten by dagre
  }));

  const rfEdges = apiEdges.map((e) => ({
    id: e.id,
    source:   e.source,
    target:   e.target,
    label:    `₹${Number(e.amount).toLocaleString("en-IN")}`,
    animated: !e.reversed,
    style: {
      stroke:      e.reversed ? "#475569" : "#3B82F6",
      strokeWidth: 2,
    },
    labelStyle: {
      fill:       "#94A3B8",
      fontSize:   11,
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
    },
    labelBgStyle: {
      fill:        "#0B1120",
      fillOpacity: 0.9,
    },
    labelBgPadding: [5, 8],
    labelBgBorderRadius: 6,
    markerEnd: {
      type:  MarkerType.ArrowClosed,
      color: e.reversed ? "#475569" : "#3B82F6",
      width: 18,
      height: 18,
    },
  }));

  const layoutedNodes = applyDagreLayout(rfNodes, rfEdges);
  return { nodes: layoutedNodes, edges: rfEdges };
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TransactionFlowChart() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);

  const fetchFlowchart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/api/flowchart");
      if (res.success) {
        const { nodes: n, edges: e } = buildReactFlowData(res.nodes, res.edges);
        setNodes(n);
        setEdges(e);
      }
    } catch (err) {
      console.error("Flowchart fetch error:", err);
      setError("Failed to load flowchart data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlowchart();
  }, [fetchFlowchart]);

  const isEmpty = !loading && !error && nodes.length === 0;

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
        background: "#060a12",
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        {/* Title + subtitle */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>
            Money Flow
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
            Contacts → your bank accounts → transfers
          </div>
        </div>

        {/* Legend + back — pointerEvents re-enabled */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "auto" }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 10,
              padding: "8px 14px",
            }}
          >
            {[
              { color: "#3B82F6", label: "Active" },
              { color: "#A855F7", label: "Contact" },
              { color: "#475569", label: "Reversed" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 18,
                    height: 2,
                    background: color,
                    borderRadius: 2,
                  }}
                />
                <span style={{ color: "#64748B", fontSize: 11 }}>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/bankacc")}
            style={{
              background: "#1E293B",
              border: "1px solid #334155",
              color: "#F1F5F9",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #1E293B",
              borderTop: "3px solid #3B82F6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ color: "#475569", fontSize: 13 }}>
            Building flowchart…
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            zIndex: 5,
          }}
        >
          <span style={{ fontSize: 32 }}>⚠️</span>
          <span style={{ color: "#EF4444", fontSize: 14 }}>{error}</span>
          <button
            onClick={fetchFlowchart}
            style={{
              marginTop: 8,
              background: "#1E3A5F",
              border: "1px solid #3B82F6",
              color: "#93C5FD",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {isEmpty && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 48 }}>🏦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#64748B" }}>
            No money flow yet
          </div>
          <div style={{ fontSize: 12, color: "#334155", textAlign: "center" }}>
            Add transactions from contacts or send money
            <br />
            between your bank accounts to see the flow
          </div>
        </div>
      )}

      {/* ── ReactFlow canvas ─────────────────────────────────────── */}
      {!loading && !error && nodes.length > 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1E293B" gap={24} size={1} />
          <Controls
            style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 8,
            }}
          />
          <MiniMap
            nodeColor={(n) =>
              n.data?.type === "connection" ? "#A855F7" : "#3B82F6"
            }
            maskColor="#06080fee"
            style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      )}
    </div>
  );
}

// React must be in scope for useState
import React from "react";
