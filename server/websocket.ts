import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*", // In production, specify exact origins
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[websocket] Client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[websocket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO(): SocketIOServer {
    if (!io) {
        throw new Error("Socket.io not initialized. Call initializeWebSocket first.");
    }
    return io;
}

// Emit status change event to all connected clients
export function emitStatusChange(userId: number, status: string, timestamp: Date) {
    if (io) {
        io.emit("status-changed", { userId, status, timestamp });
    }
}

// Emit check-in event
export function emitCheckIn(userId: number, timestamp: Date) {
    if (io) {
        io.emit("user-checked-in", { userId, timestamp });
    }
}

// Emit check-out event
export function emitCheckOut(userId: number, timestamp: Date) {
    if (io) {
        io.emit("user-checked-out", { userId, timestamp });
    }
}
