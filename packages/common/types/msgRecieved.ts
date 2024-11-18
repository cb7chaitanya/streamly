import { SFUMessageType } from "./SFUmsg.js";
import { RtpCapabilities, DtlsParameters } from "mediasoup/node/lib/types.js";
import { ProducePayload } from "./payload.js";

export interface JoinRoomServerRecieved {
  type: SFUMessageType.JOIN_ROOM;
  payload: {
    roomId: string;
  };
}

export interface CreateProducerTransportServerRecieved {
  type: SFUMessageType.CREATE_PRODUCER_TRANSPORT;
}

export interface ConnectProducerTransportServerRecieved {
  type: SFUMessageType.CONNECT_PRODUCER_TRANSPORT;
  payload: {
    dtlsParameters: DtlsParameters;
  };
}

export interface ProduceServerRecieved {
  type: SFUMessageType.PRODUCE;
  payload: ProducePayload;
}

export interface CreateConsumerTransportServerRecieved {
  type: SFUMessageType.CREATE_CONSUMER_TRANSPORT;
}

export interface ConnectConsumerTransportServerRecieved {
  type: SFUMessageType.CONNECT_CONSUMER_TRANSPORT;
  payload: {
    dtlsParameters: DtlsParameters;
  };
}

export interface GetProducersServerRecieved {
  type: SFUMessageType.GET_PRODUCERS;
}

export interface ResumeServerRecieved {
  type: SFUMessageType.RESUME;
  payload: {
    consumerId: string;
  };
}

export interface ConsumeServerRecieved {
  type: SFUMessageType.CONSUME;
  payload: {
    rtpCapabilities: RtpCapabilities;
  };
}

export type SFUServerMessageReceived =
  | JoinRoomServerRecieved
  | CreateProducerTransportServerRecieved
  | ConnectProducerTransportServerRecieved
  | ProduceServerRecieved
  | CreateConsumerTransportServerRecieved
  | ConnectConsumerTransportServerRecieved
  | GetProducersServerRecieved
  | ResumeServerRecieved
  | ConsumeServerRecieved;

export type SFUClientMessageSent = SFUServerMessageReceived;
