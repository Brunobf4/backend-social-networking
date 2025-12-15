import { t } from "elysia";

export const CreateCommentSchema = t.Object({
    content: t.String({ minLength: 1, maxLength: 500 }),
    postId: t.String()
});
