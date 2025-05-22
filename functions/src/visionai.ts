import {GoogleGenAI} from "@google/genai";
import {getAdmin} from "./supabase";
import {HttpsError, onCall} from "firebase-functions/https";
import {verifySupabaseToken} from "./auth";

export const analyzeMedia = async (
  userId: string,
  sessionId: string,
  mediaId: string,
  imageData: string) => {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: "fit-squad-club",
    location: "us-central1",
  });
  const contents = [
    {
      role: "user",
      parts: [
        {text: "Review this workout in under 300 words and rate it on 1-5."},
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-001",
      contents: contents,
    });
    console.log(response.candidates?.[0]?.content);

    const {data, error: insertError} = await getAdmin()
      .from("media_reviews")
      .insert({
        user_id: userId,
        session_id: sessionId,
        media_id: mediaId,
        review: response.candidates?.[0]?.content ?? "N/A",
      });
    console.log(data);
    if (insertError) {
      console.log(insertError);
    }
    // Process the result
  } catch (error) {
    console.error(error);
  }
};

export const getSessionMediaReview = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    const {authToken, userId, sessionId} = request.data;
    if (!authToken || !userId || !sessionId) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    const {userId: authUId, error} = verifySupabaseToken(authToken);
    if (error) throw error;
    if (authUId !== userId) {
      throw new HttpsError(
        "permission-denied",
        "User does not have permission to access this resource");
    }

    const {data, error: fetchError} = await getAdmin()
      .from("media_reviews")
      .select("media_id, review")
      .eq("user_id", userId)
      .eq("session_id", sessionId);

    if (fetchError) throw fetchError;

    return data;
  }
);
