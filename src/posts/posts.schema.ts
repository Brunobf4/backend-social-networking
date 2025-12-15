import { t } from "elysia";

export const CreatePostSchema = t.Object({
    content: t.String({ minLength: 1, maxLength: 280 }),
});

export const ListPostsQuerySchema = t.Object({
    limit: t.Optional(t.String()),
    cursor: t.Optional(t.String())
});
