import type { AxiosResponse } from "axios";
import axios from "../lib/axios";

export const fetchTransactions = async (
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get("/transactions", {
    params: { page, limit, search },
  });
  return res.data;
};

export const fetchTransactionsNotYet = async (
  page: number,
  limit: number,
  status: string,
  search: string
) => {
  const note = encodeURIComponent(status);
  const res = await axios.get(`/transactions/status/${note}`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const GetTransactionsHK = async (
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get(`/transactions/hk/status`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const GetTransactionsByPostInspection = async (
  postInspection: boolean,
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get(`/transactions/hk/post-inspection`, {
    params: { page, limit, search, postInspection },
  });
  return res.data;
};

export const fetchCustomer = async (
  page: number,
  pageSize: number,
  search: string
) => {
  const res = await axios.get(`/customers/duplicates`, {
    params: { page, pageSize, search },
  });
  return res.data;
};

export const fetchCustomersTransactionsSentEmail = async (
  page: number,
  limit: number,
  isSendEmail: boolean,
  search: string
) => {
  const res = await axios.get(`/customers/with-transactions-send-mail`, {
    params: { page, limit, isSendEmail, search },
  });
  return res.data;
};

export const fetchTransactionsOverdue = async (
  page: number,
  limit: number,
  search: string
) => {
  const status = encodeURIComponent("Quá hạn");
  const res = await axios.get(`/transactions/status/${status}`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const fetchTransactionsById = async (id: number) => {
  const res = await axios.get(`/transactions/${id}`);
  return res.data;
};

export const fetchTransactionsUpdateById = async (
  id: number,
  status: string,
  note: string
) => {
  try {
    const res = await axios.put(`/transactions/${id}`, {
      status,
      note,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const updateTransactionsKSVUpdateById = async (
  id: number,
  status: string,
  censored: boolean,
  note: string
) => {
  try {
    const res = await axios.put(`/transactions/ksv/${id}`, {
      status,
      censored,
      note_censored: note,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const updateTransactionsHKUpdateById = async (
  id: number,
  status: string,
  post_inspection: boolean,
  note: string
) => {
  try {
    const res = await axios.put(`/transactions/hk/${id}`, {
      status,
      post_inspection,
      note_inspection: note,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const uploadTransactionFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/transactions/upload-ipcas", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadCustomerFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/customers/upload-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadTransactionFileEmail = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/transactions/upload-customers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const reportExcel = async (status: string) => {
  const res: AxiosResponse = await axios.get(
    `/transactions/report/${encodeURIComponent(status)}`,
    {
      responseType: "blob",
    }
  );
  return res;
};

export const reportPostInspectionExcel = async (postInspection: boolean) => {
  const res: AxiosResponse = await axios.get(
    "/transactions/export/post-inspection",
    {
      params: { postInspection },
      responseType: "blob",
    }
  );
  return res;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await axios.post("/auth/login", data);
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}) => {
  const response = await axios.post("/auth/register", data);
  return response.data;
};

export const getConfigEmail = async () => {
  const response = await axios.get("/config-email");
  return response.data;
};

export const addConfigEmail = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axios.post("/config-email", data);
  return response.data;
};

export const updateConfigEmail = async (id: number, data: {
  email: string;
  password: string;
}) => {
  const response = await axios.put(`/config-email/${id}`, data);
  return response.data;
};

export const resendEmail = async (transactionId: number) => {
  const response = await axios.post('/customers/resend-email', { transactionId });
  return response.data;
};
