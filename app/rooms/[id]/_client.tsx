"use client"

import { Message } from "@/services/supabase/actions/messages";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

type ChatRoom = {
    id: string;
    name: string;
}

type UserProfile = {
    id: string;
    name: string;
    image_url: string;
}


export function RoomClient({ room, user, messages }: { room: ChatRoom, user: UserProfile, messages: Message[] }) {

    const { connectedUsers } = useRealtimeChat({ roomId: room.id, userId: user.id })

    return (
        <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
            <div className="flex items-center justify-between gap-2">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">{room?.name}</h1>
                    {/* Need to add Real-time functionality */}
                    <p className="text-sm text-muted-foreground">{connectedUsers} {connectedUsers === 1 ? "user" : "users"} online</p>
                    <p className="text-sm text-muted-foreground">{messages?.length}</p>
                </div>

                {/* <InviteuserModal roomId={room?.id} /> */}
            </div>
            <div className="grow overflow-y-auto flex flex-col-reverse"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "var(--border) transparent",
                }}>
                <div>
                    {messages.toReversed().map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                </div>
            </div>
            <ChatInput roomId={room?.id} />
        </div>
    )
}

function InviteUserModal({ roomId }: { roomId: string }) {
    return (
        <div>
            <h1>Invite User</h1>
        </div>
    )
}

function useRealtimeChat({ roomId, userId }: { roomId: string, userId: string }) {
    // const [channel, setChannel] = useState<RealtimeChannel>()
    const [connectedUsers, setConnectedUsers] = useState<number>(1)
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        const supabase = createClient();
        const newChannel = supabase.channel(`room:${roomId}:messages`, {
            config: {
                private: true,
                presence: {
                    key: userId,

                }
            }
        })
        newChannel
            .on("presence", { event: "sync" }, () => {
                setConnectedUsers(Object.keys(newChannel.presenceState()).length)
            })
            .subscribe(status => {
                if (status !== "SUBSCRIBED") return;

                newChannel.track({ userId })
            })

        return () => {
            newChannel.untrack();
            newChannel.unsubscribe();
        }
    }, [roomId, userId])

    return { connectedUsers, messages }
}