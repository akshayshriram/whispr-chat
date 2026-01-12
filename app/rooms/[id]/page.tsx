import { getCurrentUser } from '@/services/supabase/lib/getCurrentUser';
import React from 'react'
import { createAdminClient } from '@/lib/server';
import { RoomClient } from './_client';

const RoomPageById = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    const [room, user, messages] = await Promise.all([getRoomById(id), getUser(), getMessages(id)]);

    if (!room || !user || !messages) return null;

    return (
        <RoomClient room={room} user={user} messages={messages} />
    )
}

export default RoomPageById;


async function getRoomById(id: string) {
    const user = await getCurrentUser();

    if (!user) return null;

    const supabase = await createAdminClient();
    const { data: room, error } = await supabase
        .from("chat_room")
        .select("id, name, chat_room_member!inner ()")
        .eq("id", id)
        .eq("chat_room_member.member_id", user.id)
        .single();

    if (error) return null;

    return room;
}

async function getUser() {
    const user = await getCurrentUser();
    const supabase = await createAdminClient();
    if (!user) return null;

    const { data, error } = await supabase
        .from("user_profile")
        .select("id, name, image_url")
        .eq("id", user.id)
        .single();

    if (error) return null;

    return {
        id: data.id,
        name: data.name,
        image_url: data.image_url ?? "",
    };

}

async function getMessages(roomId: string) {
    const user = await getCurrentUser();
    const supabase = await createAdminClient();
    if (!user) return null;

    const { data, error } = await supabase
        .from("message")
        .select("id, text, created_at, author_id, author:user_profile (name, image_url)")
        .eq("chat_room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);

    if (error) return [];

    return data.map((message) => ({
        id: message.id,
        text: message.text,
        created_at: message.created_at,
        author_id: message.author_id,
        author: {
            name: message.author.name,
            image_url: message.author.image_url ?? "",
        },
    }));
}