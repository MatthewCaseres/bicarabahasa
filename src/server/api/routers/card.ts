import { getVercelOidcToken } from "@vercel/functions/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { Storage } from "@google-cloud/storage";
import { env } from "~/env";

const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

// Initialize the External Account Client
const authClient = ExternalAccountClient.fromJSON({
  type: "external_account",
  audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
  token_url: "https://sts.googleapis.com/v1/token",
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    getSubjectToken: getVercelOidcToken,
  },
})!;

const storage = new Storage({
  authClient,
});

const bucket = storage.bucket(env.GOOGLE_CLOUD_BUCKET_NAME);

async function generateAudio(text: string, voice: string) {
  const response = await fetch(
    `https://api.narakeet.com/text-to-speech/m4a?voice=${voice}`,
    {
      method: "POST",
      headers: {
        accept: "application/octet-stream",
        "x-api-key": env.NARAKEET_API_KEY,
        "content-type": "text/plain",
      },
      body: text,
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const audioData = await response.arrayBuffer();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.m4a`;
  const file = bucket.file(filename);
  try {
    await file.save(Buffer.from(audioData), {
      contentType: "audio/x-m4a",
    });
  } catch (error) {
    console.error("Error saving audio file to gcp:", error);
  }

  return `https://storage.googleapis.com/${env.GOOGLE_CLOUD_BUCKET_NAME}/${filename}`;
}

export const cardRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.card.findMany({
        where: { deckId: input.deckId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.card.findUnique({
        where: { id: input.id },
      });
    }),

  getUserReviewCards: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.card.findMany({
      where: {
        userCards: {
          some: {
            userId: ctx.session.user.id,
            nextReview: { lte: new Date() },
          },
        },
      },
      include: {
        userCards: true,
      },
    });
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        english: z.string().min(1),
        indonesian: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [englishAudioUrl, indonesianAudioUrl] = await Promise.all([
        generateAudio(input.english, "matt"),
        generateAudio(input.indonesian, "abyasa"),
      ]);
      return ctx.db.card.update({
        where: { id: input.id },
        data: {
          english: input.english,
          indonesian: input.indonesian,
          englishAudioUrl,
          indonesianAudioUrl,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.card.delete({
        where: { id: input.id },
      });
    }),

  createMany: adminProcedure
    .input(
      z.object({
        cards: z.array(
          z.object({
            english: z.string().min(1),
            indonesian: z.string().min(1),
          }),
        ),
        deckId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cardsWithAudio = await Promise.all(
        input.cards.map(async (card) => {
          const [englishAudioUrl, indonesianAudioUrl] = await Promise.all([
            generateAudio(card.english, "matt"), // English voice
            generateAudio(card.indonesian, "abyasa"), // Indonesian voice
          ]);

          return {
            english: card.english,
            indonesian: card.indonesian,
            deckId: input.deckId,
            createdById: ctx.session.user.id,
            englishAudioUrl,
            indonesianAudioUrl,
          };
        }),
      );

      return ctx.db.card.createMany({
        data: cardsWithAudio,
      });
    }),
});
