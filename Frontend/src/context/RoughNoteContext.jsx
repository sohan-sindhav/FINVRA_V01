import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../configs/AxiosInstance";
import { useAuth } from "./AuthContext";

const RoughNoteContext = createContext();

export const RoughNoteProvider = ({ children }) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const { loggedIn } = useAuth();

  const fetchPersons = async () => {
    if (!loggedIn) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/rough-notes/persons");
      setPersons(res);
    } catch (error) {
      console.error("Failed to fetch rough note persons:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (name) => {
    try {
      await axiosInstance.post("/api/rough-notes/person", { name });
      await fetchPersons();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updatePersonNotes = async (personId, notes) => {
    try {
      await axiosInstance.put(`/api/rough-notes/person/${personId}/notes`, { notes });
      await fetchPersons();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deletePerson = async (personId) => {
    try {
      await axiosInstance.delete(`/api/rough-notes/person/${personId}`);
      await fetchPersons();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const addEntry = async (data) => {
    try {
      await axiosInstance.post("/api/rough-notes/entry", data);
      await fetchPersons();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      await axiosInstance.delete(`/api/rough-notes/entry/${entryId}`);
      await fetchPersons();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const getHistory = async (personId) => {
    try {
      const res = await axiosInstance.get(`/api/rough-notes/history/${personId}`);
      return res;
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return [];
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchPersons();
    } else {
      setPersons([]);
    }
  }, [loggedIn]);

  return (
    <RoughNoteContext.Provider value={{ 
      persons, 
      loading, 
      addPerson, 
      deletePerson, 
      addEntry, 
      deleteEntry, 
      getHistory, 
      fetchPersons,
      updatePersonNotes
    }}>
      {children}
    </RoughNoteContext.Provider>
  );
};

export const useRoughNote = () => useContext(RoughNoteContext);

export default RoughNoteContext;
