/**
 * Real-time Collaboration Store
 * Manages shared lab sessions, presence, and real-time state sync
 */

import { browser } from '$app/environment';

export interface Participant {
	id: string;
	name: string;
	avatar?: string;
	color: string;
	cursor?: { x: number; y: number };
	isActive: boolean;
	lastSeen: string;
	role: 'owner' | 'collaborator' | 'viewer';
}

export interface ChatMessage {
	id: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	type: 'message' | 'system' | 'action';
}

export interface LabAction {
	id: string;
	userId: string;
	userName: string;
	action: string;
	data: Record<string, unknown>;
	timestamp: string;
}

export interface CollaborationSession {
	sessionId: string;
	labId: string;
	labName: string;
	ownerId: string;
	participants: Participant[];
	messages: ChatMessage[];
	sharedState: Record<string, unknown>;
	createdAt: string;
	isActive: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
type MessageHandler = (data: any) => void;

const PARTICIPANT_COLORS = [
	'#10b981', // emerald
	'#06b6d4', // cyan
	'#8b5cf6', // violet
	'#f59e0b', // amber
	'#ec4899', // pink
	'#3b82f6', // blue
	'#ef4444', // red
	'#84cc16', // lime
];

class CollaborationStore {
	// State
	private _session = $state<CollaborationSession | null>(null);
	private _status = $state<ConnectionStatus>('disconnected');
	private _isOpen = $state(false);
	private _unreadMessages = $state(0);
	private _localCursor = $state<{ x: number; y: number } | null>(null);

	// WebSocket connection
	private ws: WebSocket | null = null;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private messageHandlers: Map<string, MessageHandler[]> = new Map();
	private userId: string = '';
	private userName: string = '';

	// Getters
	get session() { return this._session; }
	get status() { return this._status; }
	get isOpen() { return this._isOpen; }
	get unreadMessages() { return this._unreadMessages; }
	get isConnected() { return this._status === 'connected'; }
	get participants() { return this._session?.participants || []; }
	get messages() { return this._session?.messages || []; }
	get sharedState() { return this._session?.sharedState || {}; }

	// Initialize with user info
	init(userId: string, userName: string) {
		this.userId = userId;
		this.userName = userName;
	}

	// Create a new collaboration session
	async createSession(labId: string, labName: string): Promise<string> {
		const sessionId = this.generateSessionId();

		this._session = {
			sessionId,
			labId,
			labName,
			ownerId: this.userId,
			participants: [{
				id: this.userId,
				name: this.userName,
				color: this.getParticipantColor(0),
				isActive: true,
				lastSeen: new Date().toISOString(),
				role: 'owner'
			}],
			messages: [{
				id: this.generateId(),
				senderId: 'system',
				senderName: 'System',
				content: `${this.userName} created the collaboration session`,
				timestamp: new Date().toISOString(),
				type: 'system'
			}],
			sharedState: {},
			createdAt: new Date().toISOString(),
			isActive: true
		};

		// Connect to WebSocket server
		await this.connect(sessionId);

		return sessionId;
	}

	// Join an existing session
	async joinSession(sessionId: string): Promise<boolean> {
		try {
			this._status = 'connecting';

			// Connect to WebSocket server
			await this.connect(sessionId);

			// Request session data
			this.send('join_session', { sessionId, userId: this.userId, userName: this.userName });

			return true;
		} catch (error) {
			console.error('[Collab] Failed to join session:', error);
			this._status = 'disconnected';
			return false;
		}
	}

	// Leave the current session
	leaveSession() {
		if (this._session) {
			this.send('leave_session', { sessionId: this._session.sessionId, userId: this.userId });
			this.addSystemMessage(`${this.userName} left the session`);
		}

		this.disconnect();
		this._session = null;
		this._isOpen = false;
	}

	// Connect to WebSocket server
	private async connect(sessionId: string): Promise<void> {
		if (!browser) return;

		return new Promise((resolve, reject) => {
			try {
				// In production, this would connect to a real WebSocket server
				// For now, we'll simulate the connection
				const wsUrl = this.getWebSocketUrl(sessionId);

				// Simulate connection for demo purposes
				this._status = 'connecting';

				setTimeout(() => {
					this._status = 'connected';
					this.reconnectAttempts = 0;
					resolve();
				}, 500);

				// Real WebSocket implementation would be:
				// this.ws = new WebSocket(wsUrl);
				// this.ws.onopen = () => { ... };
				// this.ws.onmessage = (event) => { ... };
				// this.ws.onclose = () => { ... };
				// this.ws.onerror = (error) => { ... };

			} catch (error) {
				reject(error);
			}
		});
	}

	// Disconnect from WebSocket server
	private disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		this._status = 'disconnected';
	}

	// Send message through WebSocket
	private send(type: string, data: any) {
		if (!this.isConnected) {
			console.warn('[Collab] Cannot send message - not connected');
			return;
		}

		const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(message);
		}

		// For demo, handle locally
		this.handleLocalMessage(type, data);
	}

	// Handle messages locally for demo purposes
	private handleLocalMessage(type: string, data: any) {
		switch (type) {
			case 'chat_message':
				this.addMessage(data.content, 'message');
				break;
			case 'cursor_move':
				// Would broadcast to other participants
				break;
			case 'state_update':
				this.updateSharedState(data.key, data.value);
				break;
			case 'action':
				this.addAction(data.action, data.details);
				break;
		}
	}

	// Get WebSocket URL
	private getWebSocketUrl(sessionId: string): string {
		const protocol = browser && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = browser ? window.location.host : 'localhost:5174';
		return `${protocol}//${host}/api/collab/${sessionId}`;
	}

	// Send chat message
	sendMessage(content: string) {
		if (!content.trim() || !this._session) return;

		const message: ChatMessage = {
			id: this.generateId(),
			senderId: this.userId,
			senderName: this.userName,
			content: content.trim(),
			timestamp: new Date().toISOString(),
			type: 'message'
		};

		this._session = {
			...this._session,
			messages: [...this._session.messages, message]
		};

		this.send('chat_message', message);
	}

	// Add system message
	private addSystemMessage(content: string) {
		if (!this._session) return;

		const message: ChatMessage = {
			id: this.generateId(),
			senderId: 'system',
			senderName: 'System',
			content,
			timestamp: new Date().toISOString(),
			type: 'system'
		};

		this._session = {
			...this._session,
			messages: [...this._session.messages, message]
		};
	}

	// Add message
	private addMessage(content: string, type: ChatMessage['type']) {
		if (!this._session) return;

		const message: ChatMessage = {
			id: this.generateId(),
			senderId: this.userId,
			senderName: this.userName,
			content,
			timestamp: new Date().toISOString(),
			type
		};

		this._session = {
			...this._session,
			messages: [...this._session.messages, message]
		};

		if (!this._isOpen) {
			this._unreadMessages++;
		}
	}

	// Add action to history
	private addAction(action: string, details: Record<string, unknown>) {
		if (!this._session) return;

		const actionMsg: ChatMessage = {
			id: this.generateId(),
			senderId: this.userId,
			senderName: this.userName,
			content: `${this.userName} ${action}`,
			timestamp: new Date().toISOString(),
			type: 'action'
		};

		this._session = {
			...this._session,
			messages: [...this._session.messages, actionMsg]
		};
	}

	// Update shared state
	updateSharedState(key: string, value: unknown) {
		if (!this._session) return;

		this._session = {
			...this._session,
			sharedState: {
				...this._session.sharedState,
				[key]: value
			}
		};

		this.send('state_update', { key, value });
	}

	// Broadcast lab action
	broadcastAction(action: string, data: Record<string, unknown> = {}) {
		this.send('action', { action, details: data });
		this.addAction(action, data);
	}

	// Update cursor position
	updateCursor(x: number, y: number) {
		this._localCursor = { x, y };
		this.send('cursor_move', { userId: this.userId, x, y });
	}

	// Toggle panel open/close
	toggle() {
		this._isOpen = !this._isOpen;
		if (this._isOpen) {
			this._unreadMessages = 0;
		}
	}

	open() {
		this._isOpen = true;
		this._unreadMessages = 0;
	}

	close() {
		this._isOpen = false;
	}

	// Invite participant
	async inviteParticipant(email: string): Promise<boolean> {
		if (!this._session) return false;

		// In production, this would send an invitation
		console.log(`[Collab] Inviting ${email} to session ${this._session.sessionId}`);
		this.addSystemMessage(`Invitation sent to ${email}`);

		return true;
	}

	// Get share link
	getShareLink(): string {
		if (!this._session || !browser) return '';
		return `${window.location.origin}/labs/join/${this._session.sessionId}`;
	}

	// Copy share link to clipboard
	async copyShareLink(): Promise<boolean> {
		const link = this.getShareLink();
		if (!link || !browser) return false;

		try {
			await navigator.clipboard.writeText(link);
			return true;
		} catch {
			return false;
		}
	}

	// Helper functions
	private generateSessionId(): string {
		return `collab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
	}

	private generateId(): string {
		return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
	}

	private getParticipantColor(index: number): string {
		return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
	}

	// Simulate adding a participant (for demo)
	simulateParticipantJoin(name: string) {
		if (!this._session) return;

		const participant: Participant = {
			id: this.generateId(),
			name,
			color: this.getParticipantColor(this._session.participants.length),
			isActive: true,
			lastSeen: new Date().toISOString(),
			role: 'collaborator'
		};

		this._session = {
			...this._session,
			participants: [...this._session.participants, participant]
		};

		this.addSystemMessage(`${name} joined the session`);
	}
}

export const collaborationStore = new CollaborationStore();
