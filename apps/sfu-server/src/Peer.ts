import { WebSocket } from "ws";

export class Peer {
    peerId: string;
    socket: WebSocket;
    constructor(peerId: string, socket: WebSocket) {
        this.peerId = peerId;
        this.socket = socket;
    }
}