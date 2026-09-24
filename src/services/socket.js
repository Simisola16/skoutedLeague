import { io } from 'socket.io-client';

// Robust reconnection configuration for mobile network handoffs
const socket = io('/', {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000
});

export default socket;
