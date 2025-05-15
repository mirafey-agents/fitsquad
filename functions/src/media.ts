import {onCall, HttpsError} from "firebase-functions/v2/https";
import {verifySupabaseToken} from "./auth";
import {storageBucket} from "./fs";
import * as crypto from "crypto";
import { getRole } from "./supabase";
import * as sharp from 'sharp';

const makeKey = (
  userId: string, category: string,
  categoryId: string, objectId = "",
  isThumbnail = false
) => {
  if (!["profilepic", "session", "challenge", "habit"].includes(category)) {
    throw new HttpsError("invalid-argument", "Invalid category");
  }

  objectId = objectId || crypto.randomUUID();

  if (category === "profilepic") {
    categoryId = "1";
    objectId = "1";
  }

  return `media/${userId}/${category}/${categoryId}/${objectId}${isThumbnail ? "-thumbnail": ""}`;
};

export const getUploadUrl = onCall(
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, mimeType, userId, category, categoryId} = request.data;

      if (!authToken || !mimeType || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Supabase JWT
      const {userId: authUId, error} = verifySupabaseToken(authToken);
      if (error) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const role = await getRole(authUId);
      if (authUId !== userId && role !== "trainer") {
        throw new HttpsError("permission-denied", "User not permitted to upload media");
      }

      // Create a reference to the storage service
      const key = makeKey(userId, category, categoryId);
      const mediaId = key.split("/").pop();
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

      return { url, mediaId };
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const processUploadedMedia = onCall(
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId, mediaId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Supabase JWT
      const {userId: authUId, error} = verifySupabaseToken(authToken);
      if (error) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const role = await getRole(authUId);
      if (authUId !== userId && role !== "trainer") {
        throw new HttpsError("permission-denied", "User not permitted to upload media");
      }

      // Get the original file
      const originalKey = makeKey(userId, category, categoryId, mediaId);
      const originalFile = storageBucket.file(originalKey);
      const [originalBuffer] = await originalFile.download();

      // Generate thumbnail
      const thumbnailBuffer = await sharp(originalBuffer)
        .resize(150, 150, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail
      const thumbnailKey = makeKey(userId, category, categoryId, mediaId, true);
      const thumbnailFile = storageBucket.file(thumbnailKey);
      await thumbnailFile.save(thumbnailBuffer, {
        contentType: 'image/jpeg',
        public: true,
        metadata: {
          cacheControl: 'public, max-age=18000'
        }
      });

      return { success: true };
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
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId, objectId, isThumbnail = false} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Supabase JWT
      const {userId: authUId, error} = verifySupabaseToken(authToken);
      if (error) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const role = await getRole(authUId);
      if (authUId !== userId && role !== "trainer") {
        throw new HttpsError("permission-denied", "User not permitted to upload media");
      }

      // Create a reference to the storage service
      const key = makeKey(userId, category, categoryId, objectId, isThumbnail);
      const file = storageBucket.file(key);

      // Generate a signed URL for fetching
      const options = {
        version: "v4",
        action: "read",
        expires: Date.now() + 5 * 60 * 1000, // URL valid for 5 minutes
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
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Sought (in promise)pabase JWT
      const {userId: authUId, error} = verifySupabaseToken(authToken);
      if (error) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const role = await getRole(authUId);
      if (authUId !== userId && role !== "trainer") {
        throw new HttpsError("permission-denied", "User not permitted to upload media");
      }

      // Create a reference to the storage service
      const prefix = `media/${userId}/${category}/${categoryId}/`;
      const [files] = await storageBucket.getFiles({prefix});

      return files
      .filter((key: any) => !key.name.endsWith("-thumbnail"))
      .map((key: any) => {
        return {
          mediaId: key.name.split("/").pop(),
          thumbnail_url: `https://storage.googleapis.com/${storageBucket.name}/${key.name}-thumbnail`,
        };
      });
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
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId, objectId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Sought (in promise)pabase JWT
      const {userId: authUId, error} = verifySupabaseToken(authToken);
      if (error) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const role = await getRole(authUId);
      if (authUId !== userId && role !== "trainer") {
        throw new HttpsError("permission-denied", "User not permitted to upload media");
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

export const deleteMedia = onCall(
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, userId, category, categoryId, objectId} = request.data;

      if (!authToken || !userId) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // Verify Sought (in promise)pabase JWT
      const {userId: authUId, error} = verifySupabaseToken(authToken);
      if (error) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const role = await getRole(authUId);
      if (authUId !== userId && role !== "trainer") {
        throw new HttpsError("permission-denied", "User not permitted to upload media");
      }

      // Create a reference to the storage service
      const key = makeKey(userId, category, categoryId, objectId);
      await storageBucket.deleteFiles({prefix: key});
  
      return { success: true };
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);
