import { PostsService } from "./posts.service";

export const PostsController = {
    create: async ({ body, jwt, error, headers }: any) => {
        const authHeader = headers['authorization'];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) return error(401, 'Unauthorized');

        const profile = await jwt.verify(token);
        if (!profile) return error(401, 'Unauthorized');

        const userId = profile.sub as string;

        return PostsService.createPost(userId, body);
    },

    list: async ({ query }: any) => {
        const limit = Number(query.limit) || 20;
        return PostsService.listPosts(limit, query.cursor);
    }
};
