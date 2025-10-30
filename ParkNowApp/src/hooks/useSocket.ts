// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.5:8000"; // change IP

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
};
