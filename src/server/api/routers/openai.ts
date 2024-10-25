import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import OpenAI from "openai";
import { languageListSchema } from "~/lib/languages";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiRouter = createTRPCRouter({
  getStructuredData: protectedProcedure
    .input(z.object({ prompt: z.string(), native_language: languageListSchema, foreign_language: languageListSchema }))
    .query(async ({ input }) => {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: input.prompt }],
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      // We tell the AI to return object with keys like "en" or "es", so z.record(z.string())
      const zodAIResponse = z.object({
        data: z.array(z.record(z.string())),
      });
      const chatCompletionResponse = zodAIResponse.parse(JSON.parse(completion.choices[0]?.message?.content ?? "{}"));
      const normalizedData = chatCompletionResponse.data.map((item) => {
        return {
          native_language: item[input.native_language],
          foreign_language: item[input.foreign_language],
        };
      });
      // We want to return a specific object shape, no dynamic keys
      const zodFormattedResponse = z.array(z.object({
          native_language: z.string(),
          foreign_language: z.string(),
        }));
      return zodFormattedResponse.parse(normalizedData);
    }),
});
