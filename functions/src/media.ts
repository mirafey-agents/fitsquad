import {onCall, HttpsError} from "firebase-functions/v2/https";
import {verifySupabaseToken} from "./auth";
import {storageBucket} from "./fs";
import * as crypto from "crypto";

const makeKey = (
  userId: string, category: string,
  categoryId: string, objectId = ""
) => {
  if (!["profilepic", "session", "challenge", "habit"].includes(category)) {
    throw new HttpsError("invalid-argument", "Invalid category");
  }

  objectId = objectId || crypto.randomUUID();

  if (category === "profilepic") {
    categoryId = "1";
    objectId = "1";
  }

  return `media/${userId}/${category}/${categoryId}/${objectId}`;
};

export const getUploadUrl = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, mimeType, userId, category, categoryId} = request.data;

      if (!authToken || !mimeType || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Sught (in promise)pabase JWT
      const {userId: authUId, error, role} = verifySupabaseToken(authToken);
      if (error || (authUId !== userId && role !== "trainer")) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      console.log(authUId, userId, category, categoryId, mimeType);
      // Create a reference to the storage service
      const key = makeKey(userId, category, categoryId);
      const file = storageBucket.file(key);

      // Generate a signed URL for uploading
      const options = {
        version: "v4",
        action: "write",
        expires: Date.now() + 1 * 60 * 1000,
        contentType: mimeType,
        extensionHeaders: {
          "x-goog-content-length-range": "0,20000000",
        },
      };

      const [url] = await file.getSignedUrl(options as any);

      return url;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const getMediaFetchUrl = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId, objectId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Supabase JWT
      const {userId: authUId, error, role} = verifySupabaseToken(authToken);
      if (error || (authUId !== userId && role !== "trainer")) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Create a reference to the storage service
      const key = makeKey(userId, category, categoryId, objectId);
      const file = storageBucket.file(key);

      // Generate a signed URL for fetching
      const options = {
        version: "v4",
        action: "read",
        expires: Date.now() + 5 * 60 * 1000, // URL valid for 1 minute
      };

      const [url] = await file.getSignedUrl(options as any);

      return url;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const listMedia = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Supabase JWT
      const {userId: authUId, error, role} = verifySupabaseToken(authToken);
      if (error || (authUId !== userId && role !== "trainer")) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Create a reference to the storage service
      const prefix = `media/${userId}/${category}/${categoryId}/`;
      const [files] = await storageBucket.getFiles({prefix});

      return files.map((key: any) => key.name.split("/").pop());
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const getMedia = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId, objectId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Supabase JWT
      const {userId: authUId, error, role} = verifySupabaseToken(authToken);
      if (error || (authUId !== userId && role !== "trainer")) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Create a reference to the storage service
      const key = makeKey(userId, category, categoryId, objectId);
      const file = storageBucket.file(key);
      const data = await file.download();
      return data[0];
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);
