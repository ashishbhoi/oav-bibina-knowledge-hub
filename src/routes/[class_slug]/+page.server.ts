import type {PageServerLoad} from "./$types";
import {createSlug, getClassBySlug, getSubjectsByClassId,} from "$lib/server/db";
import {error} from "@sveltejs/kit";

export const load: PageServerLoad = async ({params, platform}) => {
    if (!platform?.env?.DB) {
        throw new Error("Database not available");
    }

    try {
        const classItem = await getClassBySlug(platform.env.DB, params.class_slug);

        if (!classItem) {
            throw error(404, "Class not found");
        }

        const subjects = await getSubjectsByClassId(platform.env.DB, classItem.id);

        // Add slug to each subject for routing
        const subjectsWithSlugs = subjects.map((subject) => ({
            ...subject,
            slug: createSlug(subject.name),
        }));

        return {
            class: classItem,
            subjects: subjectsWithSlugs,
        };
    } catch (err) {
        if (err && typeof err === "object" && "status" in err) {
            throw err; // Re-throw SvelteKit errors
        }
        console.error("Failed to load class subjects:", err);
        throw error(500, "Failed to load class subjects");
    }
};
