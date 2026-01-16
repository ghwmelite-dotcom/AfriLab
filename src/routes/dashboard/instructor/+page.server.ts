import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/dashboard/instructor');
	}

	// Check if user is an instructor (role check)
	if (locals.user.role !== 'instructor' && locals.user.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	// Mock data for instructor dashboard
	// In production, this would come from the database
	const classData = {
		totalStudents: 45,
		activeStudents: 38,
		totalLabSessions: 156,
		avgCompletionRate: 78,
		avgScore: 82
	};

	const recentActivity = [
		{ id: '1', studentName: 'Amara Okonkwo', lab: 'Acid-Base Titration', score: 92, completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
		{ id: '2', studentName: 'Kwame Asante', lab: 'Cell Microscopy', score: 85, completedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
		{ id: '3', studentName: 'Fatima Diallo', lab: "Ohm's Law Verification", score: 88, completedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
		{ id: '4', studentName: 'Chidi Obi', lab: 'Drug Compounding', score: 79, completedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
		{ id: '5', studentName: 'Zainab Mohammed', lab: 'UV-Vis Spectroscopy', score: 95, completedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() }
	];

	const labPerformance = [
		{ labName: 'Acid-Base Titration', completions: 42, avgScore: 84, discipline: 'Chemistry' },
		{ labName: 'UV-Vis Spectroscopy', completions: 35, avgScore: 79, discipline: 'Chemistry' },
		{ labName: 'Cell Microscopy', completions: 28, avgScore: 86, discipline: 'Biology' },
		{ labName: "Ohm's Law Verification", completions: 31, avgScore: 81, discipline: 'Physics' },
		{ labName: 'Drug Compounding', completions: 20, avgScore: 77, discipline: 'Pharmacy' }
	];

	const weeklyProgress = [
		{ day: 'Mon', sessions: 12, avgScore: 78 },
		{ day: 'Tue', sessions: 18, avgScore: 82 },
		{ day: 'Wed', sessions: 15, avgScore: 80 },
		{ day: 'Thu', sessions: 22, avgScore: 85 },
		{ day: 'Fri', sessions: 25, avgScore: 83 },
		{ day: 'Sat', sessions: 8, avgScore: 79 },
		{ day: 'Sun', sessions: 5, avgScore: 76 }
	];

	const topStudents = [
		{ name: 'Zainab Mohammed', avgScore: 94, labsCompleted: 8 },
		{ name: 'Amara Okonkwo', avgScore: 91, labsCompleted: 7 },
		{ name: 'Fatima Diallo', avgScore: 89, labsCompleted: 9 },
		{ name: 'Kwame Asante', avgScore: 87, labsCompleted: 6 },
		{ name: 'Chidi Obi', avgScore: 85, labsCompleted: 8 }
	];

	const needsAttention = [
		{ name: 'Emmanuel Ade', avgScore: 52, labsCompleted: 2, issue: 'Low completion rate' },
		{ name: 'Grace Nwosu', avgScore: 58, labsCompleted: 4, issue: 'Struggling with technique' },
		{ name: 'David Kamau', avgScore: 61, labsCompleted: 3, issue: 'Irregular attendance' }
	];

	return {
		user: locals.user,
		classData,
		recentActivity,
		labPerformance,
		weeklyProgress,
		topStudents,
		needsAttention
	};
};
