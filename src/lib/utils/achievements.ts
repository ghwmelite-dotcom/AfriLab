/**
 * Achievements System
 * Gamification features for tracking student progress and milestones
 */

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: 'completion' | 'mastery' | 'streak' | 'exploration' | 'social' | 'special';
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
	points: number;
	requirement: AchievementRequirement;
	unlockedAt?: string;
	progress?: number;
}

export interface AchievementRequirement {
	type: 'labs_completed' | 'score_achieved' | 'streak_days' | 'discipline_mastery' | 'perfect_score' | 'time_spent' | 'first_completion' | 'all_structures' | 'custom';
	value: number;
	discipline?: string;
	labId?: string;
}

export interface UserAchievements {
	unlocked: string[];
	totalPoints: number;
	currentStreak: number;
	longestStreak: number;
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
	// Completion achievements
	{
		id: 'first-lab',
		name: 'First Steps',
		description: 'Complete your first lab experiment',
		icon: '🎯',
		category: 'completion',
		rarity: 'common',
		points: 10,
		requirement: { type: 'labs_completed', value: 1 }
	},
	{
		id: 'lab-5',
		name: 'Getting Started',
		description: 'Complete 5 lab experiments',
		icon: '🔬',
		category: 'completion',
		rarity: 'common',
		points: 25,
		requirement: { type: 'labs_completed', value: 5 }
	},
	{
		id: 'lab-10',
		name: 'Lab Enthusiast',
		description: 'Complete 10 lab experiments',
		icon: '🧪',
		category: 'completion',
		rarity: 'uncommon',
		points: 50,
		requirement: { type: 'labs_completed', value: 10 }
	},
	{
		id: 'lab-25',
		name: 'Dedicated Scientist',
		description: 'Complete 25 lab experiments',
		icon: '🔭',
		category: 'completion',
		rarity: 'rare',
		points: 100,
		requirement: { type: 'labs_completed', value: 25 }
	},
	{
		id: 'lab-50',
		name: 'Lab Master',
		description: 'Complete 50 lab experiments',
		icon: '👨‍🔬',
		category: 'completion',
		rarity: 'epic',
		points: 200,
		requirement: { type: 'labs_completed', value: 50 }
	},
	{
		id: 'lab-100',
		name: 'Laboratory Legend',
		description: 'Complete 100 lab experiments',
		icon: '🏆',
		category: 'completion',
		rarity: 'legendary',
		points: 500,
		requirement: { type: 'labs_completed', value: 100 }
	},

	// Mastery achievements
	{
		id: 'first-perfect',
		name: 'Perfectionist',
		description: 'Achieve a perfect score in any lab',
		icon: '⭐',
		category: 'mastery',
		rarity: 'uncommon',
		points: 50,
		requirement: { type: 'perfect_score', value: 1 }
	},
	{
		id: 'perfect-5',
		name: 'Flawless Five',
		description: 'Achieve 5 perfect scores',
		icon: '🌟',
		category: 'mastery',
		rarity: 'rare',
		points: 100,
		requirement: { type: 'perfect_score', value: 5 }
	},
	{
		id: 'high-achiever',
		name: 'High Achiever',
		description: 'Maintain an average score above 90%',
		icon: '📈',
		category: 'mastery',
		rarity: 'rare',
		points: 75,
		requirement: { type: 'score_achieved', value: 90 }
	},

	// Discipline mastery
	{
		id: 'chem-master',
		name: 'Chemistry Wizard',
		description: 'Complete all chemistry labs with A grade',
		icon: '🧪',
		category: 'mastery',
		rarity: 'epic',
		points: 150,
		requirement: { type: 'discipline_mastery', value: 100, discipline: 'chemistry' }
	},
	{
		id: 'bio-master',
		name: 'Biology Expert',
		description: 'Complete all biology labs with A grade',
		icon: '🧬',
		category: 'mastery',
		rarity: 'epic',
		points: 150,
		requirement: { type: 'discipline_mastery', value: 100, discipline: 'biology' }
	},
	{
		id: 'phys-master',
		name: 'Physics Prodigy',
		description: 'Complete all physics labs with A grade',
		icon: '⚡',
		category: 'mastery',
		rarity: 'epic',
		points: 150,
		requirement: { type: 'discipline_mastery', value: 100, discipline: 'physics' }
	},
	{
		id: 'pharm-master',
		name: 'Pharmacy Specialist',
		description: 'Complete all pharmacy labs with A grade',
		icon: '💊',
		category: 'mastery',
		rarity: 'epic',
		points: 150,
		requirement: { type: 'discipline_mastery', value: 100, discipline: 'pharmacy' }
	},

	// Streak achievements
	{
		id: 'streak-3',
		name: 'On a Roll',
		description: 'Complete labs 3 days in a row',
		icon: '🔥',
		category: 'streak',
		rarity: 'common',
		points: 20,
		requirement: { type: 'streak_days', value: 3 }
	},
	{
		id: 'streak-7',
		name: 'Week Warrior',
		description: 'Complete labs 7 days in a row',
		icon: '💪',
		category: 'streak',
		rarity: 'uncommon',
		points: 50,
		requirement: { type: 'streak_days', value: 7 }
	},
	{
		id: 'streak-30',
		name: 'Unstoppable',
		description: 'Complete labs 30 days in a row',
		icon: '🚀',
		category: 'streak',
		rarity: 'epic',
		points: 200,
		requirement: { type: 'streak_days', value: 30 }
	},

	// Exploration achievements
	{
		id: 'explorer',
		name: 'Explorer',
		description: 'Try labs from all available disciplines',
		icon: '🗺️',
		category: 'exploration',
		rarity: 'uncommon',
		points: 40,
		requirement: { type: 'custom', value: 4 }
	},
	{
		id: 'curious-mind',
		name: 'Curious Mind',
		description: 'Spend 10 hours in virtual labs',
		icon: '🧠',
		category: 'exploration',
		rarity: 'rare',
		points: 75,
		requirement: { type: 'time_spent', value: 600 }
	},

	// Special lab achievements
	{
		id: 'titration-first',
		name: 'First Titration',
		description: 'Complete your first titration experiment',
		icon: '🫗',
		category: 'special',
		rarity: 'common',
		points: 15,
		requirement: { type: 'first_completion', value: 1, labId: 'titration' }
	},
	{
		id: 'microscopy-all',
		name: 'Cell Detective',
		description: 'Identify all cell structures in microscopy lab',
		icon: '🔍',
		category: 'special',
		rarity: 'uncommon',
		points: 30,
		requirement: { type: 'all_structures', value: 1, labId: 'microscopy' }
	},
	{
		id: 'ohms-verified',
		name: 'Ohm My!',
		description: "Successfully verify Ohm's Law with R² > 0.99",
		icon: '⚡',
		category: 'special',
		rarity: 'rare',
		points: 60,
		requirement: { type: 'custom', value: 1, labId: 'ohms-law' }
	},
	{
		id: 'compounding-pro',
		name: 'Compound Interest',
		description: 'Create an excellent quality pharmaceutical compound',
		icon: '💎',
		category: 'special',
		rarity: 'rare',
		points: 60,
		requirement: { type: 'custom', value: 1, labId: 'compounding' }
	}
];

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
	return ACHIEVEMENTS.find(a => a.id === id);
}

// Get achievements by category
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
	return ACHIEVEMENTS.filter(a => a.category === category);
}

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
	switch (rarity) {
		case 'common': return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
		case 'uncommon': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
		case 'rare': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
		case 'epic': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
		case 'legendary': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
	}
}

// Get rarity gradient
export function getRarityGradient(rarity: Achievement['rarity']): string {
	switch (rarity) {
		case 'common': return 'from-gray-500 to-gray-600';
		case 'uncommon': return 'from-emerald-500 to-green-600';
		case 'rare': return 'from-blue-500 to-cyan-600';
		case 'epic': return 'from-purple-500 to-pink-600';
		case 'legendary': return 'from-amber-500 to-orange-600';
	}
}

// Calculate level from points
export function calculateLevel(points: number): { level: number; currentXP: number; requiredXP: number; progress: number } {
	// Each level requires progressively more points
	// Level 1: 0-50, Level 2: 50-150, Level 3: 150-300, etc.
	let level = 1;
	let totalRequired = 0;
	let nextRequired = 50;

	while (points >= totalRequired + nextRequired) {
		totalRequired += nextRequired;
		level++;
		nextRequired = 50 * level; // Increases by 50 per level
	}

	const currentXP = points - totalRequired;
	const progress = (currentXP / nextRequired) * 100;

	return { level, currentXP, requiredXP: nextRequired, progress };
}

// Get title based on level
export function getLevelTitle(level: number): string {
	if (level >= 50) return 'Grand Master Scientist';
	if (level >= 40) return 'Master Scientist';
	if (level >= 30) return 'Expert Researcher';
	if (level >= 20) return 'Senior Researcher';
	if (level >= 15) return 'Research Associate';
	if (level >= 10) return 'Lab Technician';
	if (level >= 5) return 'Lab Assistant';
	if (level >= 2) return 'Student Researcher';
	return 'Novice';
}
