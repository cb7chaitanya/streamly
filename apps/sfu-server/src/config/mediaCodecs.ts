import { MediaKind, RtpCodecCapability} from 'mediasoup/node/lib/rtpParametersTypes.js'

export const mediaCodecs = [
    {
      kind: 'audio' as MediaKind,
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: 'video' as MediaKind,
      mimeType: 'video/H264',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
      },
    },
  ] as RtpCodecCapability[];
