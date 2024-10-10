import * as z from "zod";

export const streamSchema = z.object({
    title: z.string().min(5)
});

export const streamUpdateSchema = z.object({
    status: z.boolean()
})

