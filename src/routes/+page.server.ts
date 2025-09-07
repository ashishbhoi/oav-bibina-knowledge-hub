import type {PageServerLoad} from "./$types";
import {createSlug, getClasses} from "$lib/server/db";

export const load: PageServerLoad = async ({platform}) => {
    if (!platform?.env?.DB) {
        throw new Error("Database not available");
    }

    try {
        const classes = await getClasses(platform.env.DB);

        // Add slug to each class for routing
        const classesWithSlugs = classes.map((cls) => ({
            ...cls,
            slug: createSlug(cls.name),
        }));

        return {
            classes: classesWithSlugs,
        };
    } catch (error) {
        console.error("Failed to load classes:", error);
        throw new Error("Failed to load classes");
    }
};
