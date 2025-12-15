import { describe, expect, it, mock } from "bun:test";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

// Mock Prisma
mock.module("../src/lib/prisma", () => ({
    prisma: {
        comment: {
            create: mock(),
            findMany: mock(),
        },
        post: {
            findUnique: mock()
        },
        user: {
            findUnique: mock()
        }
    },
}));

import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

// Helper to generate a token
const createToken = async (payload: any) => {
    const setup = new Elysia()
        .use(jwt({
            name: "jwt",
            secret: "super-secret-dev-key"
        }))
        .get('/sign', async ({ jwt }) => {
            return await jwt.sign(payload);
        });

    const res = await setup.handle(new Request('http://localhost/sign'));
    return await res.text();
};

describe("Comments", () => {
    it("should create a comment when authenticated and post exists", async () => {
        const token = await createToken({ sub: "user-123", username: "tester" });
        const postId = "post-123";

        (prisma.post.findUnique as any).mockResolvedValue({ id: postId });
        (prisma.comment.create as any).mockResolvedValue({
            id: "comment-1",
            content: "Nice post!",
            postId: postId,
            authorId: "user-123",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const response = await app.handle(
            new Request("http://localhost/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: "Nice post!", postId })
            })
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.content).toBe("Nice post!");
        expect(body.authorId).toBe("user-123");
    });

    it("should return 404 if post does not exist", async () => {
        const token = await createToken({ sub: "user-123", username: "tester" });
        const postId = "non-existent";

        (prisma.post.findUnique as any).mockResolvedValue(null);

        const response = await app.handle(
            new Request("http://localhost/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: "Nice post!", postId })
            })
        );

        expect(response.status).toBe(404);
    });

    it("should list comments for a post", async () => {
        const postId = "post-123";

        (prisma.comment.findMany as any).mockResolvedValue([
            {
                id: "comment-1",
                content: "First Comment",
                author: { username: "tester" },
                postId
            }
        ]);

        const response = await app.handle(
            new Request(`http://localhost/comments/post/${postId}`)
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toBeArray();
        expect(body[0].content).toBe("First Comment");
    });
});
