// User & Authentication Types
export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: 'student' | 'instructor' | 'admin';
	institutionId: string | null;
	avatarUrl?: string;
	authProvider?: 'email' | 'google';
	createdAt: Date;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export interface Institution {
	id: string;
	name: string;
	code: string;
	country: string | null;
	createdAt: Date;
}

// Lab & Experiment Types
export type Discipline = 'chemistry' | 'biology' | 'physics' | 'pharmacy' | 'medical';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Experiment {
	id: string;
	disciplineId: string;
	title: string;
	description: string;
	difficulty: Difficulty;
	durationMinutes: number;
	instructions: ExperimentStep[];
	simulationConfig: SimulationConfig;
	safetyNotes: string;
	learningObjectives: string[];
}

export interface ExperimentStep {
	id: number;
	title: string;
	description: string;
	action?: string;
	expectedOutcome?: string;
	hints?: string[];
}

export interface SimulationConfig {
	type: string;
	parameters: Record<string, unknown>;
	equipment: string[];
	chemicals?: ChemicalConfig[];
}

export interface ChemicalConfig {
	id: string;
	name: string;
	formula: string;
	concentration?: number;
	volume?: number;
	color: string;
	type: 'acid' | 'base' | 'indicator' | 'neutral';
}

// Lab Session Types
export interface LabSession {
	id: string;
	userId: string;
	experimentId: string;
	status: SessionStatus;
	startedAt: Date;
	completedAt: Date | null;
	data: LabSessionData;
	score: number | null;
}

export interface LabSessionData {
	currentStep: number;
	measurements: Measurement[];
	notes: string[];
	actions: LabAction[];
}

export interface Measurement {
	id: string;
	timestamp: Date;
	type: string;
	value: number;
	unit: string;
	label?: string;
}

export interface LabAction {
	timestamp: Date;
	action: string;
	details?: Record<string, unknown>;
}

// Assessment Types
export interface Assessment {
	id: string;
	sessionId: string;
	aiFeedback: string | null;
	manualFeedback: string | null;
	grade: string | null;
	createdAt: Date;
}

// AI Types
export interface AIMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
}

export interface AIConversation {
	id: string;
	userId: string;
	experimentId: string | null;
	messages: AIMessage[];
	createdAt: Date;
}

export interface AIContext {
	discipline: Discipline;
	experimentTitle: string;
	currentStep: number;
	studentLevel: Difficulty;
	recentMeasurements: Measurement[];
}

// Chemistry-specific Types
export interface TitrationState {
	buretteVolume: number;
	buretteInitialVolume: number;
	flaskVolume: number;
	flaskConcentration: number;
	titrantConcentration: number;
	pH: number;
	indicatorColor: string;
	isPouring: boolean;
	dropCount: number;
	measurements: TitrationMeasurement[];
	endpointReached: boolean;
}

export interface TitrationMeasurement {
	volumeAdded: number;
	pH: number;
	color: string;
	timestamp: Date;
}

// Dashboard Types
export interface DashboardStats {
	totalLabs: number;
	completedLabs: number;
	inProgressLabs: number;
	averageScore: number;
	timeSpent: number;
	recentActivity: ActivityItem[];
}

export interface ActivityItem {
	id: string;
	type: 'lab_started' | 'lab_completed' | 'assessment_received';
	title: string;
	timestamp: Date;
	details?: string;
}

// API Response Types
export interface APIResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}
