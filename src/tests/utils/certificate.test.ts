import { describe, test, expect, vi } from 'vitest';
import {
	generateCertificateId,
	generateCertificateHTML,
	calculateGrade,
	calculateXP,
	type CertificateData
} from '$lib/utils/certificate';

describe('Certificate Utility', () => {
	const mockCertificateData: CertificateData = {
		studentName: 'John Doe',
		studentId: 'STU001',
		labTitle: 'Acid-Base Titration',
		labDiscipline: 'Chemistry',
		completionDate: 'January 15, 2026',
		duration: 45,
		score: 92,
		grade: 'A',
		xpEarned: 100,
		certificateId: 'AFL-TEST-123',
		institutionName: 'AfriLab Virtual Laboratory'
	};

	describe('generateCertificateId', () => {
		test('generates unique IDs', () => {
			const id1 = generateCertificateId();
			const id2 = generateCertificateId();

			expect(id1).not.toBe(id2);
		});

		test('ID follows correct format', () => {
			const id = generateCertificateId();

			expect(id).toMatch(/^AFL-[A-Z0-9]+-[A-Z0-9]+$/);
		});

		test('ID starts with AFL prefix', () => {
			const id = generateCertificateId();

			expect(id.startsWith('AFL-')).toBe(true);
		});
	});

	describe('calculateGrade', () => {
		test('returns A for score >= 90', () => {
			expect(calculateGrade(90)).toBe('A');
			expect(calculateGrade(95)).toBe('A');
			expect(calculateGrade(100)).toBe('A');
		});

		test('returns B for score 80-89', () => {
			expect(calculateGrade(80)).toBe('B');
			expect(calculateGrade(85)).toBe('B');
			expect(calculateGrade(89)).toBe('B');
		});

		test('returns C for score 70-79', () => {
			expect(calculateGrade(70)).toBe('C');
			expect(calculateGrade(75)).toBe('C');
			expect(calculateGrade(79)).toBe('C');
		});

		test('returns D for score 60-69', () => {
			expect(calculateGrade(60)).toBe('D');
			expect(calculateGrade(65)).toBe('D');
			expect(calculateGrade(69)).toBe('D');
		});

		test('returns F for score < 60', () => {
			expect(calculateGrade(59)).toBe('F');
			expect(calculateGrade(50)).toBe('F');
			expect(calculateGrade(0)).toBe('F');
		});
	});

	describe('calculateXP', () => {
		test('calculates XP for beginner difficulty', () => {
			expect(calculateXP(100, 'beginner')).toBe(50);
			expect(calculateXP(80, 'beginner')).toBe(40);
			expect(calculateXP(50, 'beginner')).toBe(25);
		});

		test('calculates XP for intermediate difficulty', () => {
			expect(calculateXP(100, 'intermediate')).toBe(100);
			expect(calculateXP(80, 'intermediate')).toBe(80);
			expect(calculateXP(50, 'intermediate')).toBe(50);
		});

		test('calculates XP for advanced difficulty', () => {
			expect(calculateXP(100, 'advanced')).toBe(150);
			expect(calculateXP(80, 'advanced')).toBe(120);
			expect(calculateXP(50, 'advanced')).toBe(75);
		});

		test('defaults to intermediate difficulty', () => {
			expect(calculateXP(100)).toBe(100);
		});

		test('rounds XP to whole number', () => {
			expect(calculateXP(33, 'beginner')).toBe(17); // 16.5 rounded
			expect(calculateXP(67, 'intermediate')).toBe(67);
		});
	});

	describe('generateCertificateHTML', () => {
		test('generates valid HTML document', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('<!DOCTYPE html>');
			expect(html).toContain('<html lang="en">');
			expect(html).toContain('</html>');
		});

		test('includes student name', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('John Doe');
		});

		test('includes lab title', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('Acid-Base Titration');
		});

		test('includes discipline', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('Chemistry');
		});

		test('includes score and grade', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('92%');
			expect(html).toContain('>A<');
		});

		test('includes XP earned', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('+100');
		});

		test('includes certificate ID', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('AFL-TEST-123');
		});

		test('includes completion date', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('January 15, 2026');
		});

		test('includes duration', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('45m');
		});

		test('uses different colors for different disciplines', () => {
			const chemistryData = { ...mockCertificateData, labDiscipline: 'Chemistry' };
			const biologyData = { ...mockCertificateData, labDiscipline: 'Biology' };

			const chemistryHtml = generateCertificateHTML(chemistryData);
			const biologyHtml = generateCertificateHTML(biologyData);

			// Chemistry uses cyan colors
			expect(chemistryHtml).toContain('#06b6d4');
			// Biology uses emerald colors
			expect(biologyHtml).toContain('#10b981');
		});

		test('includes trophy emoji for grade A', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('🏆');
		});

		test('includes silver medal emoji for grade B', () => {
			const gradeBData = { ...mockCertificateData, grade: 'B' };
			const html = generateCertificateHTML(gradeBData);

			expect(html).toContain('🥈');
		});

		test('includes bronze medal emoji for grade C', () => {
			const gradeCData = { ...mockCertificateData, grade: 'C' };
			const html = generateCertificateHTML(gradeCData);

			expect(html).toContain('🥉');
		});

		test('includes scroll emoji for lower grades', () => {
			const gradeDData = { ...mockCertificateData, grade: 'D' };
			const html = generateCertificateHTML(gradeDData);

			expect(html).toContain('📜');
		});

		test('includes print media styles', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('@media print');
		});

		test('includes AfriLab branding', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('AFRI');
			expect(html).toContain('LAB');
		});

		test('includes certificate of completion text', () => {
			const html = generateCertificateHTML(mockCertificateData);

			expect(html).toContain('Certificate of Completion');
		});

		test('handles all discipline colors', () => {
			const disciplines = ['Chemistry', 'Biology', 'Physics', 'Pharmacy', 'Medical'];

			disciplines.forEach((discipline) => {
				const data = { ...mockCertificateData, labDiscipline: discipline };
				const html = generateCertificateHTML(data);

				// Should generate valid HTML for each discipline
				expect(html).toContain('<!DOCTYPE html>');
				expect(html).toContain(discipline);
			});
		});

		test('defaults to Chemistry colors for unknown discipline', () => {
			const unknownDisciplineData = { ...mockCertificateData, labDiscipline: 'Unknown' };
			const html = generateCertificateHTML(unknownDisciplineData);

			// Should use Chemistry (cyan) as default
			expect(html).toContain('#06b6d4');
		});
	});

	describe('CertificateData interface', () => {
		test('accepts all required fields', () => {
			const data: CertificateData = {
				studentName: 'Test Student',
				studentId: 'ID123',
				labTitle: 'Test Lab',
				labDiscipline: 'Physics',
				completionDate: 'January 1, 2026',
				duration: 30,
				score: 85,
				grade: 'B',
				xpEarned: 85,
				certificateId: 'AFL-123',
				institutionName: 'Test Institution'
			};

			expect(data.studentName).toBe('Test Student');
			expect(data.score).toBe(85);
		});
	});
});
