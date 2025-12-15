import { prisma } from "../lib/prisma";
import type { Static } from "elysia";
import type { CreateCommentSchema } from "./comments.schema";

export const CommentsService = {
    async createComment(userId: string, data: Static<typeof CreateCommentSchema>) {
        const post = await prisma.post.findUnique({ where: { id: data.postId } });
        if (!post) return null;

        return prisma.comment.create({
            data: {
                content: data.content,
                postId: data.postId,
                authorId: userId
            }
        });
    },

    async listComments(postId: string) {
        return prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { username: true } } }
        });
    }
};
