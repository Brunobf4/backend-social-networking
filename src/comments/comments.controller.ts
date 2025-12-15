import { CommentsService } from "./comments.service";
import { moderationService } from "../ml/moderation.service";

export const CommentsController = {
    create: async ({ body, jwt, set, headers }: any) => {
        const authHeader = headers['authorization'];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) { set.status = 401; return 'Unauthorized'; }

        const profile = await jwt.verify(token);
        if (!profile) { set.status = 401; return 'Unauthorized'; }

        const userId = profile.sub as string;

        // Moderation Check
        try {
            const isToxic = await moderationService.isToxic(body.content);
            if (isToxic) {
                set.status = 400;
                return { error: "Opa! Seu comentário viola nossas diretrizes de comunidade." };
            }
        } catch (e) {
            console.error("Moderation check failed", e);
            // Optionally decide to fail open or closed. Failing open (allowing comment) for now to not block user on system error.
        }

        const comment = await CommentsService.createComment(userId, body);
        if (!comment) {
            set.status = 404;
            return "Post not found";
        }

        return comment;
    },

    list: async ({ params }: any) => {
        return CommentsService.listComments(params.postId);
    }
};
