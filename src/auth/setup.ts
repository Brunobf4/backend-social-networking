import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authSetup = new Elysia({ name: "auth-setup" })
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET || "super-secret-dev-key",
        })
    );
