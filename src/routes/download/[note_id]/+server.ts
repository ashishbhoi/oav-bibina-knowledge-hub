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
		const customDomain = platform.env.R2_CUSTOM_DOMAIN;
		let downloadUrl: string;

		if (customDomain && customDomain.trim() !== '') {
			// Public access via custom domain - no credentials needed
			const domain = customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
			// Ensure the key is properly encoded if needed, though usually R2 keys are URL safe or need simple encoding
			// We assume note.r2_object_key is the path
			downloadUrl = `https://${domain}/${note.r2_object_key}`;
		} else {
			// Private access via signed URL
			const r2Client = createR2Client(
				platform.env.R2_ACCOUNT_ID,
				platform.env.R2_ACCESS_KEY_ID,
				platform.env.R2_SECRET_ACCESS_KEY
			);

			downloadUrl = await generateDownloadUrl(
				r2Client,
				platform.env.R2_BUCKET_NAME || 'oav-knowledge-hub-files',
				note.r2_object_key
			);
		}

		throw redirect(302, downloadUrl);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		console.error('Failed to generate download URL:', err);
		throw error(500, 'Failed to generate download URL');
	}
};
