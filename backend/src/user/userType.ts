import { JwtPayload } from "jsonwebtoken";

export interface IUser extends Document {
  _id?: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;

  // Methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
export interface CustomJwtPayload extends JwtPayload {
  _id: string;
}
