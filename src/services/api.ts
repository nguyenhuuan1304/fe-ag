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
