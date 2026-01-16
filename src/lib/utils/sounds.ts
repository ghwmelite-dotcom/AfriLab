/**
 * Sound Effects System
 * Provides audio feedback for lab interactions
 */

import { browser } from '$app/environment';

type SoundEffect =
	| 'click'
	| 'success'
	| 'error'
	| 'pour'
	| 'bubble'
	| 'beep'
	| 'switch'
	| 'measurement'
	| 'mix'
	| 'drop'
	| 'slide'
	| 'achievement'
	| 'levelUp';

interface SoundConfig {
	enabled: boolean;
	volume: number;
}

const DEFAULT_CONFIG: SoundConfig = {
	enabled: true,
	volume: 0.5
};

const STORAGE_KEY = 'afrilab_sound_config';

function getConfig(): SoundConfig {
	if (!browser) return DEFAULT_CONFIG;

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
		} catch {
			return DEFAULT_CONFIG;
		}
	}
	return DEFAULT_CONFIG;
}

function saveConfig(config: SoundConfig) {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	}
}

// Audio context and cache
let audioContext: AudioContext | null = null;
const soundCache = new Map<SoundEffect, AudioBuffer>();

// Initialize audio context on first user interaction
function initAudioContext() {
	if (!browser || audioContext) return;

	try {
		audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
	} catch (e) {
		console.warn('Web Audio API not supported');
	}
}

// Generate synthetic sounds using Web Audio API
function generateSound(type: SoundEffect): AudioBuffer | null {
	if (!audioContext) return null;

	const sampleRate = audioContext.sampleRate;
	let duration: number;
	let buffer: AudioBuffer;

	switch (type) {
		case 'click':
			duration = 0.05;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateClickSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'success':
			duration = 0.3;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateSuccessSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'error':
			duration = 0.2;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateErrorSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'pour':
			duration = 0.8;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generatePourSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'bubble':
			duration = 0.3;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateBubbleSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'beep':
			duration = 0.15;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateBeepSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'switch':
			duration = 0.08;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateSwitchSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'measurement':
			duration = 0.1;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateMeasurementSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'mix':
			duration = 0.5;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateMixSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'drop':
			duration = 0.15;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateDropSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'slide':
			duration = 0.2;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateSlideSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'achievement':
			duration = 0.6;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateAchievementSound(buffer.getChannelData(0), sampleRate);
			break;

		case 'levelUp':
			duration = 0.8;
			buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
			generateLevelUpSound(buffer.getChannelData(0), sampleRate);
			break;

		default:
			return null;
	}

	return buffer;
}

// Sound generation functions
function generateClickSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const envelope = Math.exp(-t * 50);
		data[i] = envelope * (Math.random() * 2 - 1) * 0.3;
	}
}

function generateSuccessSound(data: Float32Array, sampleRate: number) {
	const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const noteIndex = Math.floor(t / 0.1) % 3;
		const envelope = Math.exp(-((t % 0.1) * 10)) * (1 - t / 0.3);
		data[i] = envelope * Math.sin(2 * Math.PI * frequencies[noteIndex] * t) * 0.3;
	}
}

function generateErrorSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const envelope = Math.exp(-t * 10);
		const freq = 200 + Math.sin(t * 30) * 50;
		data[i] = envelope * Math.sin(2 * Math.PI * freq * t) * 0.3;
	}
}

function generatePourSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const noise = Math.random() * 2 - 1;
		const envelope = Math.sin(t * Math.PI / 0.8) * 0.5;
		const filtered = noise * envelope * 0.2;
		data[i] = filtered;
	}
}

function generateBubbleSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const bubbleFreq = 400 + Math.random() * 200;
		const envelope = Math.exp(-t * 15) * Math.sin(t * Math.PI / 0.3);
		data[i] = envelope * Math.sin(2 * Math.PI * bubbleFreq * t) * 0.2;
	}
}

function generateBeepSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const envelope = Math.min(1, t * 20) * Math.exp(-(t - 0.05) * 20);
		data[i] = envelope * Math.sin(2 * Math.PI * 880 * t) * 0.3;
	}
}

function generateSwitchSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const envelope = Math.exp(-t * 80);
		data[i] = envelope * (Math.random() * 2 - 1) * 0.4;
	}
}

function generateMeasurementSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const envelope = Math.exp(-t * 30);
		data[i] = envelope * Math.sin(2 * Math.PI * 1200 * t) * 0.2;
	}
}

function generateMixSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const noise = Math.random() * 2 - 1;
		const swirl = Math.sin(t * 20) * 0.3;
		const envelope = Math.sin(t * Math.PI / 0.5);
		data[i] = (noise * 0.1 + swirl * 0.1) * envelope;
	}
}

function generateDropSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const freq = 600 * Math.exp(-t * 20);
		const envelope = Math.exp(-t * 20);
		data[i] = envelope * Math.sin(2 * Math.PI * freq * t) * 0.3;
	}
}

function generateSlideSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const noise = Math.random() * 2 - 1;
		const envelope = Math.sin(t * Math.PI / 0.2) * 0.3;
		data[i] = noise * envelope * 0.15;
	}
}

function generateAchievementSound(data: Float32Array, sampleRate: number) {
	const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		let value = 0;
		for (let j = 0; j < frequencies.length; j++) {
			const noteStart = j * 0.12;
			if (t >= noteStart) {
				const localT = t - noteStart;
				const envelope = Math.exp(-localT * 5) * Math.min(1, localT * 20);
				value += envelope * Math.sin(2 * Math.PI * frequencies[j] * localT) * 0.15;
			}
		}
		data[i] = value;
	}
}

function generateLevelUpSound(data: Float32Array, sampleRate: number) {
	for (let i = 0; i < data.length; i++) {
		const t = i / sampleRate;
		const freqRise = 400 + t * 800;
		const envelope = Math.sin(t * Math.PI / 0.8) * 0.4;
		const sparkle = Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 5) * 0.1;
		data[i] = envelope * Math.sin(2 * Math.PI * freqRise * t) * 0.3 + sparkle;
	}
}

class SoundManager {
	private config: SoundConfig;

	constructor() {
		this.config = getConfig();
	}

	get enabled() {
		return this.config.enabled;
	}

	get volume() {
		return this.config.volume;
	}

	setEnabled(enabled: boolean) {
		this.config.enabled = enabled;
		saveConfig(this.config);
	}

	setVolume(volume: number) {
		this.config.volume = Math.max(0, Math.min(1, volume));
		saveConfig(this.config);
	}

	play(sound: SoundEffect) {
		if (!browser || !this.config.enabled) return;

		initAudioContext();
		if (!audioContext) return;

		// Resume audio context if suspended (required after user interaction)
		if (audioContext.state === 'suspended') {
			audioContext.resume();
		}

		// Get or generate sound buffer
		let buffer = soundCache.get(sound);
		if (!buffer) {
			buffer = generateSound(sound) || undefined;
			if (buffer) {
				soundCache.set(sound, buffer);
			}
		}

		if (!buffer) return;

		// Create and play sound
		const source = audioContext.createBufferSource();
		const gainNode = audioContext.createGain();

		source.buffer = buffer;
		gainNode.gain.value = this.config.volume;

		source.connect(gainNode);
		gainNode.connect(audioContext.destination);

		source.start(0);
	}

	// Convenience methods for common sounds
	click() { this.play('click'); }
	success() { this.play('success'); }
	error() { this.play('error'); }
	pour() { this.play('pour'); }
	bubble() { this.play('bubble'); }
	beep() { this.play('beep'); }
	switch() { this.play('switch'); }
	measurement() { this.play('measurement'); }
	mix() { this.play('mix'); }
	drop() { this.play('drop'); }
	slide() { this.play('slide'); }
	achievement() { this.play('achievement'); }
	levelUp() { this.play('levelUp'); }
}

export const soundManager = new SoundManager();
