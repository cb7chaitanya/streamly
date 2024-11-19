import { RtpCapabilities } from "mediasoup/node/lib/rtpParametersTypes.js";
import { SFUMessageType } from "./SFUmsg.js";
import { SubscribedPayload, TransportPayload } from "./payload.js";

export interface ConsumerConnectedServerSend {
  type: SFUMessageType.CONSUMER_CONNECTED;
  payload: { message: string };
}

export interface ProducerConnectedServerSend {
  type: SFUMessageType.PRODUCER_CONNECTED;
  payload: { message: string };
}

export interface SubscribedServerSend {
  type: SFUMessageType.SUBSCRIBED;
  payload: SubscribedPayload;
}

export interface NewProducerServerSend {
  type: SFUMessageType.NEW_PRODUCER;
  payload: {
    newProducerId: string;
  };
}

export interface JoinRoomServerSend {
  type: SFUMessageType.JOIN_ROOM;
  payload: {
    rtpCapabilites: RtpCapabilities;
  };
}

export interface RoomFullServerSend {
  type: SFUMessageType.ROOM_FULL;
  payload: {
    message: string;
  };
}

export interface CreateProducerTransportServerSend {
  type: SFUMessageType.CREATE_PRODUCER_TRANSPORT;
  payload: {
    params: TransportPayload;
  };
}

export interface CreateConsumerTransportServerSend {
  type: SFUMessageType.CREATE_CONSUMER_TRANSPORT;
  payload: {
    params: TransportPayload;
  };
}

export interface ProducedServerSend {
  type: SFUMessageType.PRODUCED;
  payload: {
    id: string;
    producersExist: boolean;
  };
}

export interface GetProducersServerSend {
  type: SFUMessageType.GET_PRODUCERS;
  payload: { producersList: string[] };
}

export interface ProducerClosedServerSend {
  type: SFUMessageType.PRODUCER_CLOSED;
  payload: { remoteProducerId: string };
}

export type SFUMessageServerSent =
  | ConsumerConnectedServerSend
  | ProducerConnectedServerSend
  | SubscribedServerSend
  | NewProducerServerSend
  | JoinRoomServerSend
  | RoomFullServerSend
  | CreateProducerTransportServerSend
  | CreateConsumerTransportServerSend
  | ProducedServerSend
  | GetProducersServerSend
  | ProducerClosedServerSend;

export type SFUMessageClientRecieved = SFUMessageServerSent;
