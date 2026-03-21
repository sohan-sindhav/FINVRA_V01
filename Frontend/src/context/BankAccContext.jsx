import { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../configs/AxiosInstance.js";

export const BankAccContext = createContext();

export const BankAccProvider = ({ children }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankHistory, setBankHistory] = useState([]);

  // Fetch accounts
  const getBankAcc = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/bank/account/get");

      setBankAccounts(res.bankacc);
    } catch (error) {
      // console.log("FULL ERROR:", error);
      // console.log("ERROR RESPONSE:", error?.response);
      // console.log("ERROR DATA:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Create account
  const createBankAcc = async (data) => {
    try {
      const res = await axiosInstance.post("/api/bank/account/create", data);
      await getBankAcc(); // refresh list
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  const deleteBankAcc = async (id) => {
    try {
      await axiosInstance.delete(`/api/bank/account/delete/${id}`);
      await getBankAcc();
    } catch (error) {
      console.log(error);
    }
  };

  const updateBalance = async (balance, id) => {
    try {
      await axiosInstance.post(
        `/api/bank/account/updateBalance/${id}`,
        balance,
      );

      await axiosInstance.post("/api/bank/account/BankHistory", {
        fromId: id,
        toId: id,
        amount: balance.balance,
        transactionType: "self_update",
      });
      await getBankHistory();
      return { success: true };
    } catch (error) {
      const msg = error?.message || "Failed to update balance";
      return { success: false, error: msg };
    }
  };
  const sendMoney = async (fromId, { toId, amount }) => {
    try {
      await axiosInstance.post(`/api/bank/account/sendMoney/${fromId}`, {
        toId,
        amount,
      });
      await createBankHistory(fromId, toId, amount);
      await getBankAcc();
      await getBankHistory();
      return { success: true };
    } catch (error) {
      const msg = error?.message || "Failed to send money";
      return { success: false, error: msg };
    }
  };

  const createBankHistory = async (fromId, toId, amount) => {
    try {
      await axiosInstance.post("/api/bank/account/BankHistory", {
        fromId,
        toId,
        amount,
        transactionType:"transfer",
      });
      console.log("bank history created");
      getBankHistory();
    } catch (error) {
      console.log(error);
    }
  };

  const getBankHistory = async () => {
    try {
      const res = await axiosInstance.get("/api/bank/account/BankHistory");
      setBankHistory(res.history);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const reverseBankHistory = async (id) => {
    try {
      await axiosInstance.post(`/api/bank/account/BankHistory/reverse/${id}`);
      await getBankAcc();
      await getBankHistory();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBankAcc();
    getBankHistory();
  }, []);

  return (
    <BankAccContext.Provider
      value={{
        bankAccounts,
        loading,
        createBankAcc,
        deleteBankAcc,
        getBankAcc,
        updateBalance,
        sendMoney,
        getBankHistory,
        createBankHistory,
        bankHistory,
        reverseBankHistory,
      }}
    >
      {children}
    </BankAccContext.Provider>
  );
};

export const useBankAccounts = () => {
  return useContext(BankAccContext);
};
