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
export interface BookCountResponse {
  count: number;
}

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const totalbooks = async (): Promise<BookCountResponse> => {
  const response: AxiosResponse<{ count: number }> = await api.get(
    "/api/books/count"
  );
  return response.data;
};
export const login = async (data: { email: string; password: string }) =>
  api.post("/api/users/login", data);

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/api/users/register", data);

export const getBooks = async (
  page: number,
  limit: number,
  search: string
): Promise<PaginatedResponse<Book>> => {
  try {
    const response: AxiosResponse<PaginatedResponse<Book>> = await api.get(
      "/api/books",
      {
        params: {
          type: "all",
          limit,
          page,
          search,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    if (!response.data) {
      throw new Error("Response data is empty");
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getBooksAuthor = async (
  page: number,
  limit: number,
  type: string,
  search: string
): Promise<PaginatedResponse<Book>> => {
  try {
    const response = await api.get<PaginatedResponse<Book>>("/api/books", {
      params: {
        page,
        limit,
        type,
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
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
