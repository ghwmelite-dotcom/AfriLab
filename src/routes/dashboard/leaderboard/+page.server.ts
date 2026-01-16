import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/dashboard/leaderboard');
	}

	// Mock leaderboard data
	// In production, this would be queried from the database
	const leaderboard = [
		{ rank: 1, name: 'Zainab Mohammed', institution: 'University of Lagos', points: 2450, level: 18, labsCompleted: 42, streak: 15 },
		{ rank: 2, name: 'Amara Okonkwo', institution: 'Makerere University', points: 2280, level: 17, labsCompleted: 38, streak: 12 },
		{ rank: 3, name: 'Kwame Asante', institution: 'University of Ghana', points: 2150, level: 16, labsCompleted: 35, streak: 8 },
		{ rank: 4, name: 'Fatima Diallo', institution: 'Cheikh Anta Diop University', points: 1980, level: 15, labsCompleted: 33, streak: 21 },
		{ rank: 5, name: 'Chidi Obi', institution: 'University of Ibadan', points: 1850, level: 14, labsCompleted: 30, streak: 5 },
		{ rank: 6, name: 'Grace Nwosu', institution: 'University of Nigeria', points: 1720, level: 13, labsCompleted: 28, streak: 7 },
		{ rank: 7, name: 'David Kamau', institution: 'University of Nairobi', points: 1650, level: 13, labsCompleted: 27, streak: 3 },
		{ rank: 8, name: 'Aminata Toure', institution: 'Université Gaston Berger', points: 1580, level: 12, labsCompleted: 25, streak: 10 },
		{ rank: 9, name: 'Emmanuel Ade', institution: 'Ahmadu Bello University', points: 1490, level: 12, labsCompleted: 24, streak: 4 },
		{ rank: 10, name: 'Sarah Mensah', institution: 'University of Cape Coast', points: 1420, level: 11, labsCompleted: 23, streak: 6 }
	];

	// Current user's stats
	const userStats = {
		rank: 15,
		points: 980,
		level: 8,
		labsCompleted: 16,
		streak: 4,
		unlockedAchievements: ['first-lab', 'lab-5', 'lab-10', 'streak-3', 'titration-first', 'first-perfect', 'explorer']
	};

	// Recent achievements across the platform
	const recentAchievements = [
		{ userName: 'Zainab Mohammed', achievementId: 'streak-30', unlockedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
		{ userName: 'Kwame Asante', achievementId: 'chem-master', unlockedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
		{ userName: 'Fatima Diallo', achievementId: 'lab-25', unlockedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
		{ userName: 'Amara Okonkwo', achievementId: 'perfect-5', unlockedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString() }
	];

	return {
		user: locals.user,
		leaderboard,
		userStats,
		recentAchievements
	};
};
