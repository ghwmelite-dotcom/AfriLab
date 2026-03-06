import { browser } from '$app/environment';

export interface Notification {
	id: string;
	type: 'achievement' | 'lab' | 'system' | 'reminder';
	title: string;
	message: string;
	read: boolean;
	timestamp: Date;
	icon?: string;
	href?: string;
}

const STORAGE_KEY = 'afrilab_notifications';

function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

class NotificationStore {
	notifications = $state<Notification[]>([]);
	isOpen = $state(false);

	get unreadCount(): number {
		return this.notifications.filter((n) => !n.read).length;
	}

	constructor() {
		if (browser) {
			this.load();
			if (this.notifications.length === 0) {
				this.seedDefaults();
			}
		}
	}

	private load() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as Notification[];
				this.notifications = parsed.map((n) => ({ ...n, timestamp: new Date(n.timestamp) }));
			}
		} catch {
			// ignore
		}
	}

	private save() {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
		}
	}

	private seedDefaults() {
		const now = Date.now();
		this.notifications = [
			{
				id: generateId(),
				type: 'system',
				title: 'Welcome to AfriLab!',
				message: 'Start your first virtual lab experiment today.',
				read: false,
				timestamp: new Date(now - 60_000),
				href: '/dashboard'
			},
			{
				id: generateId(),
				type: 'lab',
				title: 'New Lab Available',
				message: 'Acid-Base Titration lab is now available for your course.',
				read: false,
				timestamp: new Date(now - 3_600_000),
				href: '/dashboard/labs'
			},
			{
				id: generateId(),
				type: 'reminder',
				title: 'Complete Your Profile',
				message: 'Add your institution details to connect with classmates.',
				read: false,
				timestamp: new Date(now - 7_200_000),
				href: '/dashboard/profile'
			}
		];
		this.save();
	}

	add(notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) {
		this.notifications = [
			{
				...notification,
				id: generateId(),
				read: false,
				timestamp: new Date()
			},
			...this.notifications
		];
		this.save();
	}

	markRead(id: string) {
		const n = this.notifications.find((n) => n.id === id);
		if (n) {
			n.read = true;
			this.notifications = [...this.notifications];
			this.save();
		}
	}

	markAllRead() {
		this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
		this.save();
	}

	remove(id: string) {
		this.notifications = this.notifications.filter((n) => n.id !== id);
		this.save();
	}

	clearAll() {
		this.notifications = [];
		this.save();
	}

	toggle() {
		this.isOpen = !this.isOpen;
	}

	close() {
		this.isOpen = false;
	}
}

export const notificationStore = new NotificationStore();
