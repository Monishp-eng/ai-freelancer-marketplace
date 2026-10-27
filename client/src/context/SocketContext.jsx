import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (token && user) {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? undefined : 'http://localhost:5000');
      const newSocket = io(socketUrl, {
        query: { token }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('user_online', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_offline', (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
