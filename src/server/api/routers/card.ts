import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Storage } from '@google-cloud/storage';
import { env } from "~/env";

const storage = new Storage();
const bucket = storage.bucket(env.GOOGLE_CLOUD_BUCKET_NAME);

async function generateAudio(text: string, voice: string) {
  const response = await fetch(
    `https://api.narakeet.com/text-to-speech/m4a?voice=${voice}`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/octet-stream',
        'x-api-key': env.NARAKEET_API_KEY,
        'content-type': 'text/plain'
      },
      body: text
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const audioData = await response.arrayBuffer();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.m4a`;
  const file = bucket.file(filename);
  
  await file.save(Buffer.from(audioData), {
    contentType: 'audio/x-m4a',
  });

  return `https://storage.googleapis.com/${env.GOOGLE_CLOUD_BUCKET_NAME}/${filename}`;
}

export const cardRouter = createTRPCRouter({

  getAll: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.card.findMany({
        where: { deckId: input.deckId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.card.findUnique({
        where: { id: input.id },
      });
    }),
  
  getByDeckId: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.card.findMany({
        where: { deckId: input.deckId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      english: z.string().min(1),
      indonesian: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.card.update({
        where: { id: input.id },
        data: { 
          english: input.english,
          indonesian: input.indonesian,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.card.delete({
        where: { id: input.id },
      });
    }),

  createMany: protectedProcedure
    .input(z.object({
      cards: z.array(z.object({
        english: z.string().min(1),
        indonesian: z.string().min(1),
      })),
      deckId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const cardsWithAudio = await Promise.all(
        input.cards.map(async (card) => {
          const [englishAudioUrl, indonesianAudioUrl] = await Promise.all([
            generateAudio(card.english, 'matt'),  // English voice
            generateAudio(card.indonesian, 'abyasa')  // Indonesian voice
          ]);

          return {
            english: card.english,
            indonesian: card.indonesian,
            deckId: input.deckId,
            createdById: ctx.session.user.id,
            englishAudioUrl,
            indonesianAudioUrl,
          };
        })
      );

      return ctx.db.card.createMany({
        data: cardsWithAudio,
      });
    }),
});
