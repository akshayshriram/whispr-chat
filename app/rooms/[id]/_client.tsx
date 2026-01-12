"use client"

import { Message } from "@/services/supabase/actions/messages";

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
    return (
        <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
            <div className="flex items-center justify-between gap-2">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">{room?.name}</h1>
                    {/* Need to add Real-time functionality */}
                    <p className="text-sm text-muted-foreground">0 users online</p>
                    <p className="text-sm text-muted-foreground">{messages?.length}</p>
                </div>

                {/* <InviteuserModal roomId={room?.id} /> */}
            </div>
            <div className="grow overflow-y-auto flex flex-col-reverse">
                <div>
                    {messages.map((message) => (
                        <ChatMessage key={message.id} {...message} />
                    ))}
                </div>
            </div>
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

function ChatMessage({ id, text, created_at, author_id, author }: Message) {
    return (
        <div>
            <p>{text}</p>
            <p>{created_at}</p>
            <p>{author_id}</p>
            <p>{author.name}</p>
            <p>{author.image_url}</p>
        </div>
    )
}