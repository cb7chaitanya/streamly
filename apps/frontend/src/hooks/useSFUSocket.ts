import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { RTC_BACKEND_URL } from "../config/config";
import { SFUMessageType } from "@repo/common/client";

export const useSFUSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const user = useUser();

    useEffect(() => {
        if (!user) return;

        const ws = new WebSocket(`${RTC_BACKEND_URL}?token=${user.token}`);
        
        ws.onopen = async () => {
            console.log("WebSocket connection opened.");

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                setLocalStream(mediaStream);
            } catch (error) {
                console.error(`Error getting local stream: ${error}`);
                ws.close();
                return;
            }

            ws.send(
                JSON.stringify({
                    type: SFUMessageType.JOIN_ROOM,
                    payload: {
                        roomId: '1',
                    },
                })
            );

            setSocket(ws);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed.");
            setSocket(null);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            console.log("Cleaning up WebSocket.");
            ws.close();
        };
    }, [user]);

    return { socket, localStream };
};