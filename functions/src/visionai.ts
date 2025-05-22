import {GoogleGenAI} from "@google/genai";

export const analyzeMedia = async (imageData: string) => {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: "fit-squad-club",
    location: "us-central1",
  });
  const contents = [
    {
      role: "user",
      parts: [
        {text: "Evaluate this workout in under 300 words and rate it on 1-5."},
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
    // console.log(response.candidates?.[0]?.content);

    return response.candidates?.[0]?.content?.parts?.[0]?.text ?? "N/A";
  } catch (error) {
    console.error(error);
  }

  return "N/A";
};
