import { Consumer, Transport, Producer } from "mediasoup/node/lib/types.js";
export interface ITransport {
    peerId: string;
    transport: Transport;
}

export interface IConsumer {
    peerId: string;
    consumer: Consumer;
}

export interface IProducer {
    peerId: string;
    producer: Producer;
}