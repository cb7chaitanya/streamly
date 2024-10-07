import * as z from "zod";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
});

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export { signupSchema,signinSchema }