import {jwtVerify, SignJWT} from "jose";
import bcrypt from "bcryptjs";
import {env} from "$env/dynamic/private";

// Use environment variable for JWT secret
const getSecret = () => {
    const sessionSecret =
        env.SESSION_SECRET || "dev-secret-key-change-in-production";
    return new TextEncoder().encode(sessionSecret);
};

export interface SessionData {
    userId: number;
    username: string;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createSessionToken(
    userId: number,
    username: string
): Promise<string> {
    return new SignJWT({userId, username})
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecret());
}

export async function verifySessionToken(
    token: string
): Promise<SessionData | null> {
    try {
        const {payload} = await jwtVerify(token, getSecret());
        // Validate that payload has the required properties
        if (
            typeof payload.userId === "number" &&
            typeof payload.username === "string"
        ) {
            return {
                userId: payload.userId,
                username: payload.username,
            };
        }
        return null;
    } catch {
        return null;
    }
}

export function createSessionCookie(token: string): string {
    return `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
        7 * 24 * 60 * 60
    }`;
}

export function clearSessionCookie(): string {
    return "session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
}
