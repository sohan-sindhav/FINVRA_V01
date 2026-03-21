import { createContext, useEffect, useContext, useState } from "react";
import axiosInstance from "../configs/AxiosInstance";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
    getTransactions();
  }, []);
  return (
    <TransactionContext.Provider
      value={{
        transactions,
        createTransaction,
        setShowModal,
        showModal,
        deleteTransaction,
        reverseTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  return useContext(TransactionContext);
};
