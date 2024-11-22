import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { RTC_BACKEND_URL } from "../config/config";
import { SFUMessageType } from "@repo/common/client"

export const useSFUSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const user = useUser()

    useEffect(() => {
        if(!user) {
            return;
        }

        const ws = new WebSocket(`${RTC_BACKEND_URL}?token=${user.token}`);
        ws.onopen = async () => {
            try {
                const cameraPermission = await navigator.permissions.query({
                    name: 'camera' as PermissionName
                })
                const microphonePermission = await navigator.permissions.query({
                    name: 'microphone' as PermissionName
                })
                if(cameraPermission.state === 'denied' && microphonePermission.state === 'denied') {
                    console.error('Camera and microphone permissions are denied');
                    return;
                }

                const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                setLocalStream(mediaStream);
                ws.send(
                    JSON.stringify({
                        type: SFUMessageType.JOIN_ROOM,
                        payload: {
                            roomId: '1'
                        }
                    })
                )
            } catch(error){
                console.error("Error getting user media", error);
                ws.close();
                return;
            }
            setSocket(ws);
        }

        ws.onclose = () => {
            setSocket(null);
        }

        ws.onerror = (error) => {
            console.error("Websocket error", error);
        }

        return () => {
            ws.close();
        }
    }, [user])

    return { socket, localStream }
}