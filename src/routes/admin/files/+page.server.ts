import {error, fail} from "@sveltejs/kit";
import {
    deleteNote,
    getAllNotes,
    getAllSubjects,
    getClasses,
    getFileTypes,
    getNoteById,
    updateNote,
} from "$lib/server/db";
import {createR2Client, deleteFile} from "$lib/server/r2";

export const load = async ({platform}: any) => {
    if (!platform?.env?.DB) {
        throw error(500, "Database not available");
    }

    try {
        const [notes, classes, subjects, fileTypes] = await Promise.all([
            getAllNotes(platform.env.DB),
            getClasses(platform.env.DB),
            getAllSubjects(platform.env.DB),
            getFileTypes(platform.env.DB),
        ]);

        return {
            notes,
            classes,
            subjects,
            fileTypes,
        };
    } catch (err) {
        console.error("Failed to load file management data:", err);
        throw error(500, "Failed to load data");
    }
};

export const actions = {
    updateNote: async ({request, platform}: any) => {
        if (!platform?.env?.DB) {
            return fail(500, {error: "Database not available"});
        }

        const data = await request.formData();
        const id = parseInt(data.get("id") as string);
        const displayName = data.get("displayName") as string;
        const classId = parseInt(data.get("classId") as string);
        const subjectId = parseInt(data.get("subjectId") as string);
        const fileTypeId = parseInt(data.get("fileTypeId") as string);

        if (!id || !displayName || !classId || !subjectId || !fileTypeId) {
            return fail(400, {error: "All fields are required"});
        }

        try {
            await updateNote(
                platform.env.DB,
                id,
                displayName,
                classId,
                subjectId,
                fileTypeId
            );
            return {success: true};
        } catch (err) {
            console.error("Failed to update note:", err);
            return fail(500, {error: "Failed to update file"});
        }
    },

    deleteNote: async ({request, platform}: any) => {
        if (
            !platform?.env?.DB ||
            !platform?.env?.R2_ACCOUNT_ID ||
            !platform?.env?.R2_ACCESS_KEY_ID ||
            !platform?.env?.R2_SECRET_ACCESS_KEY
        ) {
            return fail(500, {error: "Database or R2 not available"});
        }

        const data = await request.formData();
        const id = parseInt(data.get("id") as string);

        if (!id) {
            return fail(400, {error: "Note ID is required"});
        }

        try {
            // Get the note details first to find the R2 object key
            const note = await getNoteById(platform.env.DB, id);
            if (!note) {
                return fail(404, {error: "File not found"});
            }

            // Create R2 client and delete the file from storage
            const r2Client = createR2Client(
                platform.env.R2_ACCOUNT_ID,
                platform.env.R2_ACCESS_KEY_ID,
                platform.env.R2_SECRET_ACCESS_KEY
            );

            await deleteFile(r2Client, "oav-knowledge-hub-files", note.r2_object_key);

            // Delete the database record
            await deleteNote(platform.env.DB, id);

            return {success: true};
        } catch (err) {
            console.error("Failed to delete note:", err);
            return fail(500, {error: "Failed to delete file"});
        }
    },
};
