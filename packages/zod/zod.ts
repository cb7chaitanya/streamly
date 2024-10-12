import * as z from "zod"
import { Readable } from "stream"

export const messageSchema = z.object({
    rtmpUrl: z.string(),
    streamData: z.instanceof(Readable)
})

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
});

export const streamSchema = z.object({
    title: z.string().min(5)
});

export const streamUpdateSchema = z.object({
    status: z.boolean()
})
