import medaisoup from 'mediasoup';
import { RouterOptions, WorkerSettings } from 'mediasoup/node/lib/types.js';

export const workerSettings: WorkerSettings = {
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn',
    logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp'
    ]
}

export const routerOptions: RouterOptions = {
    mediaCodecs: [
        {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {
                'x-google-start-bitrate': 1000
            }
        },
        {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
        }
    ]
}

let worker;
let router;

export const createWorker = async () => {
    worker = await medaisoup.createWorker(workerSettings);
    worker.on('died', () => {
        console.error('mediasoup worker died');
    })

    router = await worker.createRouter(routerOptions);
}