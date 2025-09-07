import type {PageServerLoad} from "./$types";
import {getClassBySlug, getNotesBySubjectId, getSubjectBySlug,} from "$lib/server/db";
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

        const subject = await getSubjectBySlug(
            platform.env.DB,
            classItem.id,
            params.subject_slug
        );

        if (!subject) {
            throw error(404, "Subject not found");
        }

        const notes = await getNotesBySubjectId(platform.env.DB, subject.id);

        // Group notes by file type
        const groupedNotes = notes.reduce((acc, note) => {
            const fileType = note.file_type_name || "Unknown";
            if (!acc[fileType]) {
                acc[fileType] = [];
            }
            acc[fileType].push(note);
            return acc;
        }, {} as Record<string, typeof notes>);

        return {
            class: classItem,
            subject: subject,
            groupedNotes: groupedNotes,
        };
    } catch (err) {
        if (err && typeof err === "object" && "status" in err) {
            throw err; // Re-throw SvelteKit errors
        }
        console.error("Failed to load subject notes:", err);
        throw error(500, "Failed to load subject notes");
    }
};
