import * as mediasoup from 'mediasoup';
import { WorkerSettings } from 'mediasoup/node/lib/types.js';

export const createWorker = async (workerSettings: WorkerSettings ) => {
    const worker = await mediasoup.createWorker(workerSettings);

    worker.on('died', (error) => {
        console.error('Worker died', error)
        setTimeout(() => process.exit(1), 2000)
    })

    return worker
}