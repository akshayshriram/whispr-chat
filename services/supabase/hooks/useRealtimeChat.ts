import { useEffect, useState } from "react";
import { Message } from "../actions/messages";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/client";

function useRealtimeChat({ roomId, userId }: { roomId: string, userId: string }) {
    // const [channel, setChannel] = useState<RealtimeChannel>()
    const [connectedUsers, setConnectedUsers] = useState<number>(1)
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        const supabase = createClient();
        let newChannel: RealtimeChannel | null = null
        let cancel = false

        supabase.realtime.setAuth().then(() => {
            if (cancel) return

            newChannel = supabase.channel(`room:${roomId}:messages`, {
                config: {
                    private: true,
                    presence: {
                        key: userId,
                    }
                }
            })
            newChannel
                .on("presence", { event: "sync" }, () => {
                    if (newChannel) {
                        setConnectedUsers(Object.keys(newChannel.presenceState()).length)
                    }
                })
                .on("broadcast", { event: "message_created" }, (payload: { payload: { id: string; text: string; created_at: string; author_id: string; author_name: string; author_image_url: string } }) => {
                    const record = payload.payload
                    setMessages((prevMessages) => [...prevMessages, {
                        id: record.id,
                        text: record.text,
                        created_at: record.created_at,
                        author_id: record.author_id,
                        author: {
                            name: record.author_name,
                            image_url: record.author_image_url
                        }
                    }])
                })
                .subscribe((status: string) => {
                    if (status !== "SUBSCRIBED" || !newChannel) return;

                    newChannel.track({ userId })
                })
        })

        return () => {
            cancel = true
            if (!newChannel) return
            newChannel.untrack();
            newChannel.unsubscribe();
        }
    }, [roomId, userId])

    return { connectedUsers, messages }
}

export { useRealtimeChat }