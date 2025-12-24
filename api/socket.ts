import { Socket, io } from 'socket.io-client';

class SocketService {
  public socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket && this.isConnected) return;

    this.socket = io(process.env.EXPO_PUBLIC_API_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.log('Connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // User status
  userOnline(userId: string) {
    if (this.socket) {
      this.socket.emit('user_online', userId);
    }
  }

  // Chat room
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // Messages
  sendMessage(data: {
    content: string;
    senderId: string;
    receiverId: string;
    itemRequestId: string;
  }) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  // Event listeners
  onReceiveMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onMessageSent(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onMessageError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('message_error', callback);
    }
  }

  onUserOnline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
