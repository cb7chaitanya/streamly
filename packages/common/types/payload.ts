import {
    RtpParameters,
    MediaKind, IceParameters,
    IceCandidate,
    DtlsParameters,
    AppData
} from 'mediasoup/node/lib/types.js';

export interface TransportPayload {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface SubscribedPayload {
  producerId: string;
  id: string;
  rtpParameters: RtpParameters;
  kind: MediaKind;
  type: string;
  producerPaused: boolean;
}

export interface ProducePayload {
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}