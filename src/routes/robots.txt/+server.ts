import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;

	const robotsTxt = `# robots.txt for ${baseUrl}
User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin
Disallow: /admin/
Disallow: /admin/*

# Disallow API endpoints
Disallow: /api/
Disallow: /download/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
		},
	});
};
