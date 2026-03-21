import { createContext, useEffect, useContext, useState } from "react";
import axiosInstance from "../configs/axiosInstance";
import axios from "axios";

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionsNumber, setConnectionsNumber] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConnectionid, setEditingConnectionid] = useState(null);

  useEffect(() => {
    setConnectionsNumber(connections.length);
  }, [connections]);

  const createConnection = async (name, mobile) => {
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/connections/create", {
        name,
        mobile,
      });
      console.log(response.data);
      setShowModal(false);
      getConnections();
    } catch (err) {
      setError(error.response.data.message || "something went wrong");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getConnections = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/connections/get");
      console.log("full response:", response);
      setConnections(response.connections);
      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      setLoading(false);
    }
  };

  const deleteConnections = async (connectionid) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(
        `/api/connections/delete/${connectionid}`,
      );
      getConnections();
      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      setLoading(false);
    }
  };

  const editConnections = async (name) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/api/connections/edit/${editingConnectionid}`,
        { name },
      );
      setShowEditModal(false);
      getConnections();
      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      setLoading(false);
      setShowEditModal(false);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        showModal,
        setShowModal,
        Loading,
        setLoading,
        getConnections,
        createConnection,
        connectionsNumber,
        deleteConnections,
        setShowEditModal,
        showEditModal,
        editingConnectionid,
        setEditingConnectionid,
        editConnections,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnections = () => {
  return useContext(ConnectionContext);
};
