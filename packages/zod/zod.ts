import * as z from "zod"
import { Readable } from "stream"

export const messageSchema = z.object({
    rtmpUrl: z.string(),
    streamData: z.instanceof(Readable)
})

export type Message = z.infer<typeof messageSchema>

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export type SignIn = z.infer<typeof signinSchema>

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
});

export type SignUp = z.infer<typeof signupSchema>

export const streamSchema = z.object({
    title: z.string().min(5)
});

export type Stream = z.infer<typeof streamSchema>

export const streamUpdateSchema = z.object({
    status: z.boolean()
})

export type StreamUpdate = z.infer<typeof streamUpdateSchema>