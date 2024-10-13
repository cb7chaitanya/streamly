import prisma from "@repo/db/client";
import { Response, Request } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { streamSchema, streamUpdateSchema } from "@repo/validator/client";

export const createStream = async (req: AuthRequest, res: Response) => {
    const { title } = req.body;
    const id = req.userId ?? ''

    try {
        const { success } = streamSchema.safeParse(req.body);
        if(!success) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const stream = await prisma.stream.create({
            data: {
                title: title,
                userId: id,
            }
        })
        res.status(200).json({ 
            message: "Stream created successfully",
            success: true,
            streamInfo: stream
        })
        return;
    } catch (error) {
        res.status(500).json({ 
            message: "Error Creating Stream",
            success: false 
        })
        return;
    }
}

export const getStreamsByUser = async (req: Request, res: Response) => {
    const { userId } = req.params

    try {
        const streams = await prisma.stream.findMany({
            where: {
                userId: userId
            }
        })

        if(streams.length === 0){
            res.status(404).json({
                message: "No Streams found",
                success: false
            })
            return;
        }

        res.status(200).json({ 
            message: "Streams retrieved successfully",
            success: true,
            streams: streams
        })
        return;
    } catch(error){
        res.status(500).json({
            message: "Error retrieving Streams",
            success: false
        })
        return;
    }
}

export const getStreamById = async (req: Request, res: Response) => {
    const { streamId } = req.params
    try {
        const stream = await prisma.stream.findUnique({
            where: {
                id: streamId
            }
        })

        if(!stream){
            res.status(404).json({
                message: "Stream not found",
                success: false
            })
            return;
        }

        res.status(200).json({
            message: "Stream retrieved successfully",
            success: true,
            stream: stream
        })
        return;
    } catch (error) {
        res.status(500).json({ 
            message: "Error retrieving Stream",
            success: false
        })
        return;
    }
}

export const streamUpdateStatus = async (req: Request, res: Response) => {
    const { streamId } = req.params
    const { status } = req.body
    try {
        const { success } = streamUpdateSchema.safeParse(req.body);
        
        if(!success) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const stream = await prisma.stream.update({
            where: {
                id: streamId
            },
            data: {
                status: status
            }
        })
        res.status(200).json({ 
            message: "Stream updated successfully",
            success: true,
            streamInfo: stream
        })
        return;
    } catch (error) {
        res.status(500).json({ 
            message: "Error updating Stream",
            success: false 
        })  
        return;
    }
}

export const deleteStream = async (req: Request, res: Response) => {
    const { streamId } = req.params
    try {
        await prisma.stream.delete({
            where: {
                id: streamId
            }
        })
        res.status(200).json({ 
            message: "Stream deleted successfully",
            success: true
        })
        return;
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting Stream",
            success: false
        })
        return;
    }
}

export const getUserStreams = async (req: AuthRequest, res: Response) => {
    const userId = req.userId ?? ''

    try {
        const streams = await prisma.stream.findMany({
            where: {
                userId: userId
            }
        })

        if(streams.length === 0){
            res.status(404).json({
                message: "No Streams found",
                success: false
            })
            return;
        }
        
        res.status(200).json({
            message: "Streams retrieved successfully",
            success: true,
            streams: streams
        })
        return;
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving Streams",
            success: false
        })
        return;
    }
}