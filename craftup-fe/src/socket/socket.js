import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io({
      autoConnect: false,
    });
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};