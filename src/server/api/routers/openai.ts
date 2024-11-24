import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiRouter = createTRPCRouter({
  getStructuredData: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .query(async ({ input }) => {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: input.prompt }],
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      // We tell the AI to return object with keys like "en" or "es", so z.record(z.string())
      const zodAIResponse = z.object({
        data: z.array(z.object({
          indonesian: z.string(),
          english: z.string(),
        })),
      });
      return zodAIResponse.parse(JSON.parse(completion.choices[0]?.message?.content ?? "{}"));
    }),
});
