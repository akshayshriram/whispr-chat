import { createAdminClient } from "@/lib/server";

type RoomResult = { id: string; name: string; memberCount: number };
type ErrorResult = { error: true; message: string };

export async function getPublicRooms(): Promise<RoomResult[] | ErrorResult> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from("chat_room")
        .select("id, name, chat_room_member (count)")
        .eq("is_public", true)
        .order("name", { ascending: true })

    if (error || data == null) {
        return { error: true, message: error?.message ?? "Failed to get public rooms" };
    }

    return data.map((room) => ({
        id: room.id,
        name: room.name,
        memberCount: room.chat_room_member[0]?.count ?? 0,
    }));
}

export async function getJoinedRooms(userId: string): Promise<RoomResult[] | ErrorResult> {

    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from("chat_room")
        .select("id, name, chat_room_member (member_id)")
        .order("name", { ascending: true })

    if (error || data == null) {
        return { error: true, message: error?.message ?? "Failed to get joined rooms" };
    }

    return data
        .filter((room) => room.chat_room_member.some((member) => member.member_id === userId))
        .map((room) => ({
            id: room.id,
            name: room.name,
            memberCount: room.chat_room_member.length,
        }));
}