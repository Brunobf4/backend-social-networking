import { describe, expect, it, spyOn, mock } from "bun:test";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

// Mock Prisma
mock.module("../src/lib/prisma", () => ({
    prisma: {
        user: {
            findFirst: mock(),
            create: mock(),
            findUnique: mock(),
        },
    },
}));

describe("Authentication", () => {
    it("should sign up a new user", async () => {
        const newUser = {
            username: "testuser",
            email: "test@example.com",
            password: "password123",
        };

        // Mock findFirst to return null (user doesn't exist)
        (prisma.user.findFirst as any).mockResolvedValue(null);
        // Mock create to return the user
        (prisma.user.create as any).mockResolvedValue({
            id: "uuid-123",
            username: newUser.username,
            email: newUser.email,
            password_hash: "hashed_password",
        });

        const response = await app.handle(
            new Request("http://localhost/auth/sign-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            })
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("id");
        expect(body.username).toBe(newUser.username);
    });

    it("should sign in an existing user", async () => {
        const credentials = {
            username: "testuser",
            password: "password123",
        };

        // Use Bun.password.hash to generate a valid hash for verification logic if needed,
        // but since we are mocking the entire flow or need to match the logic:
        // The handler calls Bun.password.verify(password, user.password_hash)
        // We cannot easily mock Bun.password.verify without mocking the global, 
        // so let's rely on a real hash.
        const realHash = await Bun.password.hash("password123");

        (prisma.user.findUnique as any).mockResolvedValue({
            id: "uuid-123",
            username: "testuser",
            email: "test@example.com",
            password_hash: realHash,
        });

        const response = await app.handle(
            new Request("http://localhost/auth/sign-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            })
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("token");
        expect(body.user.username).toBe("testuser");
    });
});
