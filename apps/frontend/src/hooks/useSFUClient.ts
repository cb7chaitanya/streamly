import { useEffect, useState, useRef } from "react";
import { useSFUSocket } from "./useSFUSocket";
import * as mediasoupClient from "mediasoup-client";
import {
  AppData,
  Producer,
  RtpCapabilities,
  Transport,
  Consumer
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
  const [consumerTransport, setConsumerTransport] = useState<Transport<AppData> | null>(null);
  const [consumer, setConsumer] = useState<Consumer<AppData> | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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
    const transport = await device?.createSendTransport(payload.params);
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
      transportOnProduce(transport);
      if (device && producer) {
        const RtpCapabilities = device.rtpCapabilities;
        sendMessage({
          type: SFUMessageType.CONSUME,
          payload: {
            rtpCapabilities: RtpCapabilities,
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play();

        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
      sendMessage({
        type: SFUMessageType.RESUME,
        payload: { consumerId: data.id },
      });
    }
  };

  const ProducerClose = () => {
    if (consumerTransport) {
      consumerTransport.close();
      setConsumerTransport(null);
    }
    if (consumer) {
      consumer.close();
      setConsumer(null);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = function (event) {
      const message: SFUMessageClientRecieved = JSON.parse(event.data);
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
          newConsumerTransport(message.payload.producerId);
          break;
        }
        case SFUMessageType.SUBSCRIBED: {
          subscribe(message.payload);
          break;
        }
        case SFUMessageType.PRODUCER_CLOSED: {
          ProducerClose();
          break;
        }
      }
    }
    }, [socket, device, producer, localStream, consumerTransport, consumer]);

    return { localVideoRef, remoteVideoRef };
};
