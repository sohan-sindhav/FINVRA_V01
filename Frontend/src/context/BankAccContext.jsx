import { createContext, useState, useEffect, useContext, useMemo } from "react";
import axiosInstance from "../configs/AxiosInstance.js";

export const BankAccContext = createContext();

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MIN_BREACH_DAYS = 10;

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
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Create account
  const createBankAcc = async (data) => {
    try {
      const res = await axiosInstance.post("/api/bank/account/create", data);
      await getBankAcc();
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
        transactionType: "transfer",
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

  // Accounts that have been continuously below their minimum balance for 10+ days
  const minBalanceWarnings = useMemo(() => {
    const now = Date.now();
    return bankAccounts.filter((acc) => {
      if (acc.isZeroBalance || !acc.minBalanceBreachSince) return false;
      const breachMs = now - new Date(acc.minBalanceBreachSince).getTime();
      return breachMs >= MIN_BREACH_DAYS * MS_PER_DAY;
    });
  }, [bankAccounts]);

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
        minBalanceWarnings,
      }}
    >
      {children}
    </BankAccContext.Provider>
  );
};

export const useBankAccounts = () => {
  return useContext(BankAccContext);
};
