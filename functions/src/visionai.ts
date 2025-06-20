import {GoogleGenAI} from "@google/genai";

export const analyzeMedia = async (mediaData: string, mimeType: string) => {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: "fit-squad-club",
    location: "us-central1",
  });

  const prompt = 'Analyze the workout media and provide a feedback under 300 words \
  in the following format while sounding confident & professional. \
  Directly provide the feedback without acknowledgement. \
  One line description, 3 positive points, 3 required improvements, rating on 5.';

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
