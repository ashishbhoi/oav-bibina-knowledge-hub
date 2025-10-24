import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(6, 'New password must be at least 6 characters'),
		confirmPassword: z.string().min(1, 'Password confirmation is required'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

// Class schemas
export const classSchema = z.object({
	name: z.string().min(1, 'Class name is required').max(100, 'Class name too long'),
});

// Subject schemas
export const subjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
	class_id: z.number().int().positive('Valid class must be selected'),
});

// File type schemas
export const fileTypeSchema = z.object({
	name: z.string().min(1, 'File type name is required').max(100, 'File type name too long'),
});

// Note schemas
export const noteSchema = z.object({
	display_name: z.string().min(1, 'Display name is required').max(200, 'Display name too long'),
	class_id: z.number().int().positive('Valid class must be selected'),
	subject_id: z.number().int().positive('Valid subject must be selected'),
	file_type_id: z.number().int().positive('Valid file type must be selected'),
});

export const noteUploadSchema = noteSchema.extend({
	file: z
		.any()
		.refine((file) => file instanceof File, 'File is required')
		.refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB'),
});

// ID validation
export const idSchema = z.number().int().positive();
export const slugSchema = z.string().min(1).max(100);

export type LoginData = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ClassData = z.infer<typeof classSchema>;
export type SubjectData = z.infer<typeof subjectSchema>;
export type FileTypeData = z.infer<typeof fileTypeSchema>;
export type NoteData = z.infer<typeof noteSchema>;
export type NoteUploadData = z.infer<typeof noteUploadSchema>;
