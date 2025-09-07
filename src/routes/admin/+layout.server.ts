import type {LayoutServerLoad} from "./$types";
import {verifySessionToken} from "$lib/server/auth";
import {redirect} from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({cookies, url}) => {
    // Skip authentication check for the login page itself
    if (url.pathname === "/admin") {
        return {};
    }

    const sessionToken = cookies.get("session");

    if (!sessionToken) {
        throw redirect(302, "/admin");
    }

    const sessionData = await verifySessionToken(sessionToken);

    if (!sessionData) {
        // Clear invalid session
        cookies.delete("session", {path: "/"});
        throw redirect(302, "/admin");
    }

    return {
        user: sessionData,
    };
};
