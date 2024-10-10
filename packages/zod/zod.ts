import * as z from "zod"
import { Readable } from "stream"

export const messageSchema = z.object({
    rtmpUrl: z.string(),
    streamData: z.instanceof(Readable)
})