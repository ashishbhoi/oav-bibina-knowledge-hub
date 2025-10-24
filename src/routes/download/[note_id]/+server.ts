import type { RequestHandler } from './$types';
import { getNoteById } from '$lib/server/db';
import { createR2Client, generateDownloadUrl } from '$lib/server/r2';
import { error, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform?.env?.DB || !platform?.env?.BUCKET) {
		throw error(500, 'Database or storage not available');
	}

	try {
		const noteId = parseInt(params.note_id);
		if (isNaN(noteId)) {
			throw error(400, 'Invalid note ID');
		}

		const note = await getNoteById(platform.env.DB, noteId);
		if (!note) {
			throw error(404, 'Note not found');
		}

		// Use environment variables for R2 credentials
		const r2Client = createR2Client(
			platform.env.R2_ACCOUNT_ID,
			platform.env.R2_ACCESS_KEY_ID,
			platform.env.R2_SECRET_ACCESS_KEY
		);

		const downloadUrl = await generateDownloadUrl(
			r2Client,
			'oav-knowledge-hub-files',
			note.r2_object_key
		);

		throw redirect(302, downloadUrl);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		console.error('Failed to generate download URL:', err);
		throw error(500, 'Failed to generate download URL');
	}
};
