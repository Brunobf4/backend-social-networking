import { describe, expect, it, mock } from "bun:test";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

// Mock Prisma
mock.module("../src/lib/prisma", () => ({
    prisma: {
        post: {
            create: mock(),
            findMany: mock(),
        },
        user: {
            findUnique: mock()
        }
    },
}));

// We need to bypass the JWT verification or mock it.
// Since `jwt` plugin verifies the token using the secret, we can generate a valid token 
// using the same secret if we can import it or use a default.
// The plugin uses process.env.JWT_SECRET || "super-secret-dev-key"

import { jwt } from "@elysiajs/jwt";

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

import { Elysia } from "elysia";

describe("Posts", () => {
    it("should create a post when authenticated", async () => {
        const token = await createToken({ sub: "user-123", username: "tester" });

        (prisma.post.create as any).mockResolvedValue({
            id: "post-1",
            content: "Hello World",
            authorId: "user-123",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const response = await app.handle(
            new Request("http://localhost/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: "Hello World" })
            })
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.content).toBe("Hello World");
        expect(body.authorId).toBe("user-123");
    });

    it("should list posts", async () => {
        (prisma.post.findMany as any).mockResolvedValue([
            {
                id: "post-1",
                content: "First Post",
                author: { username: "tester" }
            }
        ]);

        const response = await app.handle(
            new Request("http://localhost/posts")
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data).toBeArray();
        expect(body.data[0].content).toBe("First Post");
        expect(body.meta.hasNextPage).toBeFalse();
    });

    it("should handle pagination", async () => {
        // Mock finding 21 posts when limit is default 20
        const posts = Array.from({ length: 21 }, (_, i) => ({
            id: `post-${i}`,
            content: `Post ${i}`,
            author: { username: "tester" }
        }));
        (prisma.post.findMany as any).mockResolvedValue(posts);

        const response = await app.handle(
            new Request("http://localhost/posts?limit=20")
        );

        const body = await response.json();
        expect(body.data.length).toBe(20);
        expect(body.meta.hasNextPage).toBeTrue();
        expect(body.meta.nextCursor).toBe("post-20");
    });
});
