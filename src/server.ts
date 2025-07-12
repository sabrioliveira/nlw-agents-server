import { fastify } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";
import { sql } from "./db/connection.ts";
import { env } from "./env.ts";
import { getRoomsRoute } from "./http/routes/get-rooms.ts";
import { createRoomRoute } from "./http/routes/create-room.ts";
import { getRoomsQuestionsRoute } from "./http/routes/get-room-questions.ts";
import { createQuestionRoute } from "./http/routes/create-question.ts";
import { uploadAudioRoute } from "./http/routes/upload-audio.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "http://localhost:5173", //ou '*' pra aceitar qualquer endereço de frontend
});

app.register(fastifyMultipart);

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/health", () => {
  return "OK";
});

app.register(getRoomsRoute);
app.register(createRoomRoute);
app.register(getRoomsQuestionsRoute);
app.register(createQuestionRoute);
app.register(uploadAudioRoute);

app.listen({ port: env.PORT }).then(() => {
  console.log("🔥 HTTP server running!");
});
