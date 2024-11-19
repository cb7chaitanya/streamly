import { useEffect, useState, useRef } from "react";
import { useSFUSocket } from "./useSFUSocket";
import * as mediasoupClient from "mediasoup-client";
import {
  AppData,
  Producer,
  RtpCapabilities,
  Transport,
  Consumer,
} from "mediasoup-client/lib/types";
import {
  SFUClientMessageSent,
  SFUMessageClientRecieved,
  SFUMessageType,
  SubscribedPayload,
  TransportPayload,
} from "@repo/common/client";
import { videoParams } from "../config/SFU";

export const useSFUClient = () => {
  const { socket, localStream } = useSFUSocket();
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [producer, setProducer] = useState<Producer<AppData> | null>(null);
  const [consumingTransports, setConsumingTransports] = useState<string[]>([]);
  const [consumerTransport, setConsumerTransport] =
    useState<Transport<AppData> | null>(null);
  const [consumer, setConsumer] = useState<Consumer<AppData> | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const sendMessage = (message: SFUClientMessageSent) => {
    socket?.send(JSON.stringify(message));
  };

  const createDevice = async (routerRtpCapabilities: RtpCapabilities) => {
    const newDevice = new mediasoupClient.Device();
    await newDevice.load({
      routerRtpCapabilities,
    });
    setDevice(newDevice);
    sendMessage({
      type: SFUMessageType.CREATE_PRODUCER_TRANSPORT,
    });
  };

  const newConsumerTransport = async (remoteProducerId: string) => {
    if (consumingTransports.includes(remoteProducerId)) return;
    setConsumingTransports((prev) => [...prev, remoteProducerId]);
    sendMessage({
      type: SFUMessageType.CREATE_CONSUMER_TRANSPORT,
    });
  };

  const transportOnProduce = (transport: Transport<AppData>) => {
    transport.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          sendMessage({
            type: SFUMessageType.PRODUCE,
            payload: {
              kind,
              rtpParameters,
              appData,
            },
          });
          socket?.addEventListener("message", (event) => {
            const message: SFUMessageClientRecieved = JSON.parse(
              event.data.toString()
            );
            if (message.type === SFUMessageType.PRODUCED) {
              const { id, producersExist } = message.payload;
              callback({ id });
              if (producersExist) {
                sendMessage({
                  type: SFUMessageType.GET_PRODUCERS,
                });
              }
            }
          });
        } catch (error) {
          console.error(`Error producing: ${error}`);
          errback(error as Error);
        }
      }
    );
  };

  const transportOnConnect = (
    transport: Transport<AppData>,
    isProducer: boolean
  ) => {
    transport?.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        sendMessage({
          type: isProducer
            ? SFUMessageType.CONNECT_PRODUCER_TRANSPORT
            : SFUMessageType.CONNECT_CONSUMER_TRANSPORT,
          payload: {
            dtlsParameters,
          },
        });
        socket?.addEventListener("message", (event) => {
          const message: SFUMessageClientRecieved = JSON.parse(event.data);
          const successMessage = isProducer
            ? SFUMessageType.PRODUCER_CONNECTED
            : SFUMessageType.CONSUMER_CONNECTED;
          if (message.type === successMessage) {
            callback();
          }
        });
      } catch (error) {
        console.error(`Error connecting: ${error}`);
        errback(error as Error);
      }
    });
  };

  const createProducerTransport = async (payload: {
    params: TransportPayload;
  }) => {
    if (!payload.params.id) {
      console.error('Missing transport ID from server');
      return;
    }

    const transport = await device?.createSendTransport({
      id: payload.params.id,
      iceParameters: payload.params.iceParameters,
      iceCandidates: payload.params.iceCandidates,
      dtlsParameters: payload.params.dtlsParameters,
    });

    if (transport) {
      transportOnConnect(transport, true);
      transportOnProduce(transport);
    }
    try {
      const track = localStream?.getVideoTracks()[0];
      if (track) {
        const producer = await transport?.produce({
          track,
          ...videoParams,
        });
        if (producer) {
          setProducer(producer);
        }
      }
    } catch (error) {
      console.error(`Error creating producer: ${error}`);
    }
  };

  const createConsumerTransport = async (payload: {
    params: TransportPayload;
  }) => {
    const transport = await device?.createRecvTransport(payload.params);
    if (transport) {
      transportOnConnect(transport, false);
      setConsumerTransport(transport);
      if (device && producer) {
        const { rtpCapabilities } = device;
        sendMessage({
          type: SFUMessageType.CONSUME,
          payload: {
            rtpCapabilities,
          },
        });
      }
    }
  };

  const subscribe = async (data: SubscribedPayload) => {
    if (consumerTransport) {
      const newConsumer = await consumerTransport.consume(data);
      setConsumer(newConsumer);

      const stream = new MediaStream([newConsumer.track]);
      setRemoteStreams(prev => new Map(prev).set(data.id, stream));

      const videoElement = remoteVideoRefs.current.get(data.id);
      console.log('Remote video element:', videoElement, 'for id:', data.id);
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play().catch(console.error);
      }

      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      sendMessage({
        type: SFUMessageType.RESUME,
        payload: { consumerId: data.id },
      });
    }
  };

  const ProducerClose = (consumerId: string) => {
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(consumerId);
      return newMap;
    });

    const videoElement = remoteVideoRefs.current.get(consumerId);
    if (videoElement) {
      videoElement.srcObject = null;
      remoteVideoRefs.current.delete(consumerId);
    }

    if (consumer) {
      consumer.close();
      setConsumer(null);
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = function (event) {
      const message: SFUMessageClientRecieved = JSON.parse(event.data);
      console.log('Received message:', message.type, message.payload);
      switch (message.type) {
        case SFUMessageType.JOIN_ROOM:
          const { rtpCapabilites } = message.payload;
          createDevice(rtpCapabilites);
          break;
        case SFUMessageType.CREATE_PRODUCER_TRANSPORT: {
          createProducerTransport(message.payload);
          break;
        }
        case SFUMessageType.GET_PRODUCERS: {
          const { producersList } = message.payload;
          producersList.forEach(newConsumerTransport);
          break;
        }
        case SFUMessageType.CREATE_CONSUMER_TRANSPORT: {
          createConsumerTransport(message.payload);
          break;
        }
        case SFUMessageType.NEW_PRODUCER: {
          newConsumerTransport(message.payload.newProducerId);
          break;
        }
        case SFUMessageType.SUBSCRIBED: {
          subscribe(message.payload);
          break;
        }
        case SFUMessageType.PRODUCER_CLOSED: {
          ProducerClose(message.payload.remoteProducerId);
          break;
        }
      }
    };
  }, [socket, device, producer, localStream, consumerTransport, consumer]);

  return { 
    localVideoRef, 
    localStream,
    remoteStreams,
    remoteVideoRefs 
  };
};
