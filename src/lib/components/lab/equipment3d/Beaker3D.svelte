<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import {
		LabScene,
		createGlassMaterial,
		createLiquidMaterial,
		createBeakerGeometry,
		CHEMICAL_COLORS
	} from '$lib/utils/three';

	interface Props {
		liquidLevel?: number; // 0-1
		liquidColor?: number;
		label?: string;
		interactive?: boolean;
		size?: 'small' | 'medium' | 'large';
		onPour?: (amount: number) => void;
	}

	let {
		liquidLevel = 0.5,
		liquidColor = CHEMICAL_COLORS.water,
		label = '',
		interactive = true,
		size = 'medium',
		onPour
	}: Props = $props();

	let container: HTMLDivElement;
	let labScene: LabScene | null = null;
	let beakerMesh: THREE.Mesh | null = null;
	let liquidMesh: THREE.Mesh | null = null;
	let isDragging = $state(false);
	let rotationY = $state(0);

	const sizeConfig = {
		small: { radius: 0.3, height: 0.9 },
		medium: { radius: 0.5, height: 1.5 },
		large: { radius: 0.7, height: 2.0 }
	};

	function createLiquidGeometry(fillLevel: number) {
		const config = sizeConfig[size];
		const liquidHeight = config.height * 0.85 * fillLevel;

		if (liquidHeight <= 0.01) return null;

		const geometry = new THREE.CylinderGeometry(
			config.radius - 0.03,
			config.radius - 0.03,
			liquidHeight,
			32
		);

		return geometry;
	}

	function updateLiquid() {
		if (!labScene || !liquidMesh) return;

		// Remove old liquid
		labScene.scene.remove(liquidMesh);
		liquidMesh.geometry.dispose();

		// Create new liquid
		const geometry = createLiquidGeometry(liquidLevel);
		if (geometry) {
			const material = createLiquidMaterial(liquidColor);
			liquidMesh = new THREE.Mesh(geometry, material);
			liquidMesh.position.y = (sizeConfig[size].height * 0.85 * liquidLevel) / 2 + 0.02;
			labScene.scene.add(liquidMesh);
		}
	}

	onMount(() => {
		if (!browser) return;

		const config = sizeConfig[size];

		// Create scene
		labScene = new LabScene();
		labScene.addLighting();

		// Create beaker
		const beakerGeometry = createBeakerGeometry(config.radius, config.height);
		const beakerMaterial = createGlassMaterial();
		beakerMesh = new THREE.Mesh(beakerGeometry, beakerMaterial);
		labScene.scene.add(beakerMesh);

		// Create liquid
		const liquidGeometry = createLiquidGeometry(liquidLevel);
		if (liquidGeometry) {
			const liquidMaterial = createLiquidMaterial(liquidColor);
			liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
			liquidMesh.position.y = (config.height * 0.85 * liquidLevel) / 2 + 0.02;
			labScene.scene.add(liquidMesh);
		}

		// Position camera
		labScene.camera.position.set(0, config.height * 0.5, config.height * 2);
		labScene.camera.lookAt(0, config.height * 0.4, 0);

		// Add rotation animation on drag
		labScene.onAnimate((delta) => {
			if (beakerMesh && liquidMesh) {
				beakerMesh.rotation.y = rotationY;
				liquidMesh.rotation.y = rotationY;
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

	// Update liquid when props change
	$effect(() => {
		liquidLevel;
		liquidColor;
		if (labScene && liquidMesh) {
			updateLiquid();
		}
	});

	// Mouse/touch interaction
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

	function handleWheel(e: WheelEvent) {
		if (!interactive || !onPour) return;
		e.preventDefault();
		const pourAmount = e.deltaY > 0 ? -0.05 : 0.05;
		onPour(pourAmount);
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
		onwheel={handleWheel}
		role="img"
		aria-label="3D Beaker with {Math.round(liquidLevel * 100)}% liquid"
	></div>

	<!-- Label -->
	{#if label}
		<div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg glass text-xs font-medium text-white">
			{label}
		</div>
	{/if}

	<!-- Liquid level indicator -->
	<div class="absolute top-2 right-2 px-2 py-1 rounded-lg glass text-xs font-mono text-emerald-400">
		{Math.round(liquidLevel * 100)}%
	</div>

	<!-- Instructions -->
	{#if interactive}
		<div class="absolute bottom-2 right-2 text-[10px] text-gray-500">
			Drag to rotate
		</div>
	{/if}
</div>
