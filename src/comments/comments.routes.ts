import { Elysia } from "elysia";
import { authSetup } from "../auth/setup";
import { CommentsController } from "./comments.controller";
import { CreateCommentSchema } from "./comments.schema";

export const commentsRoutes = new Elysia({ prefix: "/comments" })
    .use(authSetup)
    .post("/", CommentsController.create, { body: CreateCommentSchema })
    .get("/post/:postId", CommentsController.list);
