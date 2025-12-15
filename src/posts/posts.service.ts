import { prisma } from "../lib/prisma";
import type { Static } from "elysia";
import type { CreatePostSchema } from "./posts.schema";

export const PostsService = {
    async createPost(userId: string, data: Static<typeof CreatePostSchema>) {
        return prisma.post.create({
            data: {
                content: data.content,
                authorId: userId
            }
        });
    },

    async listPosts(limit: number, cursor?: string) {
        const posts = await prisma.post.findMany({
            take: limit + 1, // Fetch one extra to determine if there's a next page
            skip: cursor ? 1 : 0, // Skip the cursor itself if provided
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { username: true } } }
        });

        let nextCursor: string | null = null;
        if (posts.length > limit) {
            const nextItem = posts.pop(); // Remove the extra item
            nextCursor = nextItem!.id;
        }

        return {
            data: posts,
            meta: {
                nextCursor,
                hasNextPage: !!nextCursor
            }
        };
    }
};
