import { Peer } from "./Peer.js";
import { Room } from "./Room.js";
import { Worker, AppData, Router, DtlsParameters, RtpCapabilities } from 'mediasoup/node/lib/types.js';
import { sendMessage } from "./utils/socketMsg.js";
import { ProducePayload, SFUMessageType } from "@repo/common/client";
import { WebSocket } from "ws";
import { mediaCodecs } from './config/mediaCodecs.js'
import { createWebRtcTransport } from './utils/transport.js'

export class SFU {
    private rooms: Room[];
    private peers: Peer[];
    private peerRoomMapping: Map<string, Room>;
    private worker: Worker<AppData> | null = null;

    constructor(){
        this.rooms = [];
        this.peers = [];
        this.peerRoomMapping = new Map<string, Room>();
    }

    addPeer(peer: Peer, worker: Worker<AppData>){
        this.peers.push(peer)
        this.worker = worker
        this.handleIncomingSocketMessages(peer)
    }


    removePeer(socket: WebSocket){
        const peer = this.peers.find((peer) => peer.socket === socket)
        if(!peer){
            console.error("Peer not found")
            return;
        }    

        this.peers = this.peers.filter((peer) => peer.socket !== socket)
        
        this.removePeerFromRoom(peer)
    }

    removePeerFromRoom(peer: Peer){
        const room = this.peerRoomMapping.get(peer.peerId)
        if(!room){
            return
        }

        if(room.peers.includes(peer)){
            room.peers = room.peers.filter((p) => p.peerId !== peer.peerId)
            if(room.currentRoomSize() === 0){
                this.removeRoom(room.roomId)
            }
        }
        room.clear(peer.peerId)
        this.peerRoomMapping.delete(peer.peerId)
    }

    removeRoom(roomId: string){
        this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
    }

    private joinRoomHandler = async (ws: WebSocket, roomId: string, peer: Peer) => {
        if(!this.worker){
            console.error("Worker not found");
            return;
        }
        let router: Router<AppData>;
        let room = this.rooms.find((r) => r.roomId === roomId);
        if(room){
            if(room.currentRoomSize() > 10){
                sendMessage(ws, {
                    type: SFUMessageType.ROOM_FULL,
                    payload: {
                        message: "Room is full"
                    }
                })
                return;
            }
            router = room.router;
            room.addNewPeer(peer);
        } 
        else {
            try{
                router = await this.worker.createRouter({ mediaCodecs });
                room = new Room(roomId, peer, router);
                this.rooms.push(room);
            } catch(error){
                console.error("Error creating room:", error);
                return
            }
        }
        this.peerRoomMapping.set(peer.peerId, room)
        sendMessage(ws, {
            type: SFUMessageType.JOIN_ROOM,
            payload: { rtpCapabilites: router.rtpCapabilities }
        })
    }       

    private createProducerTransportHandler = async (ws: WebSocket, peerId: string) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            console.log('Room not found at producer transport handler');
            return;
        }
        try {
            const { transport, params } = await createWebRtcTransport(room.router);
            sendMessage(ws, {
                type: SFUMessageType.CREATE_PRODUCER_TRANSPORT,
                payload: {
                    params
                }
            })
            room.addProducerTransport(transport, peerId);
        } catch (error) {
            console.error("Error creating producer transport:", error);
        }
    }

    private connectProducerTransportHandler = async (ws: WebSocket, peerId: string, dtlsParameters: DtlsParameters) => {
        const transport = this.peerRoomMapping.get(peerId)?.getProducerTransport(peerId);
        if(transport){
            await transport.connect({ dtlsParameters });

            sendMessage(ws, {
                type: SFUMessageType.PRODUCER_CONNECTED,
                payload: {
                    message: 'Producer transport connected'
                }
            })
        }
    }

    private produceHandler = async (ws: WebSocket, peerId: string, payload: ProducePayload) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            console.log('Room not found at produce handler');
            return;
        }
        const producers = room.getProducers();
        const transport = room.getProducerTransport(peerId);
        if(transport){
            const producer = await transport.produce(payload); 
            sendMessage(ws, {
                type: SFUMessageType.PRODUCED,
                payload: {
                    id: producer.id,
                    producersExist: !!producers && producers.length > 1
                }
            })
            room.addProducer(producer, peerId);
            room.informConsumers(producer.id);

            producer.on('transportclose', () => {
                producer.close();
            })
        }
    }

    private createConsumerTransportHandler = async(ws:WebSocket, peerId: string) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            return;
        }
        const { transport, params } = await createWebRtcTransport(room.router);
        sendMessage(ws, {
            type: SFUMessageType.CREATE_CONSUMER_TRANSPORT,
            payload: {
                params
            }
        })
        room.addConsumerTransport(transport, peerId);
    }

    private connectConsumerTransportHandler = async(ws: WebSocket, peerId: string, dtlsParameters: DtlsParameters) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            return;
        }
        const transport = room.getConsumerTransport(peerId);
        if(transport){
            await transport.connect({ dtlsParameters });
            sendMessage(ws, {
                type: SFUMessageType.CONSUMER_CONNECTED,
                payload: {
                    message: 'Consumer transport connected'
                }
            })
        }
    }

    private getProducersHandler = async(ws: WebSocket, peerId: string) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            return;
        }
        const producers = room.getProducers();
        const producersList = producers.filter(({ producer: { id }}) => peerId !== id).map(({ producer: { id }}) => id);
        sendMessage(ws, {
            type: SFUMessageType.GET_PRODUCERS,
            payload: {
                producersList: producersList
            }
        })
    }

    private resumeHandler = async(ws: WebSocket, peerId: string, consumerId: string) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            return
        }
        const consumers = room.getConsumers();
        const consumer = consumers.find((c) => c.consumer.id === consumerId)?.consumer;
        if(consumer){
            await consumer.resume();
        }
    }

    private consumeHandler = async(ws: WebSocket, peerId: string, rtpCapabilites: RtpCapabilities) => {
        const room = this.peerRoomMapping.get(peerId);
        if(!room){
            return
        }
        const producers = room.getProducers()
        const filteredProducers = producers.filter(({ peerId: id }) => peerId !== id);
        if(filteredProducers.length > 0){
            const remoteProducerId = filteredProducers[0].producer.id
            if(!remoteProducerId){
                console.log('Remote producer not found');
                return;
            }
            const router = room.router
            if(router.canConsume({ producerId: remoteProducerId, rtpCapabilities: rtpCapabilites })){
                try {
                    const consumerTransport = room.getConsumerTransport(peerId)
                    if(consumerTransport){
                        const consumer = await consumerTransport.consume({
                            producerId: remoteProducerId,
                            rtpCapabilities: rtpCapabilites,
                            paused: true
                        })
    
                        consumer.on('producerclose', () => {
                            sendMessage(ws, {
                                type: SFUMessageType.PRODUCER_CLOSED,
                                payload: {
                                    remoteProducerId: remoteProducerId
                                }
                            })
                            consumerTransport.close();
                            room.removeConsumerTransport(consumerTransport.id)
                            consumer.close()
                            room.removeConsumer(consumer.id)
                        })
    
                        sendMessage(ws, {
                            type: SFUMessageType.SUBSCRIBED,
                            payload: {
                                producerId: remoteProducerId,
                                id: consumer.id,
                                rtpParameters: consumer.rtpParameters,
                                kind: consumer.kind,
                                type: consumer.type,
                                producerPaused: consumer.producerPaused
                            }
                        })
    
                        room.addConsumer(consumer, peerId)
                    }
                } catch(error){
                    console.error('error', error)
                }
            }
        } else {
            console.log('No remote producers found here');
            return
        }
        
    }

    private handleIncomingSocketMessages(peer: Peer) {
        const { socket, peerId } = peer;
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            
            switch(message.type){
                case SFUMessageType.JOIN_ROOM:
                    this.joinRoomHandler(socket, message.payload.roomId, peer)
                    break;
                case SFUMessageType.CREATE_PRODUCER_TRANSPORT:
                    this.createProducerTransportHandler(socket, peerId);
                    break;
                case SFUMessageType.CONNECT_PRODUCER_TRANSPORT: 
                    this.connectProducerTransportHandler(socket, peerId, message.payload.dtlsParameters);
                    break;
                case SFUMessageType.PRODUCE:
                    this.produceHandler(socket, peerId, message.payload);
                    break;
                case SFUMessageType.CREATE_CONSUMER_TRANSPORT: 
                    this.createConsumerTransportHandler(socket, peerId);
                    break;
                case SFUMessageType.CONNECT_CONSUMER_TRANSPORT:
                    this.connectConsumerTransportHandler(socket, peerId, message.payload.dtlsParameters);
                    break;
                case SFUMessageType.GET_PRODUCERS:
                    this.getProducersHandler(socket, peerId);
                    break;
                case SFUMessageType.RESUME:
                    this.resumeHandler(socket, peerId, message.payload.consumerId);
                    break;
                case SFUMessageType.CONSUME: 
                    this.consumeHandler(socket, peerId, message.payload.rtpCapabilites);
                    break;
                default: 
                    break;
            }   
        })
    }
}