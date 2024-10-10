import { Readable } from "stream"

export interface Message {
    rtmpUrl: string,
    streamData: Readable
}