import { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../configs/axiosInstance";
import { useAuth } from "./authcontext";

export const PanContext = createContext();

export const PanProvider = ({ children }) => {
  const [panCards, setPanCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const { loggedIn } = useAuth();

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
        message: error.response?.data?.message || "Failed to add PAN card" 
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
        message: error.response?.data?.message || "Failed to delete PAN card" 
      };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      getPanCards();
    } else {
      setPanCards([]);
    }
  }, [loggedIn]);

  return (
    <PanContext.Provider
      value={{
        panCards,
        loading,
        getPanCards,
        addPanCard,
        deletePanCard,
      }}
    >
      {children}
    </PanContext.Provider>
  );
};

export const usePan = () => {
  return useContext(PanContext);
};
