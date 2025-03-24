import * as jwt from "jsonwebtoken";
import {config} from "firebase-functions";

interface SupabaseAuthJWT {
    aud: string;
    exp: number;
    sub: string; // This is the user's UUID in Supabase
    email?: string;
    role?: string;
  }

export const verifySupabaseToken = (token: string): any => {
  try {
    // Remove 'Bearer ' if present
    const cleanToken = token.replace("Bearer ", "");

    // Verify the JWT using Supabase JWT secret
    const decoded = jwt.verify(
      cleanToken,
      config().supabase.jwt_secret
    ) as SupabaseAuthJWT;

    // Check if token is expired
    if (Date.now() >= decoded.exp * 1000) {
      throw new Error("Token expired");
    }

    return {userId: decoded.sub, error: false};
  } catch (error) {
    console.error("Token verification failed:", error);
    return {error: true};
  }
};
