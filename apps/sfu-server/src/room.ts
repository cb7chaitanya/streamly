import { Transport, Producer, AppData, Consumer, Router } from 'mediasoup/node/lib/types.js'
import { Peer } from './peer.js'
import { sendMessage } from './lib/socket.js';

interface ITransport {
    peerId: string;
    transport: Transport;
}

interface IProducer {
    peerId: string;
    producer: Producer;
}

interface IConsumer {
    peerId: string;
    consumer: Consumer;
}

export class Room {
    public roomId: string;
    public router: Router<AppData>;
    public peers: Peer[];
    public producerTransports: ITransport[] = [];
    public consumerTransports: ITransport[] = [];
    public producers: IProducer[] = [];
    public consumers: IConsumer[] = [];

    constructor(roomId: string, peer1: Peer, router: Router<AppData>) {
        this.roomId = roomId;
        this.peers = [peer1];
        this.router = router;
    }

    removeItems<T extends { peerId: string }>(
        items: T[],
        peerId: string,
        type: keyof T,
    ) {
        items.forEach((item) => {
          if (item.peerId === peerId) {
            (item[type] as Consumer | Producer | Transport).close();
          }
        });
        items = items.filter((item) => item.peerId !== peerId);
        return items;
    }

    clear(peerId: string){
        this.consumerTransports = this.removeItems(this.consumerTransports, peerId, 'transport');

        this.producerTransports = this.removeItems(this.producerTransports, peerId, 'transport');

        this.consumers = this.removeItems(this.consumers, peerId, 'consumer');
        
        this.producers = this.removeItems(this.producers, peerId, 'producer');
    }

    addNewPeer(peer: Peer){
        this.peers.push(peer);
    }

    removePeer(peerId: string){
        this.clear(peerId)
        this.peers = this.peers.filter((peer) => peer.peerId !== peerId);
    }

    addProducerTransport(transport: Transport, peerId: string){
        this.producerTransports.push({
            peerId, transport
        })
    }

    addConsumerTransport(transport: Transport, peerId: string){
        this.consumerTransports.push({
            peerId, transport
        })
    }

    getProducerTransport(peerId: string){
        return this.producerTransports.find((item) => item.peerId === peerId);
    }

    getConsumerTransport(peerId: string){
        return this.consumerTransports.find((item) => item.peerId === peerId);
    }

    getProducers(){
        return this.producers
    }
    
    addProducer(producer: Producer, peerId: string){
        this.producers.push({ producer, peerId })
    }

    addConsumer(consumer: Consumer, peerId: string){
        this.consumers.push({ consumer, peerId })
    }

    getConsumers(){
        return this.consumers
    }

    removeConsumerTransport(peerId: string){
        this.consumerTransports = this.removeItems(this.consumerTransports, peerId, 'transport');
    }
     
    removeConsumer(peerId: string){
        this.consumers = this.removeItems(this.consumers, peerId, 'consumer');
    }

    informConsumers(newProducerId: string, producerId: string){
        this.peers.forEach((peer) => {
            if(peer.peerId !== newProducerId){
                sendMessage(peer.socket, {
                    type: 'new-producer',
                    payload: { producerId }
                })
            }
        })
    }

}