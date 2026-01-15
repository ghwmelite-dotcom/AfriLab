import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} min`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
	return value.toFixed(decimals);
}

/**
 * Calculate pH color based on value
 */
export function getPHColor(pH: number): string {
	if (pH < 3) return '#dc2626'; // Strong acid - red
	if (pH < 6) return '#f97316'; // Weak acid - orange
	if (pH < 8) return '#22c55e'; // Neutral - green
	if (pH < 11) return '#3b82f6'; // Weak base - blue
	return '#6366f1'; // Strong base - indigo
}

/**
 * Get indicator color for titration
 */
export function getIndicatorColor(pH: number, indicator: 'phenolphthalein' | 'methyl-orange' | 'bromothymol-blue'): string {
	switch (indicator) {
		case 'phenolphthalein':
			return pH < 8.2 ? 'transparent' : pH < 10 ? '#f472b6' : '#ec4899';
		case 'methyl-orange':
			return pH < 3.1 ? '#ef4444' : pH < 4.4 ? '#f97316' : '#fbbf24';
		case 'bromothymol-blue':
			return pH < 6 ? '#fbbf24' : pH < 7.6 ? '#22c55e' : '#3b82f6';
		default:
			return 'transparent';
	}
}

/**
 * Calculate pH from H+ concentration
 */
export function calculatePH(hConcentration: number): number {
	return -Math.log10(hConcentration);
}

/**
 * Calculate H+ concentration from pH
 */
export function calculateHConcentration(pH: number): number {
	return Math.pow(10, -pH);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function (...args: Parameters<T>) {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean = false;

	return function (...args: Parameters<T>) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
	return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
	value: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number
): number {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
	if (str.length <= length) return str;
	return str.slice(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format score as percentage
 */
export function formatScore(score: number): string {
	return `${Math.round(score)}%`;
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
	switch (difficulty) {
		case 'beginner':
			return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
		case 'intermediate':
			return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
		case 'advanced':
			return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
	}
}
