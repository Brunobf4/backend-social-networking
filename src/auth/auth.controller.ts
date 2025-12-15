import { AuthService } from "./auth.service";

export const AuthController = {
    signUp: async ({ body, error }: any) => {
        try {
            const user = await AuthService.signUp(body);
            return { id: user.id, username: user.username };
        } catch (e: any) {
            return error(400, e.message);
        }
    },

    signIn: async ({ body, jwt, error }: any) => {
        const user = await AuthService.validateUser(body);
        if (!user) return error(401, "Invalid credentials");

        const token = await jwt.sign({
            sub: user.id,
            username: user.username,
        });

        return {
            token,
            user: { id: user.id, username: user.username, email: user.email }
        };
    },

    getProfile: async ({ jwt, set, headers }: any) => {
        const authHeader = headers['authorization'];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            set.status = 401;
            return 'Unauthorized';
        }

        const profile = await jwt.verify(token);
        if (!profile) {
            set.status = 401;
            return 'Unauthorized';
        }

        return profile;
    }
};
