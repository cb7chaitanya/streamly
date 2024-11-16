import WebSocket from "ws";

export class Peer {
    public socket: WebSocket;
    public peerId: string;

    constructor(socket: WebSocket, peerId: string) {
        this.socket = socket;
        this.peerId = peerId;
    }
}