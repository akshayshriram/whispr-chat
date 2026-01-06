"use client";

import React, { ComponentProps } from "react";
import { ActionButton } from "./ui/action-button";
import { useCurrentuser } from "@/services/supabase/hooks/useCurrentuser";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

const JoinRoomButton = ({
    children,
    roomId,
    ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & {
    roomId: string;
}) => {
    const { user } = useCurrentuser();
    const router = useRouter();
    async function joinRoom() {
        if (user === null) {
            return { error: true, message: "You must be logged in to join a room" };
        }
        const supabase = createClient();
        const { error } = await supabase.from("chat_room_member").insert({
            chat_room_id: roomId,
            member_id: user.id,
        });
        if (error) {
            return { error: true, message: error.message };
        }
        router.refresh();
        router.push(`/rooms/${roomId}`);
        return { error: false, message: "Room joined successfully" };
    }
    return <ActionButton {...props} action={joinRoom}>{children}</ActionButton>;
};

export default JoinRoomButton;
