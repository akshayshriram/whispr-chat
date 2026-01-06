"use client";

import React, { ComponentProps } from "react";
import { ActionButton } from "./ui/action-button";
import { useCurrentuser } from "@/services/supabase/hooks/useCurrentuser";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

const LeaveRoomButton = ({
    children,
    roomId,
    ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & {
    roomId: string;
}) => {
    const { user } = useCurrentuser();
    const router = useRouter();
    async function leaveRoom() {
        if (user === null) {
            return { error: true, message: "You must be logged in to leave a room" };
        }
        const supabase = createClient();
        const { error } = await supabase
            .from("chat_room_member")
            .delete()
            .eq("chat_room_id", roomId)
            .eq("member_id", user.id);

        if (error) {
            return { error: true, message: error.message };
        }
        router.refresh();

        return { error: false, message: "Room left successfully" };
    }
    return <ActionButton {...props} action={leaveRoom}>{children}</ActionButton>;
};

export default LeaveRoomButton;
