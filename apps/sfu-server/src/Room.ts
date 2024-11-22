import { Peer } from "./Peer.js";
import { ITransport, IConsumer, IProducer, SFUMessageType } from '@repo/common/client'
import { Router, AppData, Consumer, Producer, Transport } from "mediasoup/node/lib/types.js";
import { sendMessage } from "./utils/socketMsg.js";

export class Room {
    public roomId: string;
    public router: Router<AppData>;
    public peers: Peer[] = [];
    private producerTransports: ITransport[] = [];
    private consumerTransports: ITransport[] = [];
    private producers: IProducer[] = [];
    private consumers: IConsumer[] = [];


    constructor(roomId: string, peer1: Peer, router: Router<AppData>) {
        this.roomId = roomId;
        this.router = router;
        this.peers.push(peer1);
    }

    close<T extends { peerId: string }>(
        items: T[],
        peerId: string,
        type: keyof T
    ){
        items.forEach((item) => {
            if(item.peerId === peerId){
                (item[type] as Consumer | Transport | Producer).close()
            }
        })
        items = items.filter((item) => item.peerId !== peerId);
        return items
    }

    clear(peerId: string) {
        this.consumerTransports = this.close(this.consumerTransports, peerId, 'transport');
        this.producerTransports = this.close(this.producerTransports, peerId, 'transport');
        this.producers = this.close(this.producers, peerId, 'producer');
        this.consumers = this.close(this.consumers, peerId, 'consumer');
    }

    addNewPeer(peer: Peer){
        this.peers.push(new Peer(peer.peerId, peer.socket));
    }

    addProducer(producer: Producer, peerId: string){
        this.producers.push({ producer: producer, peerId: peerId });
    }

    addProducerTransport(transport: Transport, peerId: string) {
        this.producerTransports.push({
            peerId: peerId,
            transport: transport
        })
    }

    addConsumerTransport(transport: Transport, peerId: string) {
        this.consumerTransports.push({
            peerId: peerId,
            transport: transport
        })
    }

    getProducerTransport(peerId: string) {
        return this.producerTransports.find((item) => item.peerId === peerId)?.transport;
    }

    getConsumerTransport(peerId: string) {
        return this.consumerTransports.find((item) => item.peerId === peerId)?.transport;
    }

    getProducers(){
        return this.producers
    }

    getConsumers(){
        return this.consumers
    }

    removeConsumerTransport(transportId: string){
        this.consumerTransports = this.consumerTransports.filter((item) => item.transport.id !== transportId);
    }

    removeProducerTransport(transportId: string){
        this.producerTransports = this.producerTransports.filter((item) => item.transport.id !== transportId);
    }

    removeConsumer(consumerId: string){
        this.consumers = this.consumers.filter((item) => item.consumer.id !== consumerId);
    }
    
    informConsumers(peerId: string) {
        this.producers.forEach(({ producer: { id } }) => {
            this.peers.forEach((peer) => {
                if (peer.peerId !== peerId) {
                    sendMessage(peer.socket, {
                        type: SFUMessageType.NEW_PRODUCER,
                        payload: { newProducerId: id }
                    });
                }
            });
        });
    }

    addConsumer(consumer: Consumer, peerId: string){
        this.consumers.push({ consumer: consumer, peerId: peerId });
    }

    currentRoomSize() {
        return this.peers.length
    }
}