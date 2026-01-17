"use client"

import { Message } from "@/services/supabase/actions/messages";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { InviteUserModal } from "@/components/InviteUserModal";
import { Button } from "@/components/ui/button";
import { resolve } from "path";

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


    const { loadMoreMessages, messages: oldMessages, status, triggerQueryRef } = useInfiniteScrollChat({
        roomId: room.id,
        startingMessages: messages.toReversed()
    })

    const { connectedUsers, messages: realtimeMessages } = useRealtimeChat({ roomId: room.id, userId: user.id })
    const [sentMessages, setSentMessages] = useState<(Message & { status: "pending" | "error" | "success" })[]>([])

    const visibleMessages = oldMessages.concat(realtimeMessages, sentMessages.filter(m => !realtimeMessages.find(rm => rm.id === m.id)))

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
                    {status === "loading" && (
                        <p className="text-center text-sm text-muted-foreground py-2">
                            Loading more messages...
                        </p>
                    )}
                    {status === "error" && (
                        <div className="text-center">
                            <p className="text-sm text-destructive py-2">
                                Error loading messages.
                            </p>
                            <Button onClick={loadMoreMessages} variant={"outline"}>Retry</Button>
                        </div>
                    )}

                    {visibleMessages.map((message, index) => (
                        <ChatMessage key={message.id} message={message} ref={index === 0 && status === "idle" ? triggerQueryRef : null} />
                    ))}
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

const LIMIT = 25

function useInfiniteScrollChat({
    startingMessages,
    roomId
}: {
    startingMessages: Message[],
    roomId: string
}) {
    const [messages, setMessages] = useState<Message[]>(startingMessages)

    const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(startingMessages.length === 0 ? "done" : "idle")

    async function loadMoreMessages() {
        if (status === "done" || status === "loading") return

        const supabase = await createClient()
        setStatus("loading")

        await new Promise(resolve => setTimeout(resolve, 2000)) //Aritifical delay

        const { data, error } = await supabase
            .from("message")
            .select("id, text, created_at, author_id, author:user_profile (name, image_url)")
            .eq("chat_room_id", roomId)
            .lt("created_at", messages[0].created_at)
            .order("created_at", { ascending: false })
            .limit(LIMIT)

        if (error) {
            setStatus("error")
            return
        }
        const mappedData = data.map((message) => ({
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            author_id: message.author_id,
            author: {
                name: message.author.name,
                image_url: message.author.image_url ?? "",
            },
        }))
        setMessages(prev => [...mappedData.toReversed(), ...prev])
        setStatus(data.length < LIMIT ? "done" : "idle")
    }

    function triggerQueryRef(node: HTMLDivElement | null) {
        if (node == null) return
        const observer = new IntersectionObserver(enteries => {
            enteries.forEach(entry => {
                if (entry.isIntersecting && entry.target === node) {
                    observer.unobserve(node)
                    loadMoreMessages()
                }
            })
        }, {
            rootMargin: "50px",
        })

        observer.observe(node)

        return () => {
            observer.disconnect()
        }
    }

    return { loadMoreMessages, messages, status, triggerQueryRef }
}