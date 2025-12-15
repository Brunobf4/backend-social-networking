import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/hash";
import type { Static } from "elysia";
import type { SignUpSchema, SignInSchema } from "./auth.schema";

export const AuthService = {
    async signUp(data: Static<typeof SignUpSchema>) {
        const { username, email, password } = data;
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });
        if (existingUser) throw new Error("Username or email already exists");

        const password_hash = await hashPassword(password);
        return prisma.user.create({
            data: { username, email, password_hash },
        });
    },

    async validateUser(data: Static<typeof SignInSchema>) {
        const { username, password } = data;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return null;

        return user;
    }
};
