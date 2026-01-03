import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initializeSocket() {
    if (!socket) {
        // Connect to the same host/port as the current page
        socket = io({
            transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
        });

        socket.on("connect", () => {
            console.log("[socket] Connected to WebSocket server");
        });

        socket.on("disconnect", () => {
            console.log("[socket] Disconnected from WebSocket server");
        });

        socket.on("connect_error", (error) => {
            console.error("[socket] Connection error:", error);
        });
    }

    return socket;
}

export function getSocket(): Socket {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
