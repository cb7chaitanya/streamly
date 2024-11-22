import { DtlsState, Router } from "mediasoup/node/lib/types.js";

export const createWebRtcTransport = async (router: Router) => {
    const transport = await router.createWebRtcTransport({
        listenInfos: [
            {
                protocol: "udp", // UDP Marker in mediasoup Protocol Type
                ip: "127.0.0.1", // Localhost config for local testing
                announcedAddress: '' //No announced address for local testing
            }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true
    });
    transport.on('dtlsstatechange', (dtlsState: DtlsState) => {
        if (dtlsState === 'closed') {
            transport.close();
        }
    });

    const { id, iceParameters, iceCandidates, dtlsParameters } = transport;
    return {
        transport, 
        params: {
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            
        }
    }
};