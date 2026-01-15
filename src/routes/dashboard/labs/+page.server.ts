import type { PageServerLoad } from './$types';
import { getDisciplines } from '$server/db';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env) {
		return { disciplines: [] };
	}

	const disciplines = await getDisciplines(platform.env.DB);

	return { disciplines };
};
