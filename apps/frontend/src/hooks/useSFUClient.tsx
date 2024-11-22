import { useEffect, useRef, useState } from "react";
import { useSFUSocket } from "./useSFUSocket";
import * as MediasoupClient from 'mediasoup-client';
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { AppData, Producer, Transport, Consumer } from "mediasoup-client/lib/types";
import { SFUClientMessageSent, SFUMessageClientRecieved, SFUMessageType, SubscribedPayload, TransportPayload } from "@repo/common/client";
import { videoParams } from "../config/SFU";
export const useSFUClient = () => {
    const { socket, localStream } = useSFUSocket()
    const [device, setDevice] = useState<MediasoupClient.Device | null>(null)
    const [producer, setProducer] = useState<Producer<AppData> | null>(null)
    const [consumerTransport, setConsumerTransport] = useState<Transport<AppData> | null>(null)
    const [consumingTransports, setConsumingTransports] = useState<string[]>
    ([])
    const [consumer, setConsumer] = useState<Consumer<AppData> | null>(null)

    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
    
    const sendMessage = (message: SFUClientMessageSent) => {
        socket?.send(JSON.stringify(message))
    }

    const transportConnectionHandler = async (transport: Transport<AppData>, isProducer: boolean) => {
        transport.on('connect', async ({ dtlsParameters}, callback, errback) => {
            try {
                sendMessage({
                    type: isProducer ? SFUMessageType.CONNECT_PRODUCER_TRANSPORT : SFUMessageType.CONNECT_CONSUMER_TRANSPORT,
                    payload: {
                        dtlsParameters
                    }
                })
                socket?.addEventListener('message', (event) => {
                    const message: SFUMessageClientRecieved = JSON.parse(event.data)
                    const successMessage = isProducer ? SFUMessageType.PRODUCER_CONNECTED : SFUMessageType.CONSUMER_CONNECTED

                    if(message.type === successMessage){
                        callback()
                    }
                })
            } catch (error){
                errback(error as Error)
            }
        })
    }

    const transportOnProduceHandler = async (transport: Transport<AppData>) => {
        transport.on('produce', async ({ kind, rtpParameters, appData}, callback, errback) => {
            try {
                sendMessage({
                    type: SFUMessageType.PRODUCE,
                    payload: {
                        kind,
                        rtpParameters,
                        appData
                    }
                })
                socket?.addEventListener('message', (event) => {
                    const message: SFUMessageClientRecieved = JSON.parse(event.data)
                    if(message.type === SFUMessageType.PRODUCED){
                        const { id, producersExist } = message.payload
                        callback({ id })
                        if(producersExist){
                            sendMessage({
                                type: SFUMessageType.GET_PRODUCERS
                            })
                        }  
                    }
                })
            } catch(error){
                console.error("Error in transportOnProduceHandler", error)
                errback(error as Error)
            }
        })
    }

    const createDevice = async (routerRtpCapabilities: RtpCapabilities) => {
        const device = new MediasoupClient.Device();
        await device.load({ routerRtpCapabilities });
        setDevice(device)
        sendMessage({
            type: SFUMessageType.CREATE_PRODUCER_TRANSPORT
        })
    }

    const createProducerTransportHandler = async (payload: {
        params: TransportPayload
    }) => {
        const transport = device?.createSendTransport(payload.params);
        if(transport){
            transportConnectionHandler(transport, true)
            transportOnProduceHandler(transport)
            try {
                const track = localStream?.getTracks()[0]
                if(track){
                    const producer = await transport.produce({
                        track,
                        ...videoParams
                    })
                    if(producer){
                        setProducer(producer)
                    }
                }
            } catch(error){
                console.error("Error in createProducerTransportHandler", error)
            }
        }
    }

    const getProducersSignallingHandler = async (remoteProducerId: string) => {
        if(consumingTransports.includes(remoteProducerId)) return
        setConsumingTransports((prev) => [...prev, remoteProducerId])
        sendMessage({
            type: SFUMessageType.CREATE_CONSUMER_TRANSPORT
        })
    }

    const createConsumerTransportHandler = async (payload: {
        params: TransportPayload
    }) => {
        const transport = device?.createRecvTransport(payload.params);
        if(transport){
            transportConnectionHandler(transport, false)
            setConsumerTransport(transport)
            if(device && producer){
                const rtpCapabilities = device.rtpCapabilities
                sendMessage({
                    type: SFUMessageType.CONSUME,
                    payload: {
                        rtpCapabilities
                    }
                })
            }
        }
    }

    const subscribeHandler = async (data: SubscribedPayload) => {
        if(consumerTransport){
            const newConsumer = await consumerTransport.consume(data)
            setConsumer(newConsumer)

            const stream = new MediaStream([newConsumer.track])
            setRemoteStreams(prev => prev.set(data.id, stream))

            const videoElement = remoteVideoRefs.current.get(data.id)

            if(videoElement){
                videoElement.srcObject = stream
                videoElement.play().catch(console.error)
            }

            if(localStream && localVideoRef.current){
                localVideoRef.current.srcObject = localStream
            }
        }
        sendMessage({
            type: SFUMessageType.RESUME,
            payload: {
                consumerId: data.id
            }
        })
    }

    const producerCloseHandler = async(remoteProducerId: string) => {
        setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(remoteProducerId);
            return newMap;
        });
        const videoElement = remoteVideoRefs.current.get(remoteProducerId);
        if (videoElement) {
            videoElement.srcObject = null;
            remoteVideoRefs.current.delete(remoteProducerId);
        }
        if (consumer) {
            consumer.close();
            setConsumer(null);
        }
    }

    useEffect(() => {
        if(!socket) return
        socket.onmessage = (event) => {
            const message: SFUMessageClientRecieved = JSON.parse(event.data)
            switch (message.type){
                case SFUMessageType.JOIN_ROOM: 
                    const rtpCapabilities: RtpCapabilities = message.payload.rtpCapabilites;
                    createDevice(rtpCapabilities)
                    break;
                case SFUMessageType.CREATE_PRODUCER_TRANSPORT:
                    createProducerTransportHandler(message.payload)
                    break;
                case SFUMessageType.GET_PRODUCERS: 
                    const { producersList } = message.payload
                    producersList.forEach(getProducersSignallingHandler)
                    break;
                case SFUMessageType.CREATE_CONSUMER_TRANSPORT:
                    createConsumerTransportHandler(message.payload)
                    break;
                case SFUMessageType.SUBSCRIBED: 
                    subscribeHandler(message.payload)
                    break;
                case SFUMessageType.NEW_PRODUCER:
                    getProducersSignallingHandler(message.payload.newProducerId)
                    break;
                case SFUMessageType.PRODUCER_CLOSED:
                    producerCloseHandler(message.payload.remoteProducerId)
                    break;
                default: 
                    break;
            }
        }
    }, [socket, device, producer, consumer, localStream, remoteVideoRefs, localVideoRef, consumerTransport, consumingTransports])

    return { localVideoRef, remoteVideoRefs, remoteStreams }
}