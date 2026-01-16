/**
 * Tests for Touch Gesture Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createSwipeHandler,
	createPinchHandler,
	createDragHandler,
	createLongPressHandler,
	isTouchDevice,
	vibrate
} from '$lib/utils/touch';

describe('Touch Utilities', () => {
	let element: HTMLDivElement;

	beforeEach(() => {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(() => {
		document.body.removeChild(element);
	});

	describe('createSwipeHandler', () => {
		it('should return a cleanup function', () => {
			const onSwipe = vi.fn();
			const cleanup = createSwipeHandler(element, onSwipe);

			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should add event listeners to element', () => {
			const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
			const onSwipe = vi.fn();

			createSwipeHandler(element, onSwipe);

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'touchstart',
				expect.any(Function),
				expect.any(Object)
			);
			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'touchend',
				expect.any(Function),
				expect.any(Object)
			);
		});

		it('should remove event listeners on cleanup', () => {
			const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
			const onSwipe = vi.fn();

			const cleanup = createSwipeHandler(element, onSwipe);
			cleanup();

			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				'touchstart',
				expect.any(Function)
			);
			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				'touchend',
				expect.any(Function)
			);
		});
	});

	describe('createPinchHandler', () => {
		it('should return a cleanup function', () => {
			const onPinch = vi.fn();
			const cleanup = createPinchHandler(element, onPinch);

			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should add touch event listeners', () => {
			const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
			const onPinch = vi.fn();

			createPinchHandler(element, onPinch);

			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'touchstart',
				expect.any(Function),
				expect.any(Object)
			);
			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'touchmove',
				expect.any(Function),
				expect.any(Object)
			);
			expect(addEventListenerSpy).toHaveBeenCalledWith(
				'touchend',
				expect.any(Function),
				expect.any(Object)
			);
		});
	});

	describe('createDragHandler', () => {
		it('should return a cleanup function', () => {
			const cleanup = createDragHandler(element, {
				onDrag: vi.fn()
			});

			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should accept optional callbacks', () => {
			const onDragStart = vi.fn();
			const onDrag = vi.fn();
			const onDragEnd = vi.fn();

			const cleanup = createDragHandler(element, {
				onDragStart,
				onDrag,
				onDragEnd
			});

			expect(typeof cleanup).toBe('function');
			cleanup();
		});
	});

	describe('createLongPressHandler', () => {
		it('should return a cleanup function', () => {
			const onLongPress = vi.fn();
			const cleanup = createLongPressHandler(element, onLongPress);

			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should accept custom duration', () => {
			const onLongPress = vi.fn();
			const customDuration = 1000;

			const cleanup = createLongPressHandler(element, onLongPress, customDuration);

			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should clean up timer on cleanup', () => {
			vi.useFakeTimers();
			const onLongPress = vi.fn();

			const cleanup = createLongPressHandler(element, onLongPress, 500);

			// Simulate touch start
			const touchStartEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 0, clientY: 0, identifier: 0, target: element } as Touch]
			});
			element.dispatchEvent(touchStartEvent);

			// Cleanup before timer fires
			cleanup();

			// Advance timer
			vi.advanceTimersByTime(600);

			// Callback should not be called
			expect(onLongPress).not.toHaveBeenCalled();

			vi.useRealTimers();
		});
	});

	describe('isTouchDevice', () => {
		it('should return a boolean', () => {
			const result = isTouchDevice();
			expect(typeof result).toBe('boolean');
		});
	});

	describe('vibrate', () => {
		it('should call navigator.vibrate with pattern', () => {
			const vibrateSpy = vi.spyOn(navigator, 'vibrate');

			vibrate(10);

			expect(vibrateSpy).toHaveBeenCalledWith(10);
		});

		it('should accept array pattern', () => {
			const vibrateSpy = vi.spyOn(navigator, 'vibrate');

			vibrate([100, 50, 100]);

			expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100]);
		});

		it('should use default pattern when called without arguments', () => {
			const vibrateSpy = vi.spyOn(navigator, 'vibrate');

			vibrate();

			expect(vibrateSpy).toHaveBeenCalledWith(10);
		});
	});
});
