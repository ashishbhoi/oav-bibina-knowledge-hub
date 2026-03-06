// place files you want to import through the `$lib` alias in this folder.

/**
 * Creates a URL-friendly slug from a string
 */
export function createSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

/**
 * Generates a descriptive download URL for a note
 * Format: /download/class-subject-type-name-id
 */
export function generateDownloadUrl(note: {
	id: number;
	display_name: string;
	class_name?: string;
	subject_name?: string;
	file_type_name?: string;
}): string {
	const parts = [];

	if (note.class_name) parts.push(note.class_name);
	if (note.subject_name) parts.push(note.subject_name);
	if (note.file_type_name) parts.push(note.file_type_name);
	parts.push(note.display_name);

	const slugPrefix = createSlug(parts.join(' '));
	return `/download/${slugPrefix}-${note.id}`;
}
