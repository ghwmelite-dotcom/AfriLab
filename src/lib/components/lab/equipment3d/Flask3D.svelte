<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import {
		LabScene,
		createGlassMaterial,
		createLiquidMaterial,
		createFlaskGeometry,
		CHEMICAL_COLORS
	} from '$lib/utils/three';

	interface Props {
		liquidLevel?: number; // 0-1
		liquidColor?: number;
		label?: string;
		interactive?: boolean;
		swirling?: boolean;
		size?: 'small' | 'medium' | 'large';
	}

	let {
		liquidLevel = 0.3,
		liquidColor = CHEMICAL_COLORS.water,
		label = 'Erlenmeyer Flask',
		interactive = true,
		swirling = false,
		size = 'medium'
	}: Props = $props();

	let container: HTMLDivElement;
	let labScene: LabScene | null = null;
	let flaskMesh: THREE.Mesh | null = null;
	let liquidMesh: THREE.Mesh | null = null;
	let isDragging = $state(false);
	let rotationY = $state(0);
	let swirlingTime = 0;

	const sizeConfig = {
		small: { baseRadius: 0.4, neckRadius: 0.1, height: 0.8, neckHeight: 0.3 },
		medium: { baseRadius: 0.6, neckRadius: 0.15, height: 1.2, neckHeight: 0.4 },
		large: { baseRadius: 0.8, neckRadius: 0.2, height: 1.6, neckHeight: 0.5 }
	};

	function createLiquidGeometry(fillLevel: number) {
		const config = sizeConfig[size];
		const maxLiquidHeight = config.height * 0.9;
		const liquidHeight = maxLiquidHeight * fillLevel;

		if (liquidHeight <= 0.01) return null;

		// Create a simplified liquid geometry (cone-ish shape)
		const points: THREE.Vector2[] = [];
		const segments = 16;

		for (let i = 0; i <= segments; i++) {
			const t = i / segments;
			const y = liquidHeight * t;
			// Approximate the flask shape for the liquid
			const normalizedY = y / config.height;
			const x = config.baseRadius * (1 - Math.pow(normalizedY, 0.5) * 0.7) - 0.03;
			points.push(new THREE.Vector2(Math.max(x, 0.05), y + 0.02));
		}

		return new THREE.LatheGeometry(points, 32);
	}

	function updateLiquidMaterial() {
		if (!liquidMesh) return;
		(liquidMesh.material as THREE.MeshPhysicalMaterial).color.setHex(liquidColor);
	}

	onMount(() => {
		if (!browser) return;

		const config = sizeConfig[size];

		// Create scene
		labScene = new LabScene();
		labScene.addLighting();

		// Create flask
		const flaskGeometry = createFlaskGeometry(
			config.baseRadius,
			config.neckRadius,
			config.height,
			config.neckHeight
		);
		const flaskMaterial = createGlassMaterial(0x99ddff, 0.25);
		flaskMesh = new THREE.Mesh(flaskGeometry, flaskMaterial);
		labScene.scene.add(flaskMesh);

		// Create liquid
		const liquidGeometry = createLiquidGeometry(liquidLevel);
		if (liquidGeometry) {
			const liquidMaterial = createLiquidMaterial(liquidColor, 0.85);
			liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
			labScene.scene.add(liquidMesh);
		}

		// Position camera
		const totalHeight = config.height + config.neckHeight;
		labScene.camera.position.set(0, totalHeight * 0.4, totalHeight * 1.5);
		labScene.camera.lookAt(0, totalHeight * 0.3, 0);

		// Add animation
		labScene.onAnimate((delta) => {
			if (flaskMesh && liquidMesh) {
				flaskMesh.rotation.y = rotationY;
				liquidMesh.rotation.y = rotationY;

				// Swirling animation
				if (swirling) {
					swirlingTime += delta * 3;
					const swirl = Math.sin(swirlingTime) * 0.1;
					flaskMesh.rotation.x = swirl;
					flaskMesh.rotation.z = Math.cos(swirlingTime) * 0.1;
					liquidMesh.rotation.x = swirl;
					liquidMesh.rotation.z = Math.cos(swirlingTime) * 0.1;
				} else {
					// Smoothly return to upright
					flaskMesh.rotation.x *= 0.95;
					flaskMesh.rotation.z *= 0.95;
					liquidMesh.rotation.x *= 0.95;
					liquidMesh.rotation.z *= 0.95;
				}
			}
		});

		// Mount scene
		labScene.mount(container);
	});

	onDestroy(() => {
		if (labScene) {
			labScene.dispose();
		}
	});

	// Update liquid color when props change
	$effect(() => {
		liquidColor;
		if (liquidMesh) {
			updateLiquidMaterial();
		}
	});

	// Mouse interaction
	let startX = 0;
	let startRotation = 0;

	function handlePointerDown(e: PointerEvent) {
		if (!interactive) return;
		isDragging = true;
		startX = e.clientX;
		startRotation = rotationY;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || !interactive) return;
		const deltaX = e.clientX - startX;
		rotationY = startRotation + deltaX * 0.01;
	}

	function handlePointerUp(e: PointerEvent) {
		isDragging = false;
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
	}
</script>

<div class="relative w-full aspect-square">
	<!-- 3D Canvas Container -->
	<div
		bind:this={container}
		class="w-full h-full cursor-grab rounded-xl overflow-hidden {isDragging ? 'cursor-grabbing' : ''}"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		role="img"
		aria-label="3D Erlenmeyer Flask"
	></div>

	<!-- Label -->
	{#if label}
		<div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg glass text-xs font-medium text-white">
			{label}
		</div>
	{/if}

	<!-- Swirling indicator -->
	{#if swirling}
		<div class="absolute top-2 left-2 px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-400 flex items-center gap-1">
			<svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			Swirling
		</div>
	{/if}

	<!-- Volume indicator -->
	<div class="absolute top-2 right-2 px-2 py-1 rounded-lg glass text-xs font-mono text-emerald-400">
		{Math.round(liquidLevel * 250)} mL
	</div>
</div>
