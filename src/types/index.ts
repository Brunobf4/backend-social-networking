export interface UserProfile {
    id: string;
    username: string;
    email?: string;
}

export interface JwtPayload {
    sub: string;
    username: string;
}
