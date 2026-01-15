import type { Experiment, LabSession, DashboardStats, ActivityItem, Measurement } from '$types';

/**
 * Get all active disciplines
 */
export async function getDisciplines(db: D1Database) {
	const result = await db
		.prepare('SELECT * FROM disciplines WHERE is_active = 1 ORDER BY name')
		.all();

	return result.results;
}

/**
 * Get experiments by discipline
 */
export async function getExperimentsByDiscipline(db: D1Database, disciplineId: string): Promise<Experiment[]> {
	const result = await db
		.prepare(`
			SELECT id, discipline_id, title, slug, description, difficulty, duration_minutes,
			       instructions, simulation_config, safety_notes, learning_objectives, thumbnail_url
			FROM experiments
			WHERE discipline_id = ? AND is_active = 1
			ORDER BY difficulty, title
		`)
		.bind(disciplineId)
		.all();

	return result.results.map((row) => ({
		id: row.id as string,
		disciplineId: row.discipline_id as string,
		title: row.title as string,
		description: row.description as string,
		difficulty: row.difficulty as 'beginner' | 'intermediate' | 'advanced',
		durationMinutes: row.duration_minutes as number,
		instructions: JSON.parse(row.instructions as string || '[]'),
		simulationConfig: JSON.parse(row.simulation_config as string || '{}'),
		safetyNotes: row.safety_notes as string,
		learningObjectives: JSON.parse(row.learning_objectives as string || '[]')
	}));
}

/**
 * Get experiment by ID
 */
export async function getExperimentById(db: D1Database, experimentId: string): Promise<Experiment | null> {
	const result = await db
		.prepare(`
			SELECT id, discipline_id, title, slug, description, difficulty, duration_minutes,
			       instructions, simulation_config, safety_notes, learning_objectives, thumbnail_url
			FROM experiments
			WHERE id = ?
		`)
		.bind(experimentId)
		.first();

	if (!result) return null;

	return {
		id: result.id as string,
		disciplineId: result.discipline_id as string,
		title: result.title as string,
		description: result.description as string,
		difficulty: result.difficulty as 'beginner' | 'intermediate' | 'advanced',
		durationMinutes: result.duration_minutes as number,
		instructions: JSON.parse(result.instructions as string || '[]'),
		simulationConfig: JSON.parse(result.simulation_config as string || '{}'),
		safetyNotes: result.safety_notes as string,
		learningObjectives: JSON.parse(result.learning_objectives as string || '[]')
	};
}

/**
 * Create a new lab session
 */
export async function createLabSession(
	db: D1Database,
	userId: string,
	experimentId: string
): Promise<LabSession> {
	const id = crypto.randomUUID();

	await db
		.prepare(`
			INSERT INTO lab_sessions (id, user_id, experiment_id, status, data)
			VALUES (?, ?, ?, 'in_progress', '{}')
		`)
		.bind(id, userId, experimentId)
		.run();

	return {
		id,
		userId,
		experimentId,
		status: 'in_progress',
		startedAt: new Date(),
		completedAt: null,
		data: {
			currentStep: 0,
			measurements: [],
			notes: [],
			actions: []
		},
		score: null
	};
}

/**
 * Get active lab session for user
 */
export async function getActiveSession(
	db: D1Database,
	userId: string,
	experimentId: string
): Promise<LabSession | null> {
	const result = await db
		.prepare(`
			SELECT id, user_id, experiment_id, status, current_step, data, score, started_at, completed_at
			FROM lab_sessions
			WHERE user_id = ? AND experiment_id = ? AND status = 'in_progress'
			ORDER BY started_at DESC
			LIMIT 1
		`)
		.bind(userId, experimentId)
		.first();

	if (!result) return null;

	return {
		id: result.id as string,
		userId: result.user_id as string,
		experimentId: result.experiment_id as string,
		status: result.status as 'in_progress' | 'completed' | 'abandoned',
		startedAt: new Date(result.started_at as string),
		completedAt: result.completed_at ? new Date(result.completed_at as string) : null,
		data: JSON.parse(result.data as string || '{}'),
		score: result.score as number | null
	};
}

/**
 * Update lab session
 */
export async function updateLabSession(
	db: D1Database,
	sessionId: string,
	data: Partial<{
		status: 'in_progress' | 'completed' | 'abandoned';
		currentStep: number;
		sessionData: object;
		score: number;
	}>
): Promise<void> {
	const updates: string[] = [];
	const values: (string | number)[] = [];

	if (data.status) {
		updates.push('status = ?');
		values.push(data.status);
		if (data.status === 'completed') {
			updates.push("completed_at = datetime('now')");
		}
	}

	if (data.currentStep !== undefined) {
		updates.push('current_step = ?');
		values.push(data.currentStep);
	}

	if (data.sessionData) {
		updates.push('data = ?');
		values.push(JSON.stringify(data.sessionData));
	}

	if (data.score !== undefined) {
		updates.push('score = ?');
		values.push(data.score);
	}

	if (updates.length === 0) return;

	values.push(sessionId);

	await db
		.prepare(`UPDATE lab_sessions SET ${updates.join(', ')} WHERE id = ?`)
		.bind(...values)
		.run();
}

/**
 * Save measurement
 */
export async function saveMeasurement(
	db: D1Database,
	sessionId: string,
	measurement: Omit<Measurement, 'id' | 'timestamp'>
): Promise<void> {
	const id = crypto.randomUUID();

	await db
		.prepare(`
			INSERT INTO measurements (id, session_id, type, value, unit, label)
			VALUES (?, ?, ?, ?, ?, ?)
		`)
		.bind(id, sessionId, measurement.type, measurement.value, measurement.unit, measurement.label || null)
		.run();
}

/**
 * Get dashboard stats for a user
 */
export async function getDashboardStats(db: D1Database, userId: string): Promise<DashboardStats> {
	// Get lab counts
	const counts = await db
		.prepare(`
			SELECT
				COUNT(*) as total,
				SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
				SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
				AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as avg_score,
				SUM(time_spent_seconds) as total_time
			FROM lab_sessions
			WHERE user_id = ?
		`)
		.bind(userId)
		.first();

	// Get recent activity
	const activity = await db
		.prepare(`
			SELECT ls.id, ls.status, ls.started_at, ls.completed_at, e.title
			FROM lab_sessions ls
			JOIN experiments e ON ls.experiment_id = e.id
			WHERE ls.user_id = ?
			ORDER BY ls.started_at DESC
			LIMIT 5
		`)
		.bind(userId)
		.all();

	const recentActivity: ActivityItem[] = activity.results.map((row) => ({
		id: row.id as string,
		type: row.status === 'completed' ? 'lab_completed' : 'lab_started',
		title: row.title as string,
		timestamp: new Date((row.completed_at || row.started_at) as string)
	}));

	return {
		totalLabs: (counts?.total as number) || 0,
		completedLabs: (counts?.completed as number) || 0,
		inProgressLabs: (counts?.in_progress as number) || 0,
		averageScore: (counts?.avg_score as number) || 0,
		timeSpent: (counts?.total_time as number) || 0,
		recentActivity
	};
}

/**
 * Get user's lab history
 */
export async function getLabHistory(db: D1Database, userId: string, limit: number = 20) {
	const result = await db
		.prepare(`
			SELECT ls.*, e.title, e.difficulty, d.name as discipline_name
			FROM lab_sessions ls
			JOIN experiments e ON ls.experiment_id = e.id
			JOIN disciplines d ON e.discipline_id = d.id
			WHERE ls.user_id = ?
			ORDER BY ls.started_at DESC
			LIMIT ?
		`)
		.bind(userId, limit)
		.all();

	return result.results;
}

/**
 * Get instructor's students
 */
export async function getInstructorStudents(db: D1Database, instructorId: string) {
	// Get institution ID of instructor
	const instructor = await db
		.prepare('SELECT institution_id FROM users WHERE id = ?')
		.bind(instructorId)
		.first();

	if (!instructor?.institution_id) return [];

	const result = await db
		.prepare(`
			SELECT u.id, u.email, u.first_name, u.last_name,
			       COUNT(ls.id) as total_labs,
			       SUM(CASE WHEN ls.status = 'completed' THEN 1 ELSE 0 END) as completed_labs,
			       AVG(ls.score) as avg_score
			FROM users u
			LEFT JOIN lab_sessions ls ON u.id = ls.user_id
			WHERE u.institution_id = ? AND u.role = 'student'
			GROUP BY u.id
			ORDER BY u.last_name, u.first_name
		`)
		.bind(instructor.institution_id)
		.all();

	return result.results;
}
