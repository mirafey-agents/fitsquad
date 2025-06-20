import {GoogleGenAI} from "@google/genai";

export const analyzeMedia = async (mediaData: string, mimeType: string) => {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: "fit-squad-club",
    location: "us-central1",
  });

  const prompt = "Media analysis of a workout. < 300 words. " +
  "Professional, confident, encouraing tone." +
  "Analyse the form of the performer." +
  "Don't say 'here is the analysis', 'sure' etc. " +
  "Just output in this format: One line description, " +
  "up to 3 positive points, up to 3 required improvements. " +
  "Rating on 5. ";

  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType,
            data: mediaData,
          },
        },
        {text: prompt},
      ],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-001",
      contents: contents,
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text ?? "N/A";
  } catch (error) {
    console.error(error);
  }

  return "N/A";
};
