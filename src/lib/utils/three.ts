/**
 * Three.js Utilities for 3D Lab Equipment
 * Provides reusable 3D scene management and equipment rendering
 */

import { browser } from '$app/environment';
import * as THREE from 'three';

export interface SceneConfig {
	antialias?: boolean;
	alpha?: boolean;
	shadowMap?: boolean;
	pixelRatio?: number;
}

export interface LightingConfig {
	ambient?: { color: number; intensity: number };
	directional?: { color: number; intensity: number; position: THREE.Vector3 };
	point?: { color: number; intensity: number; position: THREE.Vector3 }[];
}

const DEFAULT_SCENE_CONFIG: SceneConfig = {
	antialias: true,
	alpha: true,
	shadowMap: true,
	pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1
};

const DEFAULT_LIGHTING: LightingConfig = {
	ambient: { color: 0xffffff, intensity: 0.4 },
	directional: {
		color: 0xffffff,
		intensity: 0.8,
		position: new THREE.Vector3(5, 10, 7)
	}
};

/**
 * Creates and manages a Three.js scene
 */
export class LabScene {
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	public renderer: THREE.WebGLRenderer | null = null;
	public animationId: number | null = null;

	private container: HTMLElement | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private animationCallbacks: ((delta: number) => void)[] = [];
	private clock: THREE.Clock;

	constructor(config: SceneConfig = {}) {
		const mergedConfig = { ...DEFAULT_SCENE_CONFIG, ...config };

		// Create scene
		this.scene = new THREE.Scene();
		this.scene.background = null; // Transparent background

		// Create camera
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
		this.camera.position.set(0, 2, 5);
		this.camera.lookAt(0, 0, 0);

		// Create clock for animations
		this.clock = new THREE.Clock();

		if (browser) {
			// Create renderer
			this.renderer = new THREE.WebGLRenderer({
				antialias: mergedConfig.antialias,
				alpha: mergedConfig.alpha
			});

			this.renderer.setPixelRatio(mergedConfig.pixelRatio || 1);

			if (mergedConfig.shadowMap) {
				this.renderer.shadowMap.enabled = true;
				this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			}
		}
	}

	/**
	 * Mount the scene to a container element
	 */
	mount(container: HTMLElement) {
		if (!browser || !this.renderer) return;

		this.container = container;

		// Set size
		const { width, height } = container.getBoundingClientRect();
		this.resize(width, height);

		// Add canvas to container
		container.appendChild(this.renderer.domElement);

		// Set up resize observer
		this.resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const { width, height } = entry.contentRect;
				this.resize(width, height);
			}
		});
		this.resizeObserver.observe(container);

		// Start animation loop
		this.startAnimation();
	}

	/**
	 * Resize the renderer and camera
	 */
	resize(width: number, height: number) {
		if (!this.renderer) return;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	/**
	 * Add lighting to the scene
	 */
	addLighting(config: LightingConfig = DEFAULT_LIGHTING) {
		if (config.ambient) {
			const ambient = new THREE.AmbientLight(config.ambient.color, config.ambient.intensity);
			this.scene.add(ambient);
		}

		if (config.directional) {
			const directional = new THREE.DirectionalLight(config.directional.color, config.directional.intensity);
			directional.position.copy(config.directional.position);
			directional.castShadow = true;
			directional.shadow.mapSize.width = 1024;
			directional.shadow.mapSize.height = 1024;
			this.scene.add(directional);
		}

		if (config.point) {
			config.point.forEach((pointConfig) => {
				const point = new THREE.PointLight(pointConfig.color, pointConfig.intensity);
				point.position.copy(pointConfig.position);
				this.scene.add(point);
			});
		}
	}

	/**
	 * Add an animation callback
	 */
	onAnimate(callback: (delta: number) => void) {
		this.animationCallbacks.push(callback);
		return () => {
			const index = this.animationCallbacks.indexOf(callback);
			if (index > -1) {
				this.animationCallbacks.splice(index, 1);
			}
		};
	}

	/**
	 * Start the animation loop
	 */
	private startAnimation() {
		const animate = () => {
			this.animationId = requestAnimationFrame(animate);

			const delta = this.clock.getDelta();

			// Run animation callbacks
			this.animationCallbacks.forEach((callback) => callback(delta));

			// Render
			if (this.renderer) {
				this.renderer.render(this.scene, this.camera);
			}
		};

		animate();
	}

	/**
	 * Clean up and dispose of resources
	 */
	dispose() {
		// Stop animation
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
		}

		// Disconnect resize observer
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}

		// Remove canvas
		if (this.renderer && this.container) {
			this.container.removeChild(this.renderer.domElement);
		}

		// Dispose renderer
		if (this.renderer) {
			this.renderer.dispose();
		}

		// Dispose scene objects
		this.scene.traverse((object) => {
			if (object instanceof THREE.Mesh) {
				object.geometry.dispose();
				if (Array.isArray(object.material)) {
					object.material.forEach((mat) => mat.dispose());
				} else {
					object.material.dispose();
				}
			}
		});
	}
}

/**
 * Creates a glass material for beakers/flasks
 */
export function createGlassMaterial(color: number = 0x88ccff, opacity: number = 0.3): THREE.MeshPhysicalMaterial {
	return new THREE.MeshPhysicalMaterial({
		color,
		transparent: true,
		opacity,
		roughness: 0.1,
		metalness: 0,
		transmission: 0.9,
		thickness: 0.5,
		clearcoat: 1,
		clearcoatRoughness: 0.1
	});
}

/**
 * Creates a liquid material
 */
export function createLiquidMaterial(color: number, opacity: number = 0.8): THREE.MeshPhysicalMaterial {
	return new THREE.MeshPhysicalMaterial({
		color,
		transparent: true,
		opacity,
		roughness: 0.1,
		metalness: 0,
		clearcoat: 0.3
	});
}

/**
 * Creates a beaker geometry
 */
export function createBeakerGeometry(
	radius: number = 0.5,
	height: number = 1.5,
	wallThickness: number = 0.02
): THREE.BufferGeometry {
	const shape = new THREE.Shape();

	// Outer profile
	shape.moveTo(0, 0);
	shape.lineTo(radius, 0);
	shape.lineTo(radius, height * 0.9);
	shape.lineTo(radius * 1.1, height);
	shape.lineTo(radius * 1.1 - wallThickness, height);
	shape.lineTo(radius - wallThickness, height * 0.9);
	shape.lineTo(radius - wallThickness, wallThickness);
	shape.lineTo(0, wallThickness);

	const geometry = new THREE.LatheGeometry(shape.getPoints(32), 64);
	return geometry;
}

/**
 * Creates a flask geometry (Erlenmeyer)
 */
export function createFlaskGeometry(
	baseRadius: number = 0.6,
	neckRadius: number = 0.15,
	height: number = 1.2,
	neckHeight: number = 0.4
): THREE.BufferGeometry {
	const points: THREE.Vector2[] = [];

	// Base
	points.push(new THREE.Vector2(0, 0));
	points.push(new THREE.Vector2(baseRadius, 0));

	// Curved body to neck
	const segments = 20;
	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const y = height * t;
		const x = baseRadius - (baseRadius - neckRadius) * Math.pow(t, 0.5);
		points.push(new THREE.Vector2(x, y));
	}

	// Neck
	points.push(new THREE.Vector2(neckRadius, height + neckHeight));
	points.push(new THREE.Vector2(neckRadius * 1.1, height + neckHeight));
	points.push(new THREE.Vector2(neckRadius * 1.1, height + neckHeight - 0.02));
	points.push(new THREE.Vector2(neckRadius - 0.02, height + neckHeight - 0.02));

	// Back down inside
	for (let i = segments; i >= 0; i--) {
		const t = i / segments;
		const y = height * t;
		const x = (baseRadius - (baseRadius - neckRadius) * Math.pow(t, 0.5)) - 0.02;
		points.push(new THREE.Vector2(Math.max(x, 0), y + 0.02));
	}

	points.push(new THREE.Vector2(0, 0.02));

	const geometry = new THREE.LatheGeometry(points, 64);
	return geometry;
}

/**
 * Creates a test tube geometry
 */
export function createTestTubeGeometry(
	radius: number = 0.1,
	length: number = 1.2
): THREE.BufferGeometry {
	const points: THREE.Vector2[] = [];

	// Rounded bottom
	const bottomSegments = 16;
	for (let i = 0; i <= bottomSegments; i++) {
		const angle = (Math.PI / 2) * (1 - i / bottomSegments);
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		points.push(new THREE.Vector2(x, y));
	}

	// Straight sides
	points.push(new THREE.Vector2(radius, length));

	// Rim
	points.push(new THREE.Vector2(radius * 1.1, length));
	points.push(new THREE.Vector2(radius * 1.1, length + 0.02));
	points.push(new THREE.Vector2(radius - 0.01, length + 0.02));
	points.push(new THREE.Vector2(radius - 0.01, length));

	// Inside
	points.push(new THREE.Vector2(radius - 0.01, radius));

	// Inside bottom
	for (let i = 0; i <= bottomSegments; i++) {
		const angle = (Math.PI / 2) * (i / bottomSegments);
		const x = Math.cos(angle) * (radius - 0.01);
		const y = Math.sin(angle) * (radius - 0.01);
		points.push(new THREE.Vector2(x, y));
	}

	const geometry = new THREE.LatheGeometry(points, 32);
	return geometry;
}

/**
 * Color constants for common chemicals
 */
export const CHEMICAL_COLORS = {
	water: 0x88ccff,
	acidic: 0xff4444,
	basic: 0x4444ff,
	neutral: 0x88ff88,
	indicator: {
		phenolphthalein: {
			acidic: 0xffffff,
			basic: 0xff00ff
		},
		methylOrange: {
			acidic: 0xff4400,
			basic: 0xffff00
		},
		bromothymolBlue: {
			acidic: 0xffff00,
			basic: 0x0000ff
		}
	},
	copper: 0x00aaff,
	iron: 0x884400,
	potassium: 0x9900ff,
	sodium: 0xffaa00
};
