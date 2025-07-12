import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { generateEmbeddings, transcribeAudio } from "../../services/gemini.ts";
import { schema } from "../../db/schema/index.ts";
import { db } from "../../db/connection.ts";

export const uploadAudioRoute: FastifyPluginCallbackZod = async (app) => {
  app.post(
    "/rooms/:roomId/audio",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { roomId } = req.params;
      const audio = await req.file();

      if (!audio) {
        throw new Error("É necessário enviar um audio.");
      }

      const audioBuffer = await audio.toBuffer();
      const audioAsBase64 = await audioBuffer.toString("base64");

      const transcription = await transcribeAudio(
        audioAsBase64,
        audio.mimetype
      );
      const embeddings = await generateEmbeddings(transcription);

      const result = await db
        .insert(schema.audioChunks)
        .values({
          roomId,
          transcription,
          embeddings,
        })
        .returning();

      const chunk = result[0];

      if (!chunk) {
        throw new Error("Erro ao salvar chunk de audio.");
      }

      return res.status(201).send({ chunkId: chunk.id });
    }
  );
};
