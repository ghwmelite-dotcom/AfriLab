/**
 * 3D Lab Equipment Components
 * Export all Three.js-based lab equipment components
 */

export { default as Beaker3D } from './Beaker3D.svelte';
export { default as Flask3D } from './Flask3D.svelte';
export { default as Burette3D } from './Burette3D.svelte';

// Re-export utilities and types
export {
	LabScene,
	createGlassMaterial,
	createLiquidMaterial,
	createBeakerGeometry,
	createFlaskGeometry,
	createTestTubeGeometry,
	CHEMICAL_COLORS
} from '$lib/utils/three';
