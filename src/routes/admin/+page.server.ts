import type {Actions, PageServerLoad} from "./$types";
import {getAdminByUsername} from "$lib/server/db";
import {createSessionToken, verifyPassword, verifySessionToken,} from "$lib/server/auth";
import {loginSchema} from "$lib/server/schemas";
import {fail, redirect} from "@sveltejs/kit";

export const load: PageServerLoad = async ({cookies}) => {
    // Check if user is already logged in by verifying session token
    const sessionToken = cookies.get("session");

    if (sessionToken) {
        const sessionData = await verifySessionToken(sessionToken);
        if (sessionData) {
            // User is already logged in, redirect to dashboard
            throw redirect(302, "/admin/dashboard");
        } else {
            // Invalid session, clear it
            cookies.delete("session", {path: "/"});
        }
    }

    return {};
};

export const actions: Actions = {
    login: async ({request, platform, cookies}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                username: formData.get("username")?.toString() || "",
                password: formData.get("password")?.toString() || "",
            };

            // Validate input
            const validation = loginSchema.safeParse(data);
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    username: data.username,
                });
            }

            // Check admin credentials
            const admin = await getAdminByUsername(platform.env.DB, data.username);
            if (!admin) {
                return fail(400, {
                    message: "Invalid username or password",
                    username: data.username,
                });
            }

            // Verify password
            const isValidPassword = await verifyPassword(
                data.password,
                admin.password_hash
            );
            if (!isValidPassword) {
                return fail(400, {
                    message: "Invalid username or password",
                    username: data.username,
                });
            }

            // Create session token
            const sessionToken = await createSessionToken(admin.id, admin.username);

            // Set cookie
            cookies.set("session", sessionToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            throw redirect(302, "/admin/dashboard");
        } catch (error) {
            if (error && typeof error === "object" && "status" in error) {
                throw error; // Re-throw redirect
            }
            console.error("Login error:", error);
            return fail(500, {message: "Login failed"});
        }
    },

    logout: async ({cookies}) => {
        cookies.delete("session", {path: "/"});
        throw redirect(302, "/admin");
    },
};
