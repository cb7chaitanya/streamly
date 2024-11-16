import { WebSocket } from "ws";

export const sendMessage = (ws: WebSocket, message: any) => {
    ws.send(message)
}