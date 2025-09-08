import type { RequestHandler } from "./$types";
import { createSlug, getClasses, getSubjectsByClassId } from "$lib/server/db";

export const GET: RequestHandler = async ({ platform, url }) => {
  if (!platform?.env?.DB) {
    throw new Error("Database not available");
  }

  try {
    const classes = await getClasses(platform.env.DB);
    const baseUrl = url.origin;

    // Get current date for lastmod
    const currentDate = new Date().toISOString().split("T")[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Homepage -->
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;

    // Add class pages
    for (const cls of classes) {
      const classSlug = createSlug(cls.name);
      sitemap += `
    <url>
        <loc>${baseUrl}/${classSlug}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;

      // Get subjects for this class
      const subjects = await getSubjectsByClassId(platform.env.DB, cls.id);

      // Add subject pages
      for (const subject of subjects) {
        const subjectSlug = createSlug(subject.name);
        sitemap += `
    <url>
        <loc>${baseUrl}/${classSlug}/${subjectSlug}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
      }
    }

    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
};
