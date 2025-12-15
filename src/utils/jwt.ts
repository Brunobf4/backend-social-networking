// Currently using @elysiajs/jwt plugin within the request context.
// This utility is reserved for standalone JWT operations if needed.

export const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key";

// If manual signing is needed later, we can implement it here.
// For now, we rely on the plugin for request handling.
