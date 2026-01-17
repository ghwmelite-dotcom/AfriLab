import type { PageServerLoad } from './$types';
import { getDisciplines } from '$server/db';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env) {
		return { disciplines: [] };
	}

	try {
		const disciplines = await getDisciplines(platform.env.DB);
		return { disciplines };
	} catch (error) {
		console.error('Failed to load disciplines:', error);
		return { disciplines: [] };
	}
};
