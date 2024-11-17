import { DtlsState, Router } from "mediasoup/node/lib/types.js"

export const createWebRtcTransport = async (router: Router) => {
    if(!router){
        throw new Error("Router is not initialized")
    }

    try{
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
        })
        console.log('Transport created', transport.id)

        transport.on('dtlsstatechange', (dtlsState: DtlsState) => {
            if(dtlsState === 'closed'){
                transport.close();
            }
        })
        
        return transport;
    } catch(error){
        console.log('Error creating transport', error)
        return;
    }
}