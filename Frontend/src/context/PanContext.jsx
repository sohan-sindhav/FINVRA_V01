import { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../configs/AxiosInstance";
import { useAuth } from "./AuthContext";

export const PanContext = createContext();

export const PanProvider = ({ children }) => {
  const [panCards, setPanCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sharing state
  const [incomingRequests, setIncomingRequests] = useState([]); // pending requests TO me
  const [sharedWithMe, setSharedWithMe] = useState([]);          // accepted shares I received
  const [outgoingShares, setOutgoingShares] = useState([]);      // shares I sent

  const { loggedIn } = useAuth();

  // ── Own PAN cards ──────────────────────────────────────────────────────
  const getPanCards = async () => {
    if (!loggedIn) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/pan/get");
      setPanCards(res.panCards);
    } catch (error) {
      console.error("Failed to fetch PAN cards", error);
    } finally {
      setLoading(false);
    }
  };

  const addPanCard = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/pan/create", data);
      await getPanCards();
      return { success: true, message: res.message };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Failed to add PAN card",
      };
    } finally {
      setLoading(false);
    }
  };

  const deletePanCard = async (id) => {
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/api/pan/delete/${id}`);
      await getPanCards();
      return { success: true, message: res.message };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Failed to delete PAN card",
      };
    } finally {
      setLoading(false);
    }
  };

  // ── Sharing ────────────────────────────────────────────────────────────
  const sendShareRequest = async ({ recipientEmail, panCardIds }) => {
    try {
      const res = await axiosInstance.post("/api/pan/share/send", { recipientEmail, panCardIds });
      await getOutgoingShares();
      return { success: true, message: res.message };
    } catch (error) {
      return { success: false, message: error?.message || "Failed to send share request." };
    }
  };

  const getIncomingRequestsFn = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/pan/share/incoming");
      setIncomingRequests(res.requests || []);
    } catch (error) {
      console.error("Failed to fetch incoming share requests", error);
    }
  };

  const respondToRequest = async (id, action) => {
    try {
      const res = await axiosInstance.post(`/api/pan/share/respond/${id}`, { action });
      await getIncomingRequestsFn();
      await getSharedWithMeFn();
      return { success: true, message: res.message };
    } catch (error) {
      return { success: false, message: error?.message || "Failed to respond to request." };
    }
  };

  const getSharedWithMeFn = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/pan/share/shared-with-me");
      setSharedWithMe(res.shares || []);
    } catch (error) {
      console.error("Failed to fetch shared PANs", error);
    }
  };

  const getOutgoingShares = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/pan/share/outgoing");
      setOutgoingShares(res.shares || []);
    } catch (error) {
      console.error("Failed to fetch outgoing shares", error);
    }
  };

  const revokeShare = async (id) => {
    try {
      const res = await axiosInstance.post(`/api/pan/share/revoke/${id}`);
      await getOutgoingShares();
      return { success: true, message: res.message };
    } catch (error) {
      return { success: false, message: error?.message || "Failed to revoke share." };
    }
  };

  // ── Init ───────────────────────────────────────────────────────────────
  const refreshAll = async () => {
    await Promise.all([
      getPanCards(),
      getIncomingRequestsFn(),
      getSharedWithMeFn(),
      getOutgoingShares(),
    ]);
  };

  useEffect(() => {
    if (loggedIn) {
      refreshAll();
    } else {
      setPanCards([]);
      setIncomingRequests([]);
      setSharedWithMe([]);
      setOutgoingShares([]);
    }
  }, [loggedIn]);

  return (
    <PanContext.Provider
      value={{
        // Own PANs
        panCards,
        loading,
        getPanCards,
        addPanCard,
        deletePanCard,
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
    </PanContext.Provider>
  );
};

export const usePan = () => {
  return useContext(PanContext);
};
