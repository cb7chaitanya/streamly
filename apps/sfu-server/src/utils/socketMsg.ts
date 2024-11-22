import { SFUMessageServerSent } from "@repo/common/client";
import { WebSocket } from "ws";

export const sendMessage = (ws: WebSocket, message: SFUMessageServerSent) => {
    ws.send(JSON.stringify(message));
}