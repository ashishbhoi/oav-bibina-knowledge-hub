import type { RequestHandler } from './$types';
import { getNoteById } from '$lib/server/db';
import { createR2Client, generateDownloadUrl } from '$lib/server/r2';
import { error, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, platform, request }) => {
	if (!platform?.env?.DB || !platform?.env?.BUCKET) {
		throw error(500, 'Database or storage not available');
	}

	try {
		// Extract note ID from the end of the slug (e.g., class-10-math-123 -> 123)
		const slugParts = params.slug.split('-');
		const noteIdStr = slugParts[slugParts.length - 1];
		const noteId = parseInt(noteIdStr);

		if (isNaN(noteId)) {
			throw error(400, 'Invalid note ID in URL');
		}

		const note = await getNoteById(platform.env.DB, noteId);
		if (!note) {
			throw error(404, 'Note not found');
		}

		// Check for bots (WhatsApp, Facebook, Twitter, etc.) and search engines (Google, Bing, etc.)
		const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
		const isBot =
			/facebookexternalhit|twitterbot|linkedinbot|discordbot|slackbot|telegrambot|whatsapp|skypeuripreview|googlebot|bingbot|yandex|baiduspider|duckduckbot|vkshare/i.test(
				userAgent
			);

		if (isBot) {
			const title = `${note.display_name} - ${note.subject_name} (${note.class_name})`;
			const description = `Download ${note.file_type_name} for ${note.subject_name} | OAV Bibina Knowledge Hub`;
			const url = new URL(request.url).href;

			const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:site_name" content="OAV Bibina Knowledge Hub">
    <meta property="article:section" content="${note.class_name}">
    <meta property="article:tag" content="${note.subject_name}">
    <meta property="article:tag" content="${note.file_type_name}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <p>Class: ${note.class_name}</p>
    <p>Subject: ${note.subject_name}</p>
    <p>Type: ${note.file_type_name}</p>
</body>
</html>`;

			return new Response(html, {
				headers: {
					'content-type': 'text/html; charset=utf-8',
					Vary: 'User-Agent',
				},
			});
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
