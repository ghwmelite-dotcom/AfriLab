<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';
	import {
		LabScene,
		createGlassMaterial,
		createLiquidMaterial,
		CHEMICAL_COLORS
	} from '$lib/utils/three';

	interface Props {
		liquidLevel?: number; // 0-1
		liquidColor?: number;
		isDispensing?: boolean;
		dropRate?: number;
		label?: string;
		interactive?: boolean;
		onDispense?: (amount: number) => void;
	}

	let {
		liquidLevel = 0.9,
		liquidColor = CHEMICAL_COLORS.basic,
		isDispensing = false,
		dropRate = 1,
		label = 'Burette',
		interactive = true,
		onDispense
	}: Props = $props();

	let container: HTMLDivElement;
	let labScene: LabScene | null = null;
	let buretteMesh: THREE.Mesh | null = null;
	let liquidMesh: THREE.Mesh | null = null;
	let stopcock: THREE.Mesh | null = null;
	let dropMesh: THREE.Mesh | null = null;
	let isDragging = $state(false);
	let rotationY = $state(0);

	const BURETTE_RADIUS = 0.06;
	const BURETTE_LENGTH = 2.5;
	const STOPCOCK_POSITION = 0.15;

	function createBuretteGeometry(): THREE.BufferGeometry {
		const points: THREE.Vector2[] = [];

		// Top opening
		points.push(new THREE.Vector2(0, BURETTE_LENGTH));
		points.push(new THREE.Vector2(BURETTE_RADIUS * 1.2, BURETTE_LENGTH));
		points.push(new THREE.Vector2(BURETTE_RADIUS * 1.2, BURETTE_LENGTH - 0.02));
		points.push(new THREE.Vector2(BURETTE_RADIUS, BURETTE_LENGTH - 0.02));

		// Main tube
		points.push(new THREE.Vector2(BURETTE_RADIUS, STOPCOCK_POSITION + 0.1));

		// Taper to tip
		points.push(new THREE.Vector2(BURETTE_RADIUS * 0.5, STOPCOCK_POSITION));
		points.push(new THREE.Vector2(BURETTE_RADIUS * 0.3, 0));
		points.push(new THREE.Vector2(BURETTE_RADIUS * 0.3 - 0.01, 0));
		points.push(new THREE.Vector2(BURETTE_RADIUS * 0.5 - 0.01, STOPCOCK_POSITION));

		// Back up inside
		points.push(new THREE.Vector2(BURETTE_RADIUS - 0.01, STOPCOCK_POSITION + 0.1));
		points.push(new THREE.Vector2(BURETTE_RADIUS - 0.01, BURETTE_LENGTH - 0.03));
		points.push(new THREE.Vector2(0, BURETTE_LENGTH - 0.03));

		return new THREE.LatheGeometry(points, 32);
	}

	function createLiquidGeometry(fillLevel: number): THREE.BufferGeometry | null {
		if (fillLevel <= 0.01) return null;

		const liquidHeight = (BURETTE_LENGTH - 0.2) * fillLevel;
		const geometry = new THREE.CylinderGeometry(
			BURETTE_RADIUS - 0.015,
			BURETTE_RADIUS - 0.015,
			liquidHeight,
			32
		);

		return geometry;
	}

	function updateLiquid() {
		if (!labScene || !liquidMesh) return;

		labScene.scene.remove(liquidMesh);
		liquidMesh.geometry.dispose();

		const geometry = createLiquidGeometry(liquidLevel);
		if (geometry) {
			const material = createLiquidMaterial(liquidColor, 0.9);
			liquidMesh = new THREE.Mesh(geometry, material);
			const liquidHeight = (BURETTE_LENGTH - 0.2) * liquidLevel;
			liquidMesh.position.y = STOPCOCK_POSITION + 0.1 + liquidHeight / 2;
			labScene.scene.add(liquidMesh);
		}
	}

	onMount(() => {
		if (!browser) return;

		// Create scene
		labScene = new LabScene();
		labScene.addLighting({
			ambient: { color: 0xffffff, intensity: 0.5 },
			directional: {
				color: 0xffffff,
				intensity: 0.7,
				position: new THREE.Vector3(3, 5, 4)
			}
		});

		// Create burette
		const buretteGeometry = createBuretteGeometry();
		const buretteMaterial = createGlassMaterial(0xccddff, 0.2);
		buretteMesh = new THREE.Mesh(buretteGeometry, buretteMaterial);
		labScene.scene.add(buretteMesh);

		// Create stopcock handle
		const stopcockGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 16);
		const stopcockMaterial = new THREE.MeshStandardMaterial({
			color: 0x333333,
			roughness: 0.3,
			metalness: 0.8
		});
		stopcock = new THREE.Mesh(stopcockGeometry, stopcockMaterial);
		stopcock.rotation.z = Math.PI / 2;
		stopcock.position.set(0.08, STOPCOCK_POSITION + 0.05, 0);
		labScene.scene.add(stopcock);

		// Create liquid
		const liquidGeometry = createLiquidGeometry(liquidLevel);
		if (liquidGeometry) {
			const liquidMaterial = createLiquidMaterial(liquidColor, 0.9);
			liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
			const liquidHeight = (BURETTE_LENGTH - 0.2) * liquidLevel;
			liquidMesh.position.y = STOPCOCK_POSITION + 0.1 + liquidHeight / 2;
			labScene.scene.add(liquidMesh);
		}

		// Create drop mesh (for dispensing animation)
		const dropGeometry = new THREE.SphereGeometry(0.02, 16, 16);
		const dropMaterial = createLiquidMaterial(liquidColor, 0.95);
		dropMesh = new THREE.Mesh(dropGeometry, dropMaterial);
		dropMesh.visible = false;
		labScene.scene.add(dropMesh);

		// Position camera
		labScene.camera.position.set(0.5, BURETTE_LENGTH * 0.5, 1.5);
		labScene.camera.lookAt(0, BURETTE_LENGTH * 0.4, 0);

		// Animation
		let dropY = 0;
		labScene.onAnimate((delta) => {
			if (buretteMesh && liquidMesh && stopcock) {
				buretteMesh.rotation.y = rotationY;
				liquidMesh.rotation.y = rotationY;
				stopcock.rotation.y = rotationY;
			}

			// Dispensing animation
			if (isDispensing && dropMesh) {
				dropMesh.visible = true;
				dropY -= delta * 2;

				if (dropY < -0.5) {
					dropY = 0;
					onDispense?.(0.5 * dropRate);
				}

				dropMesh.position.set(0, dropY, 0);
			} else if (dropMesh) {
				dropMesh.visible = false;
				dropY = 0;
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

<div class="relative w-full aspect-[1/2]">
	<!-- 3D Canvas Container -->
	<div
		bind:this={container}
		class="w-full h-full cursor-grab rounded-xl overflow-hidden {isDragging ? 'cursor-grabbing' : ''}"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		role="img"
		aria-label="3D Burette with {Math.round(liquidLevel * 50)} mL"
	></div>

	<!-- Scale markings (overlay) -->
	<div class="absolute top-4 left-1 w-4 h-[calc(100%-3rem)] flex flex-col justify-between text-[8px] font-mono text-gray-500">
		<span>0</span>
		<span>10</span>
		<span>20</span>
		<span>30</span>
		<span>40</span>
		<span>50</span>
	</div>

	<!-- Label -->
	{#if label}
		<div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg glass text-xs font-medium text-white">
			{label}
		</div>
	{/if}

	<!-- Volume reading -->
	<div class="absolute top-2 right-2 px-2 py-1 rounded-lg glass text-xs font-mono text-cyan-400">
		{(50 - liquidLevel * 50).toFixed(1)} mL
	</div>

	<!-- Dispensing indicator -->
	{#if isDispensing}
		<div class="absolute top-10 right-2 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 animate-pulse">
			Dispensing...
		</div>
	{/if}
</div>
