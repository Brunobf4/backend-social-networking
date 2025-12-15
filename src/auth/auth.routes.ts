import { Elysia } from "elysia";
import { authSetup } from "./setup";
import { AuthController } from "./auth.controller";
import { SignUpSchema, SignInSchema } from "./auth.schema";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .use(authSetup)
    .post("/sign-up", AuthController.signUp, { body: SignUpSchema })
    .post("/sign-in", AuthController.signIn, { body: SignInSchema })
    .get("/profile", AuthController.getProfile);
