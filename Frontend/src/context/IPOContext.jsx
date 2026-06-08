import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../configs/AxiosInstance";
import { useAuth } from "./AuthContext";

const IPOContext = createContext();

export const IPOProvider = ({ children }) => {
  const [ipos, setIpos] = useState([]);
  const [applications, setApplications] = useState([]);
  const [incomingShareRequests, setIncomingShareRequests] = useState([]);
  const [sharedIPOs, setSharedIPOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { loggedIn } = useAuth();

  const getAllIPO = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/ipo/get");
      // backend returns the array directly (res is already unwrapped by interceptor)
      setIpos(Array.isArray(res) ? res : []);
    } catch (error) {
      // silently ignore — user may not be logged in yet
    } finally {
      setLoading(false);
    }
  };

  const createIPO = async (data) => {
    try {
      await axiosInstance.post("/api/ipo/create", data);
      await getAllIPO();
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || "Failed to create IPO" };
    }
  };

  const updateIPO = async (id, data) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/ipo/update/${id}`, data);
      await getAllIPO();
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || "Failed to update IPO" };
    } finally {
      setLoading(false);
    }
  };

  const deleteIPO = async (id) => {
    try {
      await axiosInstance.delete(`/api/ipo/delete/${id}`);
      await getAllIPO();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchApplications = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/ipo/app/get");
      setApplications(res);
    } catch (error) {
      console.log(error);
    }
  };

  const applyForIPO = async (ipoId, apps, funderUserId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/ipo/app/apply", { ipoId, applications: apps, funderUserId });
      await fetchApplications();
      // Also refresh IPO list just in case
      await getAllIPO();
      return { success: true, message: res.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelApplication = async (appId) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/ipo/app/cancel/${appId}`);
      await fetchApplications();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, updates) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/ipo/app/status/${appId}`, updates);
      await fetchApplications();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomingShareRequests = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/ipo-share/incoming");
      if (res.success && res.requests) {
        setIncomingShareRequests(res.requests);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const respondToShareRequest = async (id, action) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/ipo-share/respond/${id}`, { action });
      await fetchIncomingShareRequests();
      await fetchSharedIPOs();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedIPOs = async () => {
    if (!loggedIn) return;
    try {
      const res = await axiosInstance.get("/api/ipo-share/shared-with-me");
      if (res.success && res.shares) {
        setSharedIPOs(res.shares);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { 
    if (loggedIn) {
      getAllIPO(); 
      fetchApplications();
      fetchIncomingShareRequests();
      fetchSharedIPOs();
    } else {
      setIpos([]);
      setApplications([]);
      setIncomingShareRequests([]);
      setSharedIPOs([]);
    }
  }, [loggedIn]);

  return (
    <IPOContext.Provider value={{ ipos, applications, loading, incomingShareRequests, sharedIPOs, getAllIPO, createIPO, updateIPO, deleteIPO, applyForIPO, cancelApplication, fetchApplications, updateStatus, fetchIncomingShareRequests, respondToShareRequest, fetchSharedIPOs }}>
      {children}
    </IPOContext.Provider>
  );
};

export const useIPO = () => useContext(IPOContext);

export default IPOContext;
