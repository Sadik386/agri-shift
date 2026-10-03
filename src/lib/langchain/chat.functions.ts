import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { executeAgrishiftChat, type ChatConfig, type ChatMessage } from "./agrishift-agent";

const chatInputSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
      timestamp: z.number(),
    }),
  ),
  provider: z.enum(["offline", "google", "openai"]).default("offline"),
  apiKey: z.string().optional(),
  modelName: z.string().optional(),
  temperature: z.number().optional(),
  districtId: z.string().optional(),
  lang: z.enum(["en", "bn"]).default("en"),
});

export type ChatRequest = z.infer<typeof chatInputSchema>;

export interface ChatResponse {
  ok: boolean;
  reply: string;
  providerUsed: string;
  error?: string | undefined;
}

/**
 * Server Function: executes the LangChain chain on the server.
 * Reads environment variables GEMINI_API_KEY / OPENAI_API_KEY if not explicitly provided by client.
 */
export const askAgriShiftServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => chatInputSchema.parse(input))
  .handler(async ({ data }): Promise<ChatResponse> => {
    try {
      let activeApiKey = data.apiKey;
      let activeProvider = data.provider;

      // Auto-detect server-side API keys if user didn't supply one
      if (!activeApiKey || activeApiKey.trim() === "") {
        const envGemini = process.env["GEMINI_API_KEY"];
        const envOpenAI = process.env["OPENAI_API_KEY"];
        if (envGemini) {
          activeApiKey = envGemini;
          if (activeProvider === "offline") activeProvider = "google";
        } else if (envOpenAI) {
          activeApiKey = envOpenAI;
          if (activeProvider === "offline") activeProvider = "openai";
        }
      }

      const config: ChatConfig = {
        provider: activeProvider,
        apiKey: activeApiKey ?? undefined,
        modelName: data.modelName ?? undefined,
        temperature: data.temperature ?? 0.3,
        districtId: data.districtId ?? undefined,
        lang: data.lang ?? undefined,
      };

      const reply = await executeAgrishiftChat(data.messages as ChatMessage[], config);

      return {
        ok: true,
        reply,
        providerUsed: activeProvider,
      };
    } catch (err) {
      console.error("Error in askAgriShiftServer:", err);
      // Fallback response so user never has an unhandled exception
      const fallbackReply = await executeAgrishiftChat(data.messages as ChatMessage[], {
        provider: "offline",
        districtId: data.districtId ?? undefined,
        lang: data.lang ?? undefined,
      });

      return {
        ok: true,
        reply: fallbackReply,
        providerUsed: "offline-fallback",
        error: err instanceof Error ? err.message : "Server error",
      };
    }
  });

/**
 * Universal helper to call the chatbot:
 * Attempts server function first; if offline or fails, executes locally in-browser!
 */
export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  try {
    const res = await askAgriShiftServer({ data: req });
    return res;
  } catch (err) {
    console.warn("Server call failed, running LangChain locally in client:", err);
    try {
      const config: ChatConfig = {
        provider: req.provider,
        apiKey: req.apiKey ?? undefined,
        modelName: req.modelName ?? undefined,
        temperature: req.temperature ?? undefined,
        districtId: req.districtId ?? undefined,
        lang: req.lang ?? undefined,
      };
      const reply = await executeAgrishiftChat(req.messages as ChatMessage[], config);
      return {
        ok: true,
        reply,
        providerUsed: req.provider,
      };
    } catch (localErr) {
      return {
        ok: false,
        reply:
          req.lang === "bn"
            ? "দুঃখিত, সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
            : "Sorry, an error occurred while processing your request. Please try again.",
        providerUsed: "error",
        error: localErr instanceof Error ? localErr.message : "Execution failed",
      };
    }
  }
}
