import type {Actions, PageServerLoad} from "./$types";
import {createNote, getClasses, getFileTypes, getSubjectsByClassId,} from "$lib/server/db";
import {fail} from "@sveltejs/kit";
import {z} from "zod";
import {v4 as uuidv4} from "uuid";

const uploadSchema = z.object({
    display_name: z
        .string()
        .min(1, "File name is required")
        .max(255, "File name too long"),
    class_id: z.string().transform((val) => parseInt(val, 10)),
    subject_id: z.string().transform((val) => parseInt(val, 10)),
    file_type_id: z.string().transform((val) => parseInt(val, 10)),
    file_name: z.string().min(1, "Original file name is required"),
    file_size: z.string().transform((val) => parseInt(val, 10)),
});

export const load: PageServerLoad = async ({platform, url}) => {
    if (!platform?.env?.DB) {
        throw new Error("Database not available");
    }

    try {
        const [classes, fileTypes] = await Promise.all([
            getClasses(platform.env.DB),
            getFileTypes(platform.env.DB),
        ]);

        // Get pre-selected values from URL params
        const preselected = {
            classId: url.searchParams.get("class_id"),
            subjectId: url.searchParams.get("subject_id"),
            fileTypeId: url.searchParams.get("file_type_id"),
        };

        // If a class is preselected, fetch its subjects
        let preselectedSubjects: any[] = [];
        if (preselected.classId) {
            try {
                preselectedSubjects = await getSubjectsByClassId(
                    platform.env.DB,
                    parseInt(preselected.classId, 10)
                );
            } catch (error) {
                console.error("Failed to fetch preselected subjects:", error);
            }
        }

        return {
            classes,
            fileTypes,
            preselected,
            preselectedSubjects,
        };
    } catch (error) {
        console.error("Failed to load upload data:", error);
        throw new Error("Failed to load upload page");
    }
};

export const actions: Actions = {
    getSubjects: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const classId = parseInt(formData.get("class_id")?.toString() || "0", 10);

            if (!classId) {
                return {subjects: []};
            }

            const subjects = await getSubjectsByClassId(platform.env.DB, classId);
            return {subjects};
        } catch (error) {
            console.error("Get subjects error:", error);
            return fail(500, {message: "Failed to fetch subjects"});
        }
    },

    generateUploadUrl: async ({request, platform}) => {
        try {
            const formData = await request.formData();
            const fileName = formData.get("file_name")?.toString();
            const fileSize = parseInt(
                formData.get("file_size")?.toString() || "0",
                10
            );

            if (!fileName) {
                return fail(400, {message: "File name is required"});
            }

            if (fileSize > 10 * 1024 * 1024) {
                // 10MB limit
                return fail(400, {message: "File size too large (max 10MB)"});
            }

            // Generate a unique object key
            const fileExtension = fileName.split(".").pop() || "";
            const key = `${uuidv4()}.${fileName}`;

            return {
                success: true,
                key: key,
                message: "Object key generated successfully",
            };
        } catch (error) {
            console.error("Generate object key error:", error);
            return fail(500, {message: "Failed to generate object key"});
        }
    },

    saveFileMetadata: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                display_name: formData.get("display_name")?.toString() || "",
                class_id: formData.get("class_id")?.toString() || "",
                subject_id: formData.get("subject_id")?.toString() || "",
                file_type_id: formData.get("file_type_id")?.toString() || "",
                file_name: formData.get("file_name")?.toString() || "",
                file_size: formData.get("file_size")?.toString() || "",
                object_key: formData.get("object_key")?.toString() || "",
            };

            const validation = uploadSchema.safeParse(data);
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                });
            }

            if (!data.object_key) {
                return fail(400, {message: "Object key is required"});
            }

            // Save to database
            await createNote(
                platform.env.DB,
                validation.data.display_name,
                data.object_key,
                validation.data.class_id,
                validation.data.subject_id,
                validation.data.file_type_id
            );

            return {
                success: true,
                message: "File uploaded successfully!",
            };
        } catch (error) {
            console.error("Save file metadata error:", error);
            return fail(500, {message: "Failed to save file information"});
        }
    },
};
