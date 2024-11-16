import {
  AppData,
  RouterOptions,
  RtpCodecCapability,
  WorkerSettings,
} from "mediasoup/node/lib/types.js";

export const workerSettings: WorkerSettings = {
  rtcMinPort: 10000,
  rtcMaxPort: 10100,
  logLevel: "warn",
  logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
};

export const routerOptions: RouterOptions = {
  mediaCodecs: [
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {
        "x-google-start-bitrate": 1000,
      },
    },
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
  ] as RtpCodecCapability[],
};

//Sample WebRtcTransport options
export const webRTCTransportOptions = {
    listenInfos: [
      {
        protocol: 1, // UDP Marker in mediasoup Protocol Type
        ip: "127.0.0.1", // Localhost config for local testing
        announcedAddress: '', // No need to announce for local testing
      }
    ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
};
