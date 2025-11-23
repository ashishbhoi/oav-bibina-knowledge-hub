import type { PageServerLoad } from './$types';
import { createSlug, getClasses, getDashboardStats } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		throw new Error('Database not available');
	}

	try {
		const [classes, stats] = await Promise.all([
			getClasses(platform.env.DB),
			getDashboardStats(platform.env.DB),
		]);

		// Add slug to each class for routing
		const classesWithSlugs = classes.map((cls) => ({
			...cls,
			slug: createSlug(cls.name),
		}));

		return {
			classes: classesWithSlugs,
			stats,
		};
	} catch (error) {
		console.error('Failed to load dashboard data:', error);
		throw new Error('Failed to load dashboard data');
	}
};
