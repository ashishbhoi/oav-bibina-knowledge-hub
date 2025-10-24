// Database utility functions

// TypeScript interfaces for documentation and type safety
// These describe the shape of data returned from D1 database queries
export interface Class {
	id: number;
	name: string;
	created_at: string;
}

export interface Subject {
	id: number;
	name: string;
	class_id: number;
	created_at: string;
	class_name?: string; // From JOIN queries
}

export interface FileType {
	id: number;
	name: string;
	created_at: string;
}

export interface Note {
	id: number;
	display_name: string;
	r2_object_key: string;
	class_id: number;
	subject_id: number;
	file_type_id: number;
	uploaded_at: string;
	class_name?: string; // From JOIN queries
	subject_name?: string; // From JOIN queries
	file_type_name?: string; // From JOIN queries
}

export interface Admin {
	id: number;
	username: string;
	password_hash: string;
}

export class DatabaseError extends Error {
	constructor(
		message: string,
		public cause?: Error
	) {
		super(message);
		this.name = 'DatabaseError';
	}
}

export async function safeDbQuery<T>(
	operation: () => Promise<T>,
	errorMessage: string = 'Database operation failed'
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		console.error('Database error:', error);
		throw new DatabaseError(errorMessage, error as Error);
	}
}

// Utility function to create slug from name
export function createSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

// Simple database functions - types will be any for now to avoid compilation issues
export async function getClasses(db: any): Promise<any[]> {
	return safeDbQuery(async () => {
		const { results } = await db.prepare('SELECT * FROM Classes ORDER BY name ASC').all();
		return results || [];
	}, 'Failed to fetch classes');
}

export async function getClassBySlug(db: any, slug: string): Promise<any | null> {
	return safeDbQuery(async () => {
		const classes = await getClasses(db);
		return classes.find((c) => createSlug(c.name) === slug) || null;
	}, 'Failed to fetch class by slug');
}

export async function getClassById(db: any, id: number): Promise<any | null> {
	return safeDbQuery(async () => {
		const result = await db.prepare('SELECT * FROM Classes WHERE id = ?').bind(id).first();
		return result || null;
	}, 'Failed to fetch class by ID');
}

export async function getSubjectsByClassId(db: any, classId: number): Promise<any[]> {
	return safeDbQuery(async () => {
		const { results } = await db
			.prepare('SELECT * FROM Subjects WHERE class_id = ? ORDER BY name ASC')
			.bind(classId)
			.all();
		return results || [];
	}, 'Failed to fetch subjects');
}

export async function getSubjectBySlug(
	db: any,
	classId: number,
	slug: string
): Promise<any | null> {
	return safeDbQuery(async () => {
		const subjects = await getSubjectsByClassId(db, classId);
		return subjects.find((s) => createSlug(s.name) === slug) || null;
	}, 'Failed to fetch subject by slug');
}

export async function getAllSubjects(db: any): Promise<any[]> {
	return safeDbQuery(async () => {
		const { results } = await db
			.prepare(
				`
                    SELECT s.id,
                           s.name,
                           s.class_id,
                           s.created_at,
                           c.name as class_name
                    FROM Subjects s
                             JOIN Classes c ON s.class_id = c.id
                    ORDER BY c.name ASC, s.name ASC
                `
			)
			.all();
		return results || [];
	}, 'Failed to fetch all subjects');
}

export async function getNotesBySubjectId(db: any, subjectId: number): Promise<any[]> {
	return safeDbQuery(async () => {
		const { results } = await db
			.prepare(
				`
                    SELECT n.*,
                           c.name  as class_name,
                           s.name  as subject_name,
                           ft.name as file_type_name
                    FROM Notes n
                             JOIN Classes c ON n.class_id = c.id
                             JOIN Subjects s ON n.subject_id = s.id
                             JOIN FileTypes ft ON n.file_type_id = ft.id
                    WHERE n.subject_id = ?
                    ORDER BY ft.name ASC, n.display_name ASC
                `
			)
			.bind(subjectId)
			.all();
		return results || [];
	}, 'Failed to fetch notes');
}

export async function getNoteById(db: any, id: number): Promise<any | null> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare(
				`
                    SELECT n.*,
                           c.name  as class_name,
                           s.name  as subject_name,
                           ft.name as file_type_name
                    FROM Notes n
                             JOIN Classes c ON n.class_id = c.id
                             JOIN Subjects s ON n.subject_id = s.id
                             JOIN FileTypes ft ON n.file_type_id = ft.id
                    WHERE n.id = ?
                `
			)
			.bind(id)
			.first();
		return result || null;
	}, 'Failed to fetch note by ID');
}

export async function getAdminByUsername(db: any, username: string): Promise<any | null> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('SELECT * FROM Admin WHERE username = ?')
			.bind(username)
			.first();
		return result || null;
	}, 'Failed to fetch admin by username');
}

// CRUD operations for Classes
export async function createClass(db: any, name: string): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('INSERT INTO Classes (name) VALUES (?) RETURNING *')
			.bind(name)
			.first();
		return result;
	}, 'Failed to create class');
}

export async function updateClass(db: any, id: number, name: string): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('UPDATE Classes SET name = ? WHERE id = ? RETURNING *')
			.bind(name, id)
			.first();
		return result;
	}, 'Failed to update class');
}

export async function deleteClass(db: any, id: number): Promise<void> {
	return safeDbQuery(async () => {
		await db.prepare('DELETE FROM Classes WHERE id = ?').bind(id).run();
	}, 'Failed to delete class');
}

// CRUD operations for Subjects
export async function createSubject(db: any, name: string, classId: number): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('INSERT INTO Subjects (name, class_id) VALUES (?, ?) RETURNING *')
			.bind(name, classId)
			.first();
		return result;
	}, 'Failed to create subject');
}

export async function updateSubject(
	db: any,
	id: number,
	name: string,
	classId: number
): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('UPDATE Subjects SET name = ?, class_id = ? WHERE id = ? RETURNING *')
			.bind(name, classId, id)
			.first();
		return result;
	}, 'Failed to update subject');
}

export async function deleteSubject(db: any, id: number): Promise<void> {
	return safeDbQuery(async () => {
		await db.prepare('DELETE FROM Subjects WHERE id = ?').bind(id).run();
	}, 'Failed to delete subject');
}

// CRUD operations for FileTypes
export async function getFileTypes(db: any): Promise<any[]> {
	return safeDbQuery(async () => {
		const { results } = await db.prepare('SELECT * FROM FileTypes ORDER BY name ASC').all();
		return results || [];
	}, 'Failed to fetch file types');
}

export async function createFileType(db: any, name: string): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('INSERT INTO FileTypes (name) VALUES (?) RETURNING *')
			.bind(name)
			.first();
		return result;
	}, 'Failed to create file type');
}

export async function updateFileType(db: any, id: number, name: string): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare('UPDATE FileTypes SET name = ? WHERE id = ? RETURNING *')
			.bind(name, id)
			.first();
		return result;
	}, 'Failed to update file type');
}

export async function deleteFileType(db: any, id: number): Promise<void> {
	return safeDbQuery(async () => {
		await db.prepare('DELETE FROM FileTypes WHERE id = ?').bind(id).run();
	}, 'Failed to delete file type');
}

// Admin credentials update
export async function updateAdminCredentials(
	db: any,
	id: number,
	username: string,
	passwordHash: string
): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare(
				'UPDATE Admin SET username = ?, password_hash = ? WHERE id = ? RETURNING id, username'
			)
			.bind(username, passwordHash, id)
			.first();
		return result;
	}, 'Failed to update admin credentials');
}

// Create note/file record
export async function createNote(
	db: any,
	displayName: string,
	r2ObjectKey: string,
	classId: number,
	subjectId: number,
	fileTypeId: number
): Promise<any> {
	return safeDbQuery(async () => {
		const result = await db
			.prepare(
				'INSERT INTO Notes (display_name, r2_object_key, class_id, subject_id, file_type_id) VALUES (?, ?, ?, ?, ?) RETURNING *'
			)
			.bind(displayName, r2ObjectKey, classId, subjectId, fileTypeId)
			.first();
		return result;
	}, 'Failed to create note');
}

// Update note/file record
export async function updateNote(
	db: any,
	id: number,
	displayName: string,
	classId: number,
	subjectId: number,
	fileTypeId: number,
	r2ObjectKey?: string
): Promise<any> {
	return safeDbQuery(async () => {
		let query: string;
		let params: any[];

		if (r2ObjectKey) {
			// Update including the R2 object key (for file replacement)
			query =
				'UPDATE Notes SET display_name = ?, class_id = ?, subject_id = ?, file_type_id = ?, r2_object_key = ? WHERE id = ? RETURNING *';
			params = [displayName, classId, subjectId, fileTypeId, r2ObjectKey, id];
		} else {
			// Update only metadata (no file replacement)
			query =
				'UPDATE Notes SET display_name = ?, class_id = ?, subject_id = ?, file_type_id = ? WHERE id = ? RETURNING *';
			params = [displayName, classId, subjectId, fileTypeId, id];
		}

		const result = await db
			.prepare(query)
			.bind(...params)
			.first();
		return result;
	}, 'Failed to update note');
}

// Delete note/file record
export async function deleteNote(db: any, id: number): Promise<void> {
	return safeDbQuery(async () => {
		await db.prepare('DELETE FROM Notes WHERE id = ?').bind(id).run();
	}, 'Failed to delete note');
}

// Get all notes with full details for admin management
export async function getAllNotes(db: any): Promise<any[]> {
	return safeDbQuery(async () => {
		const { results } = await db
			.prepare(
				`
                    SELECT n.id,
                           n.display_name,
                           n.r2_object_key,
                           n.uploaded_at,
                           c.name  as class_name,
                           s.name  as subject_name,
                           ft.name as file_type_name,
                           n.class_id,
                           n.subject_id,
                           n.file_type_id
                    FROM Notes n
                             JOIN Classes c ON n.class_id = c.id
                             JOIN Subjects s ON n.subject_id = s.id
                             JOIN FileTypes ft ON n.file_type_id = ft.id
                    ORDER BY n.uploaded_at DESC
                `
			)
			.all();
		return results || [];
	}, 'Failed to fetch all notes');
}
