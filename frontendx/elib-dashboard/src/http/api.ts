import axios, { AxiosResponse } from "axios";
import useTokenStore from "@/store";
import { Book } from "@/types";
import { PaginatedResponse } from "@/pages/BooksPage";
const api = axios.create({
  baseURL: "http://localhost:7000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const totalbooks = async (): Promise<number> => {
  const response: AxiosResponse<{ count: number }> = await api.get(
    "/api/books/count"
  );
  return response.data.count;
};
export const login = async (data: { email: string; password: string }) =>
  api.post("/api/users/login", data);

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/api/users/register", data);

export const getBooks = async (
  skip: number,
  limit: number
): Promise<PaginatedResponse<Book>> => {
  const response: AxiosResponse<PaginatedResponse<Book>> = await api.get(
    "/api/books",
    {
      params: {
        type: "all",
        limit,
        skip,
      },
    }
  );
  return response.data;
};
export const getBooksAuthor = async (
  skip: number = 0,
  limit: number,
  loadMore: boolean = true
): Promise<PaginatedResponse<Book>> => {
  const response: AxiosResponse<PaginatedResponse<Book>> = await api.get(
    "/api/books",
    {
      params: {
        type: "user",
        limit,
        skip,
        loadMore,
      },
    }
  );
  console.log(response.data);
  return response.data;
};

export const createBook = async (data: FormData) => {
  return api.post("/api/books", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updateBook = async ({
  id,
  data,
}: {
  id: string;
  data: FormData;
}) => {
  return api.patch(`/api/books/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const deleteBook = async (bookId: string) => {
  return api.delete(`/api/books/${bookId}`);
};
export const getBook = async (id: string) => api.get(`/api/books/${id}`);
