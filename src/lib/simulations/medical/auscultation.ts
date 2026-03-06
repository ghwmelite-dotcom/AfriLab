/**
 * Heart & Lung Auscultation Lab Simulation
 * Anatomical auscultation points, sound identification, pathology matching
 */

// Sound types
export type HeartSoundType =
	| 'normal_s1s2'
	| 'systolic_murmur'
	| 'diastolic_murmur'
	| 's3_gallop'
	| 's4_gallop'
	| 'mitral_regurgitation'
	| 'aortic_stenosis'
	| 'mitral_stenosis';

export type LungSoundType =
	| 'normal_vesicular'
	| 'crackles_fine'
	| 'crackles_coarse'
	| 'wheezing'
	| 'stridor'
	| 'diminished'
	| 'bronchial'
	| 'pleural_rub';

export type SoundType = HeartSoundType | LungSoundType;

export interface AuscultationPoint {
	id: string;
	name: string;
	area: 'heart' | 'lung';
	description: string;
	// Position on anatomical diagram (percentage)
	x: number;
	y: number;
	// Sound at this point for each scenario
	soundId: string;
}

export interface Sound {
	id: string;
	type: SoundType;
	name: string;
	area: 'heart' | 'lung';
	description: string;
	characteristics: string[];
	waveformPattern: 'regular' | 'irregular' | 'crescendo' | 'decrescendo' | 'continuous';
	timing: string; // when in cardiac/respiratory cycle
	associatedConditions: string[];
}

// Heart auscultation points (standard 4 areas + Erb's point)
export const HEART_AUSCULTATION_POINTS: AuscultationPoint[] = [
	{
		id: 'aortic',
		name: 'Aortic Area',
		area: 'heart',
		description: '2nd intercostal space, right sternal border. Best for aortic valve sounds.',
		x: 42,
		y: 28,
		soundId: 'aortic-sound'
	},
	{
		id: 'pulmonic',
		name: 'Pulmonic Area',
		area: 'heart',
		description: '2nd intercostal space, left sternal border. Best for pulmonic valve sounds.',
		x: 58,
		y: 28,
		soundId: 'pulmonic-sound'
	},
	{
		id: 'erbs',
		name: "Erb's Point",
		area: 'heart',
		description: '3rd intercostal space, left sternal border. Aortic regurgitation best heard here.',
		x: 56,
		y: 35,
		soundId: 'erbs-sound'
	},
	{
		id: 'tricuspid',
		name: 'Tricuspid Area',
		area: 'heart',
		description: '4th-5th intercostal space, left lower sternal border. Tricuspid valve sounds.',
		x: 54,
		y: 42,
		soundId: 'tricuspid-sound'
	},
	{
		id: 'mitral',
		name: 'Mitral (Apex)',
		area: 'heart',
		description: '5th intercostal space, midclavicular line. Mitral valve sounds, S3/S4 gallops.',
		x: 62,
		y: 46,
		soundId: 'mitral-sound'
	}
];

// Lung auscultation points
export const LUNG_AUSCULTATION_POINTS: AuscultationPoint[] = [
	{
		id: 'right-upper',
		name: 'Right Upper Lobe',
		area: 'lung',
		description: 'Anterior: above 4th rib. Listen for bronchial vs vesicular breath sounds.',
		x: 38,
		y: 25,
		soundId: 'right-upper-sound'
	},
	{
		id: 'right-middle',
		name: 'Right Middle Lobe',
		area: 'lung',
		description: 'Anterior: 4th to 6th rib, right side.',
		x: 36,
		y: 38,
		soundId: 'right-middle-sound'
	},
	{
		id: 'right-lower',
		name: 'Right Lower Lobe',
		area: 'lung',
		description: 'Posterior: below scapula. Best area for basal crackles.',
		x: 36,
		y: 52,
		soundId: 'right-lower-sound'
	},
	{
		id: 'left-upper',
		name: 'Left Upper Lobe',
		area: 'lung',
		description: 'Anterior: above 4th rib, left side.',
		x: 62,
		y: 25,
		soundId: 'left-upper-sound'
	},
	{
		id: 'left-lower',
		name: 'Left Lower Lobe',
		area: 'lung',
		description: 'Posterior: below scapula, left side.',
		x: 64,
		y: 52,
		soundId: 'left-lower-sound'
	}
];

// Sound library
export const SOUNDS: Sound[] = [
	// Heart sounds
	{
		id: 'normal-heart',
		type: 'normal_s1s2',
		name: 'Normal S1 S2',
		area: 'heart',
		description: 'Normal first and second heart sounds. S1 (mitral and tricuspid closure) is louder at apex. S2 (aortic and pulmonic closure) is louder at base.',
		characteristics: ['Regular rhythm', '"lub-dub" pattern', 'S1 louder at apex', 'S2 louder at base', 'No extra sounds'],
		waveformPattern: 'regular',
		timing: 'S1 at start of systole, S2 at start of diastole',
		associatedConditions: ['Normal heart function']
	},
	{
		id: 'systolic-ejection-murmur',
		type: 'systolic_murmur',
		name: 'Systolic Ejection Murmur',
		area: 'heart',
		description: 'Crescendo-decrescendo murmur heard between S1 and S2. Harsh quality, best at aortic area radiating to carotids.',
		characteristics: ['Diamond-shaped (crescendo-decrescendo)', 'Between S1 and S2', 'Harsh quality', 'Radiates to carotids', 'Louder with squatting'],
		waveformPattern: 'crescendo',
		timing: 'Mid-systolic (between S1 and S2)',
		associatedConditions: ['Aortic stenosis', 'Hypertrophic cardiomyopathy', 'Flow murmur (innocent)']
	},
	{
		id: 'diastolic-rumble',
		type: 'diastolic_murmur',
		name: 'Diastolic Rumble',
		area: 'heart',
		description: 'Low-pitched rumbling murmur heard in diastole, best at the apex with the bell of the stethoscope in the left lateral decubitus position.',
		characteristics: ['Low-pitched rumble', 'After S2 (diastolic)', 'Best heard at apex', 'Use bell of stethoscope', 'Opening snap may precede'],
		waveformPattern: 'decrescendo',
		timing: 'Mid-to-late diastole',
		associatedConditions: ['Mitral stenosis', 'Rheumatic heart disease']
	},
	{
		id: 's3-gallop',
		type: 's3_gallop',
		name: 'S3 Gallop',
		area: 'heart',
		description: 'Extra heart sound in early diastole, heard just after S2. Creates a "Kentucky" rhythm (lub-dub-ta). Low-pitched, best heard at apex with bell.',
		characteristics: ['Extra sound after S2', '"Kentucky" rhythm', 'Low-pitched', 'Best at apex with bell', 'Increased with left lateral position'],
		waveformPattern: 'regular',
		timing: 'Early diastole (just after S2)',
		associatedConditions: ['Heart failure', 'Volume overload', 'Normal in young adults and pregnancy']
	},
	{
		id: 's4-gallop',
		type: 's4_gallop',
		name: 'S4 Gallop',
		area: 'heart',
		description: 'Extra heart sound in late diastole, just before S1. Creates a "Tennessee" rhythm (ta-lub-dub). Indicates stiff ventricle.',
		characteristics: ['Extra sound before S1', '"Tennessee" rhythm', 'Low-pitched', 'Best at apex with bell', 'Always pathological in adults'],
		waveformPattern: 'regular',
		timing: 'Late diastole (just before S1)',
		associatedConditions: ['Hypertension', 'Aortic stenosis', 'Hypertrophic cardiomyopathy', 'Acute MI']
	},
	{
		id: 'mr-murmur',
		type: 'mitral_regurgitation',
		name: 'Mitral Regurgitation Murmur',
		area: 'heart',
		description: 'Blowing, high-pitched pansystolic murmur best heard at the apex, radiating to the axilla.',
		characteristics: ['Pansystolic (holosystolic)', 'Blowing quality', 'Best at apex', 'Radiates to axilla', 'High-pitched'],
		waveformPattern: 'continuous',
		timing: 'Throughout systole (S1 to S2)',
		associatedConditions: ['Mitral valve prolapse', 'Rheumatic heart disease', 'Dilated cardiomyopathy', 'Post-MI papillary muscle dysfunction']
	},
	// Lung sounds
	{
		id: 'normal-lung',
		type: 'normal_vesicular',
		name: 'Normal Vesicular Breath Sounds',
		area: 'lung',
		description: 'Soft, low-pitched sounds heard throughout inspiration and early expiration. Inspiration is longer and louder than expiration.',
		characteristics: ['Soft and low-pitched', 'Inspiration > expiration (3:1 ratio)', 'Heard over most lung fields', 'No pause between inspiration and expiration'],
		waveformPattern: 'regular',
		timing: 'Throughout inspiration, early expiration',
		associatedConditions: ['Normal lung function']
	},
	{
		id: 'fine-crackles',
		type: 'crackles_fine',
		name: 'Fine Crackles (Rales)',
		area: 'lung',
		description: 'High-pitched, brief, discontinuous popping sounds heard during late inspiration. Like rubbing hair near your ear.',
		characteristics: ['High-pitched', 'Brief, discontinuous', 'Late inspiratory', 'Not cleared by coughing', 'Bilateral in CHF'],
		waveformPattern: 'irregular',
		timing: 'Late inspiration',
		associatedConditions: ['Pulmonary fibrosis', 'Heart failure', 'Pneumonia', 'Atelectasis']
	},
	{
		id: 'coarse-crackles',
		type: 'crackles_coarse',
		name: 'Coarse Crackles',
		area: 'lung',
		description: 'Low-pitched, bubbling, gurgling sounds heard during early inspiration. May clear with coughing.',
		characteristics: ['Low-pitched', 'Bubbling, gurgling', 'Early inspiratory', 'May clear with coughing', 'Louder than fine crackles'],
		waveformPattern: 'irregular',
		timing: 'Early inspiration',
		associatedConditions: ['Bronchitis', 'COPD', 'Pneumonia', 'Bronchiectasis']
	},
	{
		id: 'wheezing-sound',
		type: 'wheezing',
		name: 'Wheezing',
		area: 'lung',
		description: 'High-pitched, musical, continuous sounds produced by narrowed airways. Predominantly expiratory.',
		characteristics: ['High-pitched, musical', 'Continuous', 'Predominantly expiratory', 'Polyphonic or monophonic', 'May be heard without stethoscope if severe'],
		waveformPattern: 'continuous',
		timing: 'Predominantly expiratory',
		associatedConditions: ['Asthma', 'COPD', 'Bronchospasm', 'Foreign body']
	},
	{
		id: 'diminished-sounds',
		type: 'diminished',
		name: 'Diminished Breath Sounds',
		area: 'lung',
		description: 'Markedly reduced or absent breath sounds over an area of the lung.',
		characteristics: ['Reduced or absent sounds', 'May be unilateral or bilateral', 'Compare side to side', 'Dull to percussion if effusion'],
		waveformPattern: 'regular',
		timing: 'Throughout respiratory cycle',
		associatedConditions: ['Pleural effusion', 'Pneumothorax', 'Severe COPD/emphysema', 'Obesity']
	},
	{
		id: 'pleural-rub-sound',
		type: 'pleural_rub',
		name: 'Pleural Friction Rub',
		area: 'lung',
		description: 'Creaking, grating sound heard during both inspiration and expiration. Like walking on fresh snow.',
		characteristics: ['Creaking, grating quality', 'Heard in both phases', 'Localized area', 'Painful for patient', 'Not cleared by coughing'],
		waveformPattern: 'irregular',
		timing: 'Both inspiration and expiration',
		associatedConditions: ['Pleuritis/Pleurisy', 'Pulmonary embolism', 'Pneumonia', 'Tuberculosis']
	}
];

// Clinical scenarios for auscultation
export interface AuscultationScenario {
	id: string;
	patientName: string;
	age: number;
	gender: 'male' | 'female';
	presentation: string;
	heartSounds: Record<string, string>; // point id -> sound id
	lungSounds: Record<string, string>; // point id -> sound id
	correctDiagnosis: string;
	diagnosisOptions: string[];
}

export const AUSCULTATION_SCENARIOS: AuscultationScenario[] = [
	{
		id: 'scenario-normal',
		patientName: 'Blessing Okafor',
		age: 25,
		gender: 'female',
		presentation: 'Routine checkup. No complaints. Healthy young woman.',
		heartSounds: {
			aortic: 'normal-heart',
			pulmonic: 'normal-heart',
			erbs: 'normal-heart',
			tricuspid: 'normal-heart',
			mitral: 'normal-heart'
		},
		lungSounds: {
			'right-upper': 'normal-lung',
			'right-middle': 'normal-lung',
			'right-lower': 'normal-lung',
			'left-upper': 'normal-lung',
			'left-lower': 'normal-lung'
		},
		correctDiagnosis: 'Normal heart and lung sounds',
		diagnosisOptions: ['Normal heart and lung sounds', 'Innocent flow murmur', 'Mild asthma', 'Early heart failure']
	},
	{
		id: 'scenario-chf',
		patientName: 'Emmanuel Mensah',
		age: 68,
		gender: 'male',
		presentation: 'Progressive breathlessness over 3 months. Worse when lying flat. Swollen ankles. History of hypertension.',
		heartSounds: {
			aortic: 'normal-heart',
			pulmonic: 'normal-heart',
			erbs: 'normal-heart',
			tricuspid: 'normal-heart',
			mitral: 's3-gallop'
		},
		lungSounds: {
			'right-upper': 'normal-lung',
			'right-middle': 'normal-lung',
			'right-lower': 'fine-crackles',
			'left-upper': 'normal-lung',
			'left-lower': 'fine-crackles'
		},
		correctDiagnosis: 'Congestive Heart Failure',
		diagnosisOptions: ['Congestive Heart Failure', 'Pneumonia', 'COPD exacerbation', 'Pulmonary fibrosis']
	},
	{
		id: 'scenario-asthma',
		patientName: 'Fatima Yusuf',
		age: 22,
		gender: 'female',
		presentation: 'Acute shortness of breath and chest tightness after exposure to dust. Known asthmatic. Using salbutamol inhaler frequently.',
		heartSounds: {
			aortic: 'normal-heart',
			pulmonic: 'normal-heart',
			erbs: 'normal-heart',
			tricuspid: 'normal-heart',
			mitral: 'normal-heart'
		},
		lungSounds: {
			'right-upper': 'wheezing-sound',
			'right-middle': 'wheezing-sound',
			'right-lower': 'wheezing-sound',
			'left-upper': 'wheezing-sound',
			'left-lower': 'wheezing-sound'
		},
		correctDiagnosis: 'Acute Asthma Exacerbation',
		diagnosisOptions: ['Acute Asthma Exacerbation', 'Pneumothorax', 'Foreign body aspiration', 'Anaphylaxis']
	},
	{
		id: 'scenario-as',
		patientName: 'Joseph Kamau',
		age: 72,
		gender: 'male',
		presentation: 'Exertional syncope and chest pain. Progressive exercise intolerance over 1 year. Known to have a heart murmur.',
		heartSounds: {
			aortic: 'systolic-ejection-murmur',
			pulmonic: 'normal-heart',
			erbs: 'systolic-ejection-murmur',
			tricuspid: 'normal-heart',
			mitral: 's4-gallop'
		},
		lungSounds: {
			'right-upper': 'normal-lung',
			'right-middle': 'normal-lung',
			'right-lower': 'normal-lung',
			'left-upper': 'normal-lung',
			'left-lower': 'normal-lung'
		},
		correctDiagnosis: 'Aortic Stenosis',
		diagnosisOptions: ['Aortic Stenosis', 'Mitral Regurgitation', 'Aortic Regurgitation', 'Hypertrophic Cardiomyopathy']
	}
];

// Quiz questions
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: 'aus-q1',
		question: 'At which auscultation area is the mitral valve best heard?',
		options: ['2nd intercostal space, right sternal border', '2nd intercostal space, left sternal border', '5th intercostal space, midclavicular line', '4th intercostal space, left sternal border'],
		correctIndex: 2,
		explanation: 'The mitral valve is best auscultated at the apex of the heart - 5th intercostal space at the midclavicular line. S1 is loudest here.'
	},
	{
		id: 'aus-q2',
		question: 'An S3 gallop in a 65-year-old is most commonly associated with:',
		options: ['Normal aging', 'Heart failure with volume overload', 'Aortic stenosis', 'Mitral valve prolapse'],
		correctIndex: 1,
		explanation: 'While S3 can be physiological in young adults, in older patients it is pathological and indicates heart failure with volume overload and decreased ventricular compliance.'
	},
	{
		id: 'aus-q3',
		question: 'Bilateral fine inspiratory crackles at the lung bases are most suggestive of:',
		options: ['Asthma', 'Pneumothorax', 'Pulmonary edema/heart failure', 'Pleural effusion'],
		correctIndex: 2,
		explanation: 'Bilateral fine basal crackles (rales) are characteristic of pulmonary edema, typically from heart failure. Fluid in the alveoli causes the crackling sound during inspiration.'
	},
	{
		id: 'aus-q4',
		question: 'A harsh crescendo-decrescendo systolic murmur best heard at the aortic area radiating to the carotids is characteristic of:',
		options: ['Mitral regurgitation', 'Aortic stenosis', 'Mitral stenosis', 'Aortic regurgitation'],
		correctIndex: 1,
		explanation: 'Aortic stenosis produces a harsh, crescendo-decrescendo (diamond-shaped) systolic ejection murmur at the aortic area (2nd right intercostal space) that classically radiates to the carotid arteries.'
	},
	{
		id: 'aus-q5',
		question: 'Wheezing is predominantly heard during which phase of respiration?',
		options: ['Inspiration only', 'Expiration only', 'Predominantly expiration', 'Only during breath-holding'],
		correctIndex: 2,
		explanation: 'Wheezing is predominantly expiratory because airways narrow further during expiration. In severe airway obstruction, wheezing may be heard during both phases (biphasic wheezing).'
	}
];

// Generate waveform data for a sound
export function generateSoundWaveform(sound: Sound, points: number = 200): number[] {
	const data: number[] = [];

	for (let i = 0; i < points; i++) {
		const t = i / points;
		let value = 0;

		switch (sound.type) {
			case 'normal_s1s2': {
				// Regular lub-dub pattern
				const cycle = t * 4; // 4 beats visible
				const pos = cycle % 1;
				if (pos >= 0.05 && pos <= 0.12) value = 0.7 * Math.sin(((pos - 0.05) / 0.07) * Math.PI); // S1
				else if (pos >= 0.35 && pos <= 0.40) value = 0.5 * Math.sin(((pos - 0.35) / 0.05) * Math.PI); // S2
				else value = (Math.random() - 0.5) * 0.03;
				break;
			}
			case 'systolic_murmur': {
				const cycle = t * 4;
				const pos = cycle % 1;
				if (pos >= 0.05 && pos <= 0.10) value = 0.6 * Math.sin(((pos - 0.05) / 0.05) * Math.PI); // S1
				else if (pos >= 0.12 && pos <= 0.33) {
					// Diamond-shaped murmur
					const murmurPhase = (pos - 0.12) / 0.21;
					const envelope = Math.sin(murmurPhase * Math.PI);
					value = envelope * 0.4 * Math.sin(i * 0.8) + (Math.random() - 0.5) * 0.1 * envelope;
				} else if (pos >= 0.35 && pos <= 0.40) value = 0.45 * Math.sin(((pos - 0.35) / 0.05) * Math.PI); // S2
				else value = (Math.random() - 0.5) * 0.03;
				break;
			}
			case 'diastolic_murmur': {
				const cycle = t * 4;
				const pos = cycle % 1;
				if (pos >= 0.05 && pos <= 0.10) value = 0.6 * Math.sin(((pos - 0.05) / 0.05) * Math.PI);
				else if (pos >= 0.35 && pos <= 0.40) value = 0.5 * Math.sin(((pos - 0.35) / 0.05) * Math.PI);
				else if (pos >= 0.45 && pos <= 0.85) {
					const murmurPhase = (pos - 0.45) / 0.4;
					const envelope = Math.exp(-murmurPhase * 2);
					value = envelope * 0.25 * Math.sin(i * 0.6) + (Math.random() - 0.5) * 0.08 * envelope;
				} else value = (Math.random() - 0.5) * 0.03;
				break;
			}
			case 's3_gallop': {
				const cycle = t * 4;
				const pos = cycle % 1;
				if (pos >= 0.05 && pos <= 0.10) value = 0.6 * Math.sin(((pos - 0.05) / 0.05) * Math.PI);
				else if (pos >= 0.35 && pos <= 0.40) value = 0.5 * Math.sin(((pos - 0.35) / 0.05) * Math.PI);
				else if (pos >= 0.45 && pos <= 0.50) value = 0.25 * Math.sin(((pos - 0.45) / 0.05) * Math.PI); // S3
				else value = (Math.random() - 0.5) * 0.03;
				break;
			}
			case 's4_gallop': {
				const cycle = t * 4;
				const pos = cycle % 1;
				if (pos >= 0.92 || pos <= 0.02) {
					const p = pos >= 0.92 ? (pos - 0.92) / 0.1 : (pos + 0.08) / 0.1;
					value = 0.2 * Math.sin(p * Math.PI); // S4
				} else if (pos >= 0.05 && pos <= 0.10) value = 0.6 * Math.sin(((pos - 0.05) / 0.05) * Math.PI);
				else if (pos >= 0.35 && pos <= 0.40) value = 0.5 * Math.sin(((pos - 0.35) / 0.05) * Math.PI);
				else value = (Math.random() - 0.5) * 0.03;
				break;
			}
			case 'mitral_regurgitation': {
				const cycle = t * 4;
				const pos = cycle % 1;
				if (pos >= 0.05 && pos <= 0.10) value = 0.5 * Math.sin(((pos - 0.05) / 0.05) * Math.PI);
				else if (pos >= 0.10 && pos <= 0.34) {
					// Pansystolic - uniform throughout
					value = 0.3 * Math.sin(i * 0.9) + (Math.random() - 0.5) * 0.12;
				} else if (pos >= 0.35 && pos <= 0.40) value = 0.45 * Math.sin(((pos - 0.35) / 0.05) * Math.PI);
				else value = (Math.random() - 0.5) * 0.03;
				break;
			}
			case 'normal_vesicular': {
				// Soft, inspiration louder and longer
				const breathCycle = t * 3;
				const pos = breathCycle % 1;
				if (pos < 0.6) {
					// Inspiration
					const phase = pos / 0.6;
					const envelope = Math.sin(phase * Math.PI) * 0.3;
					value = envelope * Math.sin(i * 0.3) + (Math.random() - 0.5) * 0.05 * envelope;
				} else {
					// Expiration (softer, shorter)
					const phase = (pos - 0.6) / 0.3;
					const envelope = phase < 1 ? Math.sin(phase * Math.PI) * 0.15 : 0;
					value = envelope * Math.sin(i * 0.3) + (Math.random() - 0.5) * 0.03;
				}
				break;
			}
			case 'crackles_fine': {
				const breathCycle = t * 3;
				const pos = breathCycle % 1;
				if (pos < 0.6) {
					const phase = pos / 0.6;
					const envelope = Math.sin(phase * Math.PI) * 0.25;
					value = envelope * Math.sin(i * 0.3);
					// Add crackles in late inspiration
					if (phase > 0.6 && Math.random() > 0.7) value += (Math.random() - 0.3) * 0.4;
				} else {
					value = (Math.random() - 0.5) * 0.04;
				}
				break;
			}
			case 'crackles_coarse': {
				const breathCycle = t * 3;
				const pos = breathCycle % 1;
				if (pos < 0.6) {
					const phase = pos / 0.6;
					const envelope = Math.sin(phase * Math.PI) * 0.25;
					value = envelope * Math.sin(i * 0.3);
					// Coarse crackles in early inspiration
					if (phase < 0.4 && Math.random() > 0.6) value += (Math.random() - 0.3) * 0.6;
				} else {
					value = (Math.random() - 0.5) * 0.05;
				}
				break;
			}
			case 'wheezing': {
				const breathCycle = t * 3;
				const pos = breathCycle % 1;
				if (pos < 0.4) {
					// Inspiration - mild
					const phase = pos / 0.4;
					value = Math.sin(phase * Math.PI) * 0.15 * Math.sin(i * 0.3);
				} else if (pos < 0.85) {
					// Expiration with wheeze
					const phase = (pos - 0.4) / 0.45;
					const envelope = Math.sin(phase * Math.PI) * 0.35;
					value = envelope * (Math.sin(i * 1.5) * 0.6 + Math.sin(i * 2.3) * 0.4);
				} else {
					value = (Math.random() - 0.5) * 0.03;
				}
				break;
			}
			case 'diminished': {
				const breathCycle = t * 3;
				const pos = breathCycle % 1;
				if (pos < 0.6) {
					const phase = pos / 0.6;
					value = Math.sin(phase * Math.PI) * 0.06 * Math.sin(i * 0.3);
				}
				value += (Math.random() - 0.5) * 0.02;
				break;
			}
			case 'pleural_rub': {
				const breathCycle = t * 3;
				const pos = breathCycle % 1;
				const phase = pos < 0.5 ? pos / 0.5 : (pos - 0.5) / 0.5;
				const envelope = Math.sin(phase * Math.PI) * 0.3;
				// Creaking, grating quality
				value = envelope * (Math.sin(i * 0.7) * 0.4 + Math.sin(i * 1.1) * 0.3) + (Math.random() - 0.5) * 0.1 * envelope;
				break;
			}
			default: {
				value = (Math.random() - 0.5) * 0.05;
			}
		}

		data.push(value);
	}

	return data;
}

// State
export interface AuscultationState {
	currentScenarioId: string | null;
	selectedPoint: string | null;
	listenedPoints: Record<string, string[]>; // scenario id -> array of point ids listened to
	soundIdentifications: Record<string, Record<string, string | null>>; // scenario id -> point id -> student's sound identification
	diagnosisAnswers: Record<string, string | null>; // scenario id -> student's diagnosis
	quizAnswers: Record<string, number | null>;
	step: 'learn' | 'practice' | 'diagnose' | 'quiz';
}

export function createInitialState(): AuscultationState {
	const listenedPoints: Record<string, string[]> = {};
	const soundIdentifications: Record<string, Record<string, string | null>> = {};
	const diagnosisAnswers: Record<string, string | null> = {};

	for (const scenario of AUSCULTATION_SCENARIOS) {
		listenedPoints[scenario.id] = [];
		soundIdentifications[scenario.id] = {};
		diagnosisAnswers[scenario.id] = null;
	}

	const quizAnswers: Record<string, number | null> = {};
	for (const q of QUIZ_QUESTIONS) {
		quizAnswers[q.id] = null;
	}

	return {
		currentScenarioId: null,
		selectedPoint: null,
		listenedPoints,
		soundIdentifications,
		diagnosisAnswers,
		quizAnswers,
		step: 'learn'
	};
}

// Actions
export function selectScenario(state: AuscultationState, scenarioId: string): AuscultationState {
	return { ...state, currentScenarioId: scenarioId, selectedPoint: null };
}

export function listenToPoint(state: AuscultationState, scenarioId: string, pointId: string): AuscultationState {
	const current = state.listenedPoints[scenarioId] || [];
	const newPoints = current.includes(pointId) ? current : [...current, pointId];
	return {
		...state,
		selectedPoint: pointId,
		listenedPoints: { ...state.listenedPoints, [scenarioId]: newPoints }
	};
}

export function identifySound(
	state: AuscultationState,
	scenarioId: string,
	pointId: string,
	soundId: string
): AuscultationState {
	const currentIds = state.soundIdentifications[scenarioId] || {};
	return {
		...state,
		soundIdentifications: {
			...state.soundIdentifications,
			[scenarioId]: { ...currentIds, [pointId]: soundId }
		}
	};
}

export function setDiagnosisAnswer(state: AuscultationState, scenarioId: string, diagnosis: string): AuscultationState {
	return {
		...state,
		diagnosisAnswers: { ...state.diagnosisAnswers, [scenarioId]: diagnosis }
	};
}

export function answerQuiz(state: AuscultationState, questionId: string, answerIndex: number): AuscultationState {
	return { ...state, quizAnswers: { ...state.quizAnswers, [questionId]: answerIndex } };
}

export function setStep(state: AuscultationState, step: AuscultationState['step']): AuscultationState {
	return { ...state, step };
}

// Analysis
export interface AuscultationAnalysisResult {
	pointsListened: number;
	totalPoints: number;
	soundsCorrectlyIdentified: number;
	totalSoundsAttempted: number;
	diagnosesCorrect: number;
	totalDiagnoses: number;
	quizScore: number;
	quizTotal: number;
	overallScore: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	feedback: string;
}

export function analyzeAuscultation(state: AuscultationState): AuscultationAnalysisResult {
	let totalListened = 0;
	const totalPointsAll = (HEART_AUSCULTATION_POINTS.length + LUNG_AUSCULTATION_POINTS.length) * AUSCULTATION_SCENARIOS.length;
	let soundsCorrect = 0;
	let soundsAttempted = 0;
	let diagnosesCorrect = 0;

	for (const scenario of AUSCULTATION_SCENARIOS) {
		const listened = state.listenedPoints[scenario.id] || [];
		totalListened += listened.length;

		// Check sound identifications
		const identifications = state.soundIdentifications[scenario.id] || {};
		const allSounds = { ...scenario.heartSounds, ...scenario.lungSounds };

		for (const [pointId, studentSoundId] of Object.entries(identifications)) {
			if (studentSoundId) {
				soundsAttempted++;
				if (allSounds[pointId] === studentSoundId) soundsCorrect++;
			}
		}

		// Check diagnosis
		if (state.diagnosisAnswers[scenario.id] === scenario.correctDiagnosis) {
			diagnosesCorrect++;
		}
	}

	// Quiz
	let quizCorrect = 0;
	for (const q of QUIZ_QUESTIONS) {
		if (state.quizAnswers[q.id] === q.correctIndex) quizCorrect++;
	}

	const listenScore = totalPointsAll > 0 ? (totalListened / totalPointsAll) * 100 : 0;
	const idScore = soundsAttempted > 0 ? (soundsCorrect / soundsAttempted) * 100 : 0;
	const diagScore = AUSCULTATION_SCENARIOS.length > 0 ? (diagnosesCorrect / AUSCULTATION_SCENARIOS.length) * 100 : 0;
	const quizPct = QUIZ_QUESTIONS.length > 0 ? (quizCorrect / QUIZ_QUESTIONS.length) * 100 : 0;

	// Weighted: listening 15%, identification 30%, diagnosis 30%, quiz 25%
	const overallScore = Math.round(listenScore * 0.15 + idScore * 0.3 + diagScore * 0.3 + quizPct * 0.25);

	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	if (overallScore >= 90) grade = 'A';
	else if (overallScore >= 80) grade = 'B';
	else if (overallScore >= 70) grade = 'C';
	else if (overallScore >= 60) grade = 'D';
	else grade = 'F';

	let feedback = '';
	if (overallScore >= 90) {
		feedback = 'Excellent auscultation skills! You correctly identified heart and lung sounds and matched them to clinical diagnoses.';
	} else if (overallScore >= 75) {
		feedback = 'Good auscultation technique. Review the sounds you found challenging and practice distinguishing between similar-sounding findings.';
	} else if (overallScore >= 50) {
		feedback = 'Developing your ear for clinical sounds. Focus on the key characteristics that distinguish normal from abnormal sounds - timing, pitch, and quality.';
	} else {
		feedback = 'Keep practicing! Start by mastering normal S1/S2 and vesicular breath sounds, then learn to identify abnormalities by comparison.';
	}

	return {
		pointsListened: totalListened,
		totalPoints: totalPointsAll,
		soundsCorrectlyIdentified: soundsCorrect,
		totalSoundsAttempted: soundsAttempted,
		diagnosesCorrect,
		totalDiagnoses: AUSCULTATION_SCENARIOS.length,
		quizScore: quizCorrect,
		quizTotal: QUIZ_QUESTIONS.length,
		overallScore,
		grade,
		feedback
	};
}
