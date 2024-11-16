import { workerSettings, routerOptions } from "./rtc-config.js";
import { createWorker } from "./lib/worker.js";
import { AppData, Router, Worker } from "mediasoup/node/lib/types.js";
import { EventEmitter } from "events";

export class SFU extends EventEmitter {
    private worker: Worker | null = null;
    private router: Router | null = null;

    constructor() {
        super();
    }

    async start() {
        try {
            this.worker = await createWorker(workerSettings);
            this.router = await this.worker.createRouter(routerOptions);
        } catch(error) {
            throw error
        }
    }

    async stop(){
        if(this.worker) {
            this.worker.close();
            console.log('Worker closed')
        } else {
            console.warn('Worker is not initialized')
        }
    }

    async createWebRtcTransport() {
        if(!this.router){
            throw new Error("Router is not initialized")
        }

        try{
            const transport = await this.router.createWebRtcTransport({
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
            this.emit('transport-created', transport)

            transport.on('dtlsstatechange', (dtlsState) => {
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
}