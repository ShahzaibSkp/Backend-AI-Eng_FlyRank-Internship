import { imageTagsSchema } from "./schemas.js";

const demoTags = {
  fox: { subject: "red fox", category: "animal", attributes: ["orange fur", "wild", "forest"], caption: "A red fox standing in a forest", confidence: 0.94 },
  wolf: { subject: "gray wolf", category: "animal", attributes: ["gray fur", "wild", "forest"], caption: "A gray wolf in a forest", confidence: 0.93 },
  dog: { subject: "dog", category: "animal", attributes: ["domestic", "brown fur", "outdoors"], caption: "A domestic dog outdoors", confidence: 0.91 },
  bear: { subject: "brown bear", category: "animal", attributes: ["brown fur", "wild", "mountains"], caption: "A brown bear in the mountains", confidence: 0.9 },
  deer: { subject: "deer", category: "animal", attributes: ["antlers", "wild", "grassland"], caption: "A deer standing in grassland", confidence: 0.89 },
  uncertain: { subject: "uncertain object", category: "unknown", attributes: [], caption: "An image that needs human review", confidence: 0.42 }
};

const demoSubjectAliases = {
  wolves: "wolf",
  foxes: "fox",
  dogs: "dog",
  bears: "bear",
  deer: "deer"
};

export class DemoVisionProvider {
  async classify(image) {
    const rawKey = (image.demoSubject || image.title || "").toLowerCase().trim();
    const key = demoSubjectAliases[rawKey] || rawKey;
    const match = Object.entries(demoTags).find(([name]) => key.includes(name));
    return imageTagsSchema.parse(match?.[1] || demoTags.uncertain);
  }
}

export class GeminiVisionProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async classify(image) {
    if (!this.apiKey) throw new Error("GEMINI_API_KEY is required for the Gemini vision provider");
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) throw new Error(`Image download failed with HTTP ${imageResponse.status}`);
    const contentType = imageResponse.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    if (!contentType.startsWith("image/")) throw new Error(`Image URL returned unsupported content type: ${contentType}`);
    const imageData = Buffer.from(await imageResponse.arrayBuffer()).toString("base64");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Return only JSON with subject, category, attributes, caption, confidence. Confidence must be 0 to 1." },
            { inlineData: { mimeType: contentType, data: imageData } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    if (!response.ok) throw new Error(`Gemini classification failed with HTTP ${response.status}`);
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no structured classification");
    return imageTagsSchema.parse(JSON.parse(text));
  }
}
