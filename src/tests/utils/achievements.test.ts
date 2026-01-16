/**
 * Tests for Achievement System
 */

import { describe, it, expect } from 'vitest';
import {
	ACHIEVEMENTS,
	calculateLevel,
	getLevelTitle,
	getAchievement
} from '$lib/utils/achievements';

describe('Achievement System', () => {
	describe('ACHIEVEMENTS', () => {
		it('should have achievements defined', () => {
			expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
		});

		it('should have unique IDs for all achievements', () => {
			const ids = ACHIEVEMENTS.map(a => a.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it('should have valid rarity values', () => {
			const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
			ACHIEVEMENTS.forEach(achievement => {
				expect(validRarities).toContain(achievement.rarity);
			});
		});

		it('should have positive points for all achievements', () => {
			ACHIEVEMENTS.forEach(achievement => {
				expect(achievement.points).toBeGreaterThan(0);
			});
		});
	});

	describe('calculateLevel', () => {
		it('should return level 1 for 0 points', () => {
			const result = calculateLevel(0);
			expect(result.level).toBe(1);
		});

		it('should return correct progress percentage', () => {
			const result = calculateLevel(50);
			expect(result.progress).toBeGreaterThanOrEqual(0);
			expect(result.progress).toBeLessThanOrEqual(100);
		});

		it('should increase level with more points', () => {
			const lowLevel = calculateLevel(100);
			const highLevel = calculateLevel(1000);
			expect(highLevel.level).toBeGreaterThan(lowLevel.level);
		});

		it('should return correct XP values', () => {
			const result = calculateLevel(150);
			expect(result.currentXP).toBeGreaterThanOrEqual(0);
			expect(result.requiredXP).toBeGreaterThan(0);
		});
	});

	describe('getLevelTitle', () => {
		it('should return "Novice" for level 1', () => {
			expect(getLevelTitle(1)).toBe('Novice');
		});

		it('should return different titles for different levels', () => {
			const title1 = getLevelTitle(1);
			const title5 = getLevelTitle(5);
			const title10 = getLevelTitle(10);

			expect(title1).not.toBe(title5);
			expect(title5).not.toBe(title10);
		});

		it('should return highest title for very high levels', () => {
			const highTitle = getLevelTitle(100);
			expect(highTitle).toBe('Grand Master Scientist');
		});
	});

	describe('getAchievement', () => {
		it('should find achievement by valid ID', () => {
			const firstAchievement = ACHIEVEMENTS[0];
			const found = getAchievement(firstAchievement.id);
			expect(found).toBeDefined();
			expect(found?.id).toBe(firstAchievement.id);
		});

		it('should return undefined for invalid ID', () => {
			const found = getAchievement('non-existent-id');
			expect(found).toBeUndefined();
		});
	});

	describe('calculateTotalPoints', () => {
		it('should return 0 for empty achievements', () => {
			const total = calculateTotalPointsHelper([]);
			expect(total).toBe(0);
		});

		it('should sum points correctly', () => {
			const achievementIds = ACHIEVEMENTS.slice(0, 3).map(a => a.id);
			const expectedTotal = ACHIEVEMENTS.slice(0, 3).reduce((sum, a) => sum + a.points, 0);
			const total = calculateTotalPointsHelper(achievementIds);
			expect(total).toBe(expectedTotal);
		});

		it('should ignore invalid achievement IDs', () => {
			const total = calculateTotalPointsHelper(['invalid-id']);
			expect(total).toBe(0);
		});
	});
});

// Helper function for testing point calculation
function calculateTotalPointsHelper(achievementIds: string[]): number {
	return achievementIds.reduce((total, id) => {
		const achievement = getAchievement(id);
		return total + (achievement?.points ?? 0);
	}, 0);
}
