import { createContext, useEffect, useContext, useState } from "react";
import axiosInstance from "../configs/AxiosInstance";
import { useAuth } from "./AuthContext";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Sharing state
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [outgoingShares, setOutgoingShares] = useState([]);

  const { loggedIn } = useAuth();

  const createTransaction = async ({ from, to, amount }) => {
    try {
      const res = await axiosInstance.post("/api/transactions/create", {
        from,
        to,
        amount,
      });
      getTransactions();
    } catch (error) {
      console.log(error);
    }
  };

  const getTransactions = async () => {
    try {
      const res = await axiosInstance.get("/api/transactions/get");
      setTransactions(res.userTransactions);
      console.log("here is transactions: ", res);
    } catch (error) {
      console.log("error setting transactions from response : ", error);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await axiosInstance.delete(`/api/transactions/delete/${transactionId}`);
      await getTransactions();
    } catch (error) {
      console.log("Error deleting transaction:", error);
    }
  };

  const reverseTransaction = async (transactionId) => {
    try {
      await axiosInstance.post(`/api/transactions/reverse/${transactionId}`);
      await getTransactions();
    } catch (error) {
      console.log("Error reversing transaction:", error);
    }
  };

  // ── Sharing ────────────────────────────────────────────────────────────
  const sendShareRequest = async ({ recipientEmail, transactionIds }) => {
    try {
      const res = await axiosInstance.post("/api/transactions/share/send", { recipientEmail, transactionIds });
      await getOutgoingShares();
      return { success: true, message: res.data?.message || res.message };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || error?.message || "Failed to send share request." };
    }
  };

  const getIncomingRequestsFn = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/transactions/share/incoming");
      setIncomingRequests(res.requests || []);
    } catch (error) {
      console.error("Failed to fetch incoming transaction share requests", error);
    }
  };

  const respondToRequest = async (id, action) => {
    try {
      const res = await axiosInstance.post(`/api/transactions/share/respond/${id}`, { action });
      await getIncomingRequestsFn();
      await getSharedWithMeFn();
      return { success: true, message: res.data?.message || res.message };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || error?.message || "Failed to respond to request." };
    }
  };

  const getSharedWithMeFn = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/transactions/share/shared-with-me");
      setSharedWithMe(res.shares || []);
    } catch (error) {
      console.error("Failed to fetch shared transactions", error);
    }
  };

  const getOutgoingShares = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/transactions/share/outgoing");
      setOutgoingShares(res.shares || []);
    } catch (error) {
      console.error("Failed to fetch outgoing transaction shares", error);
    }
  };

  const revokeShare = async (id) => {
    try {
      const res = await axiosInstance.post(`/api/transactions/share/revoke/${id}`);
      await getOutgoingShares();
      return { success: true, message: res.data?.message || res.message };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || error?.message || "Failed to revoke share." };
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      getTransactions(),
      getIncomingRequestsFn(),
      getSharedWithMeFn(),
      getOutgoingShares(),
    ]);
  };

  useEffect(() => {
    if (loggedIn) {
      refreshAll();
    } else {
      setTransactions([]);
      setIncomingRequests([]);
      setSharedWithMe([]);
      setOutgoingShares([]);
    }
  }, [loggedIn]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        createTransaction,
        setShowModal,
        showModal,
        deleteTransaction,
        reverseTransaction,
        // Sharing
        incomingRequests,
        sharedWithMe,
        outgoingShares,
        sendShareRequest,
        respondToRequest,
        revokeShare,
        refreshAll,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  return useContext(TransactionContext);
};
