import type {Actions, PageServerLoad} from "./$types";
import {
    createClass,
    createFileType,
    createSubject,
    deleteClass,
    deleteFileType,
    deleteSubject,
    getAdminByUsername,
    getAllSubjects,
    getClasses,
    getFileTypes,
    updateAdminCredentials,
    updateClass,
    updateFileType,
    updateSubject,
} from "$lib/server/db";
import {hashPassword, verifyPassword} from "$lib/server/auth";
import {fail} from "@sveltejs/kit";
import {z} from "zod";

// Validation schemas
const classSchema = z.object({
    name: z
        .string()
        .min(1, "Class name is required")
        .max(100, "Class name too long"),
});

const fileTypeSchema = z.object({
    name: z
        .string()
        .min(1, "File type name is required")
        .max(50, "File type name too long"),
});

const subjectSchema = z.object({
    name: z
        .string()
        .min(1, "Subject name is required")
        .max(100, "Subject name too long"),
    class_id: z.string().transform((val) => parseInt(val, 10)),
});

const adminCredentialsSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username too long"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
});

export const load: PageServerLoad = async ({platform}) => {
    if (!platform?.env?.DB) {
        throw new Error("Database not available");
    }

    try {
        const [classes, fileTypes, subjects] = await Promise.all([
            getClasses(platform.env.DB),
            getFileTypes(platform.env.DB),
            getAllSubjects(platform.env.DB),
        ]);

        return {
            classes,
            fileTypes,
            subjects,
        };
    } catch (error) {
        console.error("Failed to load settings data:", error);
        throw new Error("Failed to load settings");
    }
};

export const actions: Actions = {
    // Class actions
    createClass: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                name: formData.get("name")?.toString() || "",
            };

            const validation = classSchema.safeParse(data);
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "class",
                });
            }

            await createClass(platform.env.DB, validation.data.name);
            return {success: true, message: "Class created successfully"};
        } catch (error) {
            console.error("Create class error:", error);
            return fail(500, {message: "Failed to create class", type: "class"});
        }
    },

    updateClass: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                id: parseInt(formData.get("id")?.toString() || "0", 10),
                name: formData.get("name")?.toString() || "",
            };

            const validation = classSchema.safeParse({name: data.name});
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "class",
                });
            }

            await updateClass(platform.env.DB, data.id, validation.data.name);
            return {success: true, message: "Class updated successfully"};
        } catch (error) {
            console.error("Update class error:", error);
            return fail(500, {message: "Failed to update class", type: "class"});
        }
    },

    deleteClass: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const id = parseInt(formData.get("id")?.toString() || "0", 10);

            await deleteClass(platform.env.DB, id);
            return {success: true, message: "Class deleted successfully"};
        } catch (error) {
            console.error("Delete class error:", error);
            return fail(500, {message: "Failed to delete class", type: "class"});
        }
    },

    // File Type actions
    createFileType: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                name: formData.get("name")?.toString() || "",
            };

            const validation = fileTypeSchema.safeParse(data);
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "fileType",
                });
            }

            await createFileType(platform.env.DB, validation.data.name);
            return {success: true, message: "File type created successfully"};
        } catch (error) {
            console.error("Create file type error:", error);
            return fail(500, {
                message: "Failed to create file type",
                type: "fileType",
            });
        }
    },

    updateFileType: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                id: parseInt(formData.get("id")?.toString() || "0", 10),
                name: formData.get("name")?.toString() || "",
            };

            const validation = fileTypeSchema.safeParse({name: data.name});
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "fileType",
                });
            }

            await updateFileType(platform.env.DB, data.id, validation.data.name);
            return {success: true, message: "File type updated successfully"};
        } catch (error) {
            console.error("Update file type error:", error);
            return fail(500, {
                message: "Failed to update file type",
                type: "fileType",
            });
        }
    },

    deleteFileType: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const id = parseInt(formData.get("id")?.toString() || "0", 10);

            await deleteFileType(platform.env.DB, id);
            return {success: true, message: "File type deleted successfully"};
        } catch (error) {
            console.error("Delete file type error:", error);
            return fail(500, {
                message: "Failed to delete file type",
                type: "fileType",
            });
        }
    },

    // Subject actions
    createSubject: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                name: formData.get("name")?.toString() || "",
                class_id: formData.get("class_id")?.toString() || "",
            };

            const validation = subjectSchema.safeParse(data);
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "subject",
                });
            }

            await createSubject(
                platform.env.DB,
                validation.data.name,
                validation.data.class_id
            );
            return {success: true, message: "Subject created successfully"};
        } catch (error) {
            console.error("Create subject error:", error);
            return fail(500, {
                message: "Failed to create subject",
                type: "subject",
            });
        }
    },

    updateSubject: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const data = {
                id: parseInt(formData.get("id")?.toString() || "0", 10),
                name: formData.get("name")?.toString() || "",
                class_id: formData.get("class_id")?.toString() || "",
            };

            const validation = subjectSchema.safeParse({
                name: data.name,
                class_id: data.class_id,
            });
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "subject",
                });
            }

            await updateSubject(
                platform.env.DB,
                data.id,
                validation.data.name,
                validation.data.class_id
            );
            return {success: true, message: "Subject updated successfully"};
        } catch (error) {
            console.error("Update subject error:", error);
            return fail(500, {
                message: "Failed to update subject",
                type: "subject",
            });
        }
    },

    deleteSubject: async ({request, platform}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        try {
            const formData = await request.formData();
            const id = parseInt(formData.get("id")?.toString() || "0", 10);

            await deleteSubject(platform.env.DB, id);
            return {success: true, message: "Subject deleted successfully"};
        } catch (error) {
            console.error("Delete subject error:", error);
            return fail(500, {
                message: "Failed to delete subject",
                type: "subject",
            });
        }
    },

    // Admin credentials
    updateAdmin: async ({request, platform, locals}) => {
        if (!platform?.env?.DB) {
            return fail(500, {message: "Database not available"});
        }

        if (!locals.user) {
            return fail(401, {message: "Unauthorized"});
        }

        try {
            const formData = await request.formData();
            const data = {
                current_password: formData.get("current_password")?.toString() || "",
                username: formData.get("username")?.toString() || "",
                new_password: formData.get("new_password")?.toString() || "",
            };

            const validation = adminCredentialsSchema.safeParse(data);
            if (!validation.success) {
                return fail(400, {
                    message: validation.error.issues[0].message,
                    type: "admin",
                });
            }

            // Verify current password
            const admin = await getAdminByUsername(
                platform.env.DB,
                locals.user.username
            );
            if (
                !admin ||
                !(await verifyPassword(
                    validation.data.current_password,
                    admin.password_hash
                ))
            ) {
                return fail(400, {
                    message: "Current password is incorrect",
                    type: "admin",
                });
            }

            // Hash new password
            const hashedPassword = await hashPassword(validation.data.new_password);

            // Update credentials
            await updateAdminCredentials(
                platform.env.DB,
                admin.id,
                validation.data.username,
                hashedPassword
            );

            return {
                success: true,
                message: "Admin credentials updated successfully",
            };
        } catch (error) {
            console.error("Update admin error:", error);
            return fail(500, {
                message: "Failed to update admin credentials",
                type: "admin",
            });
        }
    },
};
