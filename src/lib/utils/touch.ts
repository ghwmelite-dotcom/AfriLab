/**
 * Touch Gesture Utilities
 * Enhanced touch interactions for mobile lab experience
 */

import { browser } from '$app/environment';

export interface SwipeGesture {
	direction: 'left' | 'right' | 'up' | 'down';
	distance: number;
	velocity: number;
}

export interface PinchGesture {
	scale: number;
	centerX: number;
	centerY: number;
}

export interface DragGesture {
	deltaX: number;
	deltaY: number;
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
}

type SwipeCallback = (gesture: SwipeGesture) => void;
type PinchCallback = (gesture: PinchGesture) => void;
type DragCallback = (gesture: DragGesture) => void;

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export function createSwipeHandler(
	element: HTMLElement,
	onSwipe: SwipeCallback,
	options: { preventDefault?: boolean } = {}
): () => void {
	let startX = 0;
	let startY = 0;
	let startTime = 0;

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.changedTouches.length === 0) return;

		const touch = e.changedTouches[0];
		const deltaX = touch.clientX - startX;
		const deltaY = touch.clientY - startY;
		const deltaTime = Date.now() - startTime;

		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const velocity = distance / deltaTime;

		if (distance < SWIPE_THRESHOLD || velocity < SWIPE_VELOCITY_THRESHOLD) return;

		const absX = Math.abs(deltaX);
		const absY = Math.abs(deltaY);

		let direction: SwipeGesture['direction'];
		if (absX > absY) {
			direction = deltaX > 0 ? 'right' : 'left';
		} else {
			direction = deltaY > 0 ? 'down' : 'up';
		}

		if (options.preventDefault) {
			e.preventDefault();
		}

		onSwipe({ direction, distance, velocity });
	}

	element.addEventListener('touchstart', handleTouchStart, { passive: true });
	element.addEventListener('touchend', handleTouchEnd, { passive: !options.preventDefault });

	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchend', handleTouchEnd);
	};
}

export function createPinchHandler(
	element: HTMLElement,
	onPinch: PinchCallback
): () => void {
	let initialDistance = 0;
	let initialCenterX = 0;
	let initialCenterY = 0;

	function getDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function getCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
		return {
			x: (touch1.clientX + touch2.clientX) / 2,
			y: (touch1.clientY + touch2.clientY) / 2
		};
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			initialDistance = getDistance(e.touches[0], e.touches[1]);
			const center = getCenter(e.touches[0], e.touches[1]);
			initialCenterX = center.x;
			initialCenterY = center.y;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 2 && initialDistance > 0) {
			const currentDistance = getDistance(e.touches[0], e.touches[1]);
			const scale = currentDistance / initialDistance;
			const center = getCenter(e.touches[0], e.touches[1]);

			e.preventDefault();
			onPinch({
				scale,
				centerX: center.x,
				centerY: center.y
			});
		}
	}

	function handleTouchEnd() {
		initialDistance = 0;
	}

	element.addEventListener('touchstart', handleTouchStart, { passive: true });
	element.addEventListener('touchmove', handleTouchMove, { passive: false });
	element.addEventListener('touchend', handleTouchEnd, { passive: true });

	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchend', handleTouchEnd);
	};
}

export function createDragHandler(
	element: HTMLElement,
	callbacks: {
		onDragStart?: (gesture: DragGesture) => void;
		onDrag?: (gesture: DragGesture) => void;
		onDragEnd?: (gesture: DragGesture) => void;
	}
): () => void {
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let currentGesture: DragGesture | null = null;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		isDragging = true;

		currentGesture = {
			deltaX: 0,
			deltaY: 0,
			startX,
			startY,
			currentX: startX,
			currentY: startY
		};

		callbacks.onDragStart?.(currentGesture);
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging || e.touches.length !== 1) return;

		const touch = e.touches[0];
		currentGesture = {
			deltaX: touch.clientX - startX,
			deltaY: touch.clientY - startY,
			startX,
			startY,
			currentX: touch.clientX,
			currentY: touch.clientY
		};

		callbacks.onDrag?.(currentGesture);
	}

	function handleTouchEnd() {
		if (!isDragging || !currentGesture) return;

		isDragging = false;
		callbacks.onDragEnd?.(currentGesture);
		currentGesture = null;
	}

	element.addEventListener('touchstart', handleTouchStart, { passive: true });
	element.addEventListener('touchmove', handleTouchMove, { passive: true });
	element.addEventListener('touchend', handleTouchEnd, { passive: true });
	element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchend', handleTouchEnd);
		element.removeEventListener('touchcancel', handleTouchEnd);
	};
}

// Long press detection
export function createLongPressHandler(
	element: HTMLElement,
	onLongPress: () => void,
	duration: number = 500
): () => void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let isPressed = false;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		isPressed = true;
		timer = setTimeout(() => {
			if (isPressed) {
				onLongPress();
			}
		}, duration);
	}

	function handleTouchEnd() {
		isPressed = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function handleTouchMove() {
		// Cancel long press if finger moves
		handleTouchEnd();
	}

	element.addEventListener('touchstart', handleTouchStart, { passive: true });
	element.addEventListener('touchend', handleTouchEnd, { passive: true });
	element.addEventListener('touchmove', handleTouchMove, { passive: true });
	element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

	return () => {
		handleTouchEnd();
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchend', handleTouchEnd);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchcancel', handleTouchEnd);
	};
}

// Detect if device has touch capability
export function isTouchDevice(): boolean {
	if (!browser) return false;
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Prevent double-tap zoom on specific elements
export function preventDoubleTapZoom(element: HTMLElement): () => void {
	let lastTap = 0;

	function handleTouchEnd(e: TouchEvent) {
		const now = Date.now();
		if (now - lastTap < 300) {
			e.preventDefault();
		}
		lastTap = now;
	}

	element.addEventListener('touchend', handleTouchEnd, { passive: false });

	return () => {
		element.removeEventListener('touchend', handleTouchEnd);
	};
}

// Haptic feedback (if supported)
export function vibrate(pattern: number | number[] = 10): void {
	if (!browser || !navigator.vibrate) return;
	navigator.vibrate(pattern);
}
