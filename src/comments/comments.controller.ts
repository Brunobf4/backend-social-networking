import { CommentsService } from "./comments.service";

export const CommentsController = {
    create: async ({ body, jwt, set, headers }: any) => {
        const authHeader = headers['authorization'];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) { set.status = 401; return 'Unauthorized'; }

        const profile = await jwt.verify(token);
        if (!profile) { set.status = 401; return 'Unauthorized'; }

        const userId = profile.sub as string;

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
