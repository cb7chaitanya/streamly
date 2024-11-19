import { WebSocket } from "ws";

export const sendMessage = (ws: WebSocket, message: any) => {
    try {
        const messageString = JSON.stringify(message);
        ws.send(messageString);
    } catch(error) {
        console.error(error);
    }
}