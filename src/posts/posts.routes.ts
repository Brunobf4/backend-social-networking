import { Elysia } from "elysia";
import { authSetup } from "../auth/setup";
import { PostsController } from "./posts.controller";
import { CreatePostSchema, ListPostsQuerySchema } from "./posts.schema";

export const postsRoutes = new Elysia({ prefix: "/posts" })
    .use(authSetup)
    .post("/", PostsController.create, {
        body: CreatePostSchema,
        detail: { security: [{ jwt: [] }] }
    })
    .get("/", PostsController.list, { query: ListPostsQuerySchema });
