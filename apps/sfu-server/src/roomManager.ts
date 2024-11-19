import { WebSocket } from "ws";
import { Peer } from "./peer.js";
import { Room } from "./room.js";
import {
  AppData,
  DtlsParameters,
  Router,
  RtpCapabilities,
  Worker,
} from "mediasoup/node/lib/types.js";
import { routerOptions } from "./rtc-config.js";
import { sendMessage } from "./lib/socket.js";
import { SFUMessageType } from "./types/Sfumsg.js";
import { createWebRtcTransport } from "./lib/transport.js";

export class RoomManager {
  private rooms: Room[];
  private peers: Peer[];
  private peerRoomMapping: Map<string, Room>;
  private worker: Worker<AppData> | null = null;

  constructor() {
    this.rooms = [];
    this.peers = [];
    this.peerRoomMapping = new Map<string, Room>();
  }

  socketHandler(peer: Peer) {
    const { socket, peerId } = peer;
    peer.socket.on("message", async (data) => {
      try {
        const message: any = JSON.parse(data.toString());
        console.log("message", message);
        switch (message.type) {
          case SFUMessageType.JOIN_ROOM: {
            this.onJoinRoom(socket, peer, message.payload.roomId);
            break;
          }

          case SFUMessageType.CREATE_PRODUCER_TRANSPORT: {
            this.onCreateProducerTransport(socket, peerId);
            break;
          }

          case SFUMessageType.CONNECT_PRODUCER_TRANSPORT: {
            this.onConnectProducerTransport(
              socket,
              peerId,
              message.payload.dtlsParameters
            );
            break;
          }

          case SFUMessageType.PRODUCE: {
            this.onProduce(socket, peerId, message.payload);
            break;
          }

          case SFUMessageType.CREATE_CONSUMER_TRANSPORT: {
            this.onCreateConsumerTransport(socket, peerId);
            break;
          }

          case SFUMessageType.CONNECT_CONSUMER_TRANSPORT: {
            this.onConnectConsumerTransport(
              socket,
              peerId,
              message.payload.dtlsParameters
            );
            break;
          }

          case SFUMessageType.GET_PRODUCERS: {
            this.onGetProducers(socket, peerId);
            break;
          }

          case SFUMessageType.RESUME: {
            this.onResume(socket, peerId, message.payload.consumerId);
            break;
          }

          case SFUMessageType.CONSUME: {
            this.onConsume(socket, peerId, message.payload.rtpCapabilities);
            break;
          }
          default: {
            break;
          }
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });
  }

  addPeer(peer: Peer, worker: Worker<AppData>) {
    this.peers.push(peer);
    this.worker = worker;
    this.socketHandler(peer);
  }

  getRoom(peerId: string) {
    const room = this.peerRoomMapping.get(peerId);
    if (!room) {
      console.error("Could not find room");
      return;
    }
    return room;
  }

  removePeer(socket: WebSocket) {
    const peer = this.peers.find((peer) => peer.socket === socket);
    if (!peer) {
      console.error("Peer not found");
      return;
    }
    this.peers = this.peers.filter((peer) => peer.socket !== socket);

    this.removePeerFromRoom(peer);
  }

  removePeerFromRoom(peer: Peer) {
    const room = this.getRoom(peer.peerId);

    if (!room) {
      return;
    }

    room.clear(peer.peerId);
    this.peerRoomMapping.delete(peer.peerId);
  }

  removeRoom(roomId: string) {
    this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
  }

  private async onJoinRoom(ws: WebSocket, peer: Peer, roomId: string) {
    if (!this.worker) {
      console.error("Worker not found");
      return;
    }

    let router: Router<AppData>;
    let room = this.rooms.find((r) => r.roomId === roomId);
    if (room) {
      if (this.rooms.length > 10) {
        sendMessage(ws, {
          type: SFUMessageType.ROOM_FULL,
          payload: { message: "Room is full" },
        });
        return;
      }

      router = room.router;
      room.addNewPeer(peer);
    } else {
      router = await this.worker.createRouter(routerOptions);
      room = new Room(roomId, peer, router);
      this.rooms.push(room);
    }
    this.peerRoomMapping.set(peer.peerId, room);
    console.log('Peer added', this.peerRoomMapping)
    sendMessage(ws, {
      type: SFUMessageType.JOIN_ROOM,
      payload: { rtpCapabilites: router.rtpCapabilities },
    });
  }

  private async onCreateProducerTransport(ws: WebSocket, peerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      console.error("Room not found");
      return;
    }
    try {
      const transport = await createWebRtcTransport(room.router);
      sendMessage(ws, {
        type: SFUMessageType.CREATE_PRODUCER_TRANSPORT,
        payload: {
          params: {
            id: transport!.id,
            iceParameters: transport!.iceParameters,
            iceCandidates: transport!.iceCandidates,
            dtlsParameters: transport!.dtlsParameters,
          }
        },
      });
      room.addProducerTransport(transport!, peerId);
    } catch (error) {
      console.error(error);
    }
  }

  private async onConnectProducerTransport(
    ws: WebSocket,
    peerId: string,
    dtlsParameters: DtlsParameters
  ) {
    const transport = this.getRoom(peerId)?.getProducerTransport(peerId);
    if(!transport){
      console.error("Transport not found")
    }

    if (transport) {
      await transport.transport.connect({ dtlsParameters });
    }

    sendMessage(ws, {
      type: SFUMessageType.PRODUCER_CONNECTED,
      payload: {
        message: "Producer connected",
      },
    });
  }

  private async onConnectConsumerTransport(
    ws: WebSocket,
    peerId: string,
    dtlsParameters: DtlsParameters
  ) {
    const transport = this.getRoom(peerId)?.getConsumerTransport(peerId);

    if (transport) {
      await transport.transport.connect({ dtlsParameters });
      sendMessage(ws, {
        type: SFUMessageType.CONSUMER_CONNECTED,
        payload: {
          message: "Consumer connected",
        },
      });
    }
  }

  private async onCreateConsumerTransport(ws: WebSocket, peerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      console.error("Room not found");
      return;
    }
    try {
      const transport = await createWebRtcTransport(room.router);
      sendMessage(ws, {
        type: SFUMessageType.CREATE_CONSUMER_TRANSPORT,
        payload: {
          params: {
            id: transport!.id,
            iceParameters: transport!.iceParameters,
            iceCandidates: transport!.iceCandidates,
            dtlsParameters: transport!.dtlsParameters,
          }
        },
      });
      room.addConsumerTransport(transport!, peerId);
    } catch (error) {
      console.error(error);
    }
  }
  
  private onGetProducers(ws: WebSocket, peerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    const producers = room.getProducers();
    const producersList = producers
      .filter((producer) => producer.peerId !== peerId)
      .map(({ producer }) => producer.id);

    sendMessage(ws, {
      type: SFUMessageType.GET_PRODUCERS,
      payload: {
        producersList: producersList,
      },
    });
  }

  private async onProduce(ws: WebSocket, peerId: string, payload: any) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }

    const producers = room.getProducers();

    const transport = room.getProducerTransport(peerId);
    if (transport) {
      const producer = await transport.transport.produce(payload);

      sendMessage(ws, {
        type: SFUMessageType.PRODUCED,
        payload: {
          id: producer.id,
          producerExist: !!producers && producers.length > 1,
        },
      });

      room.addProducer(producer, peerId);
      room.informConsumers(producer.id);
      producer.on("transportclose", () => {
        producer.close();
      });
    }
  }

  private async onResume(ws: WebSocket, peerId: string, consumerId: string) {
    const room = this.getRoom(peerId);

    if (!room) {
      return;
    }

    const consumers = room.getConsumers();
    const consumer = consumers.find(
      (c) => c.consumer.id === consumerId
    )?.consumer;

    if (consumer) {
      await consumer.resume();
    }
  }

  private async onConsume(
    ws: WebSocket,
    peerId: string,
    rtpCapabilites: RtpCapabilities
  ) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }

    const producers = room.getProducers();
    console.log('peerId', peerId)
    console.log('producers', producers)
    const remoteProducerId = producers.filter(
      ({ peerId: id }) => peerId !== id
    )[0]?.producer.id;

    if (!remoteProducerId) {
      console.log("No remote producer found");
      return;
    }

    const router = room.router;
    if (
      router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities: rtpCapabilites,
      })
    ) {
      try {
        const consumerTransport = room.getConsumerTransport(peerId);
        if (consumerTransport) {
          const consumer = await consumerTransport.transport.consume({
            producerId: remoteProducerId,
            rtpCapabilities: rtpCapabilites,
            paused: true,
          });

          consumer.on("producerclose", () => {
            sendMessage(ws, {
              type: SFUMessageType.PRODUCER_CLOSED,
              payload: { remoteProducerId },
            });
            consumerTransport.transport.close();

            room.removeConsumerTransport(consumerTransport.transport.id);

            consumer.close();
            room.removeConsumer(consumer.id);
          });

          sendMessage(ws, {
            type: SFUMessageType.SUBSCRIBED,
            payload: {
              producerId: remoteProducerId,
              id: consumer.id,
              rtpParameters: consumer.rtpParameters,
              kind: consumer.kind,
              type: consumer.type,
              producerPaused: consumer.producerPaused,
            },
          });
          room.addConsumer(consumer, peerId);
        }
      } catch (error) {
        throw `Error: ${error}`;
      }
    }
  }
}
