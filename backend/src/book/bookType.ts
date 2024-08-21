import { IUser } from "../user/userType";

export interface IBook extends Document {
  _id: string;
  title: string;
  description: string;
  author: IUser;
  genre: string;
  coverImage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface PaginatedBookResponse {
  items: IBook[];
  total: number;
  page: number;
  limit: number;
}
