import { createContext, useEffect, useContext, useState } from "react";
import axiosInstance from "../configs/AxiosInstance";
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
      console.log(response);
      setShowModal(false);
      getConnections();
    } catch (err) {
      setError(err.message || "something went wrong");
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
    } catch (error) {
      setError(error.message || "Failed to fetch connections");
    } finally {
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
    } catch (error) {
      setError(error.message || "Failed to delete connection");
    } finally {
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
    } catch (error) {
      setError(error.message || "Failed to edit connection");
      setShowEditModal(false);
    } finally {
      setLoading(false);
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
