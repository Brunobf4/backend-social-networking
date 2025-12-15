import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./auth/auth.routes";
import { postsRoutes } from "./posts/posts.routes";

import { commentsRoutes } from "./comments/comments.routes";
import { moderationService } from "./ml/moderation.service";

export const app = new Elysia()
  .use(rateLimit({
    duration: 60000,
    max: 100
  }))
  .use(swagger())
  .use(authRoutes)
  .use(postsRoutes)
  .use(commentsRoutes)
  .onStart(async () => {
    console.log("Initializing ML Model...");
    await moderationService.init();
  })
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
