import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function enhanceProductImage(base64Image: string, productName: string) {
  const prompt = `Enhance this seafood product image for a professional e-commerce website.
Requirements:
1. CLEAN BACKGROUND: Remove the dirty background and replace it with a pure white background.
2. IMAGE QUALITY: Upscale to 4K resolution, increase sharpness, clarity, lighting, and brightness. Enhance colors naturally.
3. PRODUCT FOCUS: Center the product, remove unnecessary shadows, and keep the realistic texture of frozen seafood.
4. REMOVE TEXT: Remove all text like price tags, names, or handwritten labels from the image.
5. STYLE: Make it look like a premium product catalog image with a soft shadow below the product. Clean, minimal, modern look.
Product: ${productName}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType: "image/jpeg",
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K" // Using 1K for now as it's standard, can go higher if needed but let's start here.
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
