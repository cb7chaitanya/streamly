import { workerSettings, routerOptions } from "./rtc-config.js";
import { createWorker } from "./lib/worker.js";
import { Router, Worker } from "mediasoup/node/lib/types.js";
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

   
}