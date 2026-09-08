import { createOpenAI } from "@ai-sdk/openai";

export function createFireworksProvider() {
  return createOpenAI({
    apiKey: process.env["FIREWORKS_API_KEY"] || "",
    baseURL: "https://api.fireworks.ai/v1",
  });
}
