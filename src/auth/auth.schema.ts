import { t } from "elysia";

export const SignUpSchema = t.Object({
    username: t.String(),
    password: t.String(),
    email: t.String({ format: 'email' }),
});

export const SignInSchema = t.Object({
    username: t.String(),
    password: t.String(),
});
