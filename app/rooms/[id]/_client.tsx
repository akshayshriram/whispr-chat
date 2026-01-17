"use client"

import { Message } from "@/services/supabase/actions/messages";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import { useState } from "react";
import { InviteUserModal } from "@/components/InviteUserModal";
import { Button } from "@/components/ui/button";
import { useRealtimeChat } from "@/services/supabase/hooks/useRealtimeChat";
import useInfiniteScrollChat from "@/services/supabase/hooks/useInfiniteScrollChat";

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


    const { loadMoreMessages, messages: oldMessages, status: infiniteScrollStatus, triggerQueryRef } = useInfiniteScrollChat({
        roomId: room.id,
        startingMessages: messages.toReversed()
    })

    const { connectedUsers, messages: realtimeMessages } = useRealtimeChat({ roomId: room.id, userId: user.id })
    const [sentMessages, setSentMessages] = useState<(Message & { status: "pending" | "error" | "success" })[]>([])

    // Deduplicate messages by ID, prioritizing in order: sentMessages > realtimeMessages > oldMessages
    const messageMap = new Map<string, Message>()

    // Add oldMessages first (base messages)
    oldMessages.forEach(msg => messageMap.set(msg.id, msg))

    // Overwrite with realtimeMessages (more recent)
    realtimeMessages.forEach(msg => messageMap.set(msg.id, msg))

    // Overwrite with sentMessages (they have status info)
    sentMessages.forEach(msg => messageMap.set(msg.id, msg))

    const visibleMessages = Array.from(messageMap.values())

    return (
        <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
            <div className="flex items-center justify-between gap-2 p-4">
                <div className=" border-b">
                    <h1 className="text-2xl font-bold">{room?.name}</h1>
                    {/* Need to add Real-time functionality */}
                    <p className="text-sm text-muted-foreground">{connectedUsers} {connectedUsers === 1 ? "user" : "users"} online</p>
                    <p className="text-sm text-muted-foreground">{messages?.length}</p>
                </div>
                <InviteUserModal roomId={room?.id} />

            </div>
            <div className="grow overflow-y-auto flex flex-col-reverse"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "var(--border) transparent",
                }}>
                <div>
                    {infiniteScrollStatus === "loading" && (
                        <p className="text-center text-sm text-muted-foreground py-2">
                            Loading more messages...
                        </p>
                    )}
                    {infiniteScrollStatus === "error" && (
                        <div className="text-center">
                            <p className="text-sm text-destructive py-2">
                                Error loading messages.
                            </p>
                            <Button onClick={loadMoreMessages} variant={"outline"}>Retry</Button>
                        </div>
                    )}

                    {visibleMessages.map((message, index) => {
                        const sentMessage = sentMessages.find(m => m.id === message.id);
                        return (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                status={sentMessage?.status}
                                ref={index === 0 && infiniteScrollStatus === "idle" ? triggerQueryRef : null}
                            />
                        );
                    })}
                </div>
            </div>
            <ChatInput
                roomId={room?.id}
                onSend={message => {
                    setSentMessages(prev => [
                        ...prev, {
                            id: message.id,
                            text: message.text,
                            created_at: new Date().toISOString(),
                            author_id: user.id,
                            author: {
                                name: user.name,
                                image_url: user.image_url
                            },
                            status: "pending"
                        },
                    ])
                }}
                onSuccessSend={message => {
                    setSentMessages(prev =>
                        prev.map(m =>
                            m.id === message.id ? { ...message, status: "success" } : m
                        )
                    )
                }}
                onErrorSend={id => {
                    setSentMessages(prev =>
                        prev.map(m =>
                            m.id === id ? { ...m, status: "error" } : m
                        )
                    )
                }}
            />
        </div>
    )
}