import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createAdminClient } from "@/lib/server";
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LeaveRoomButton from "@/components/LeaveRoomButton";
import JoinRoomButton from "@/components/JoinRoomButton";

export default async function Home() {

  const user = await getCurrentUser();

  if (user == null) {
    redirect("/auth/login");
  }
  const [publicRooms, joinedRooms] = await Promise.all([getPublicRooms(), getJoinedRooms(user.id)]);

  // Check for errors
  if ('error' in publicRooms || 'error' in joinedRooms) {
    const error = ('error' in publicRooms ? publicRooms : joinedRooms) as { error: boolean; message: string };
    return <div className="container mx-auto px-4 py-8">Error: {error.message}</div>;
  }

  if (publicRooms.length === 0 && joinedRooms.length === 0) {
    return (
      <>
        <div className="container mx-auto max-w-3xl px-4 py-0 space-y-8">
          <Empty className="border border-dashed">
            <EmptyMedia variant={"icon"}>
              <MessageSquareIcon />
            </EmptyMedia>
            <EmptyTitle>No Chat Rooms Found</EmptyTitle>
            <EmptyDescription>
              Create a chat room to get started.
            </EmptyDescription>
            <EmptyContent>
              <Button asChild>
                <Link href="/rooms/new">Create Room</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <RoomList title="Your Rooms" rooms={joinedRooms} isJoined />
      <RoomList
        title="Public Rooms"
        rooms={publicRooms.filter(room => !joinedRooms.some(r => r.id === room.id))}
        isJoined={false} />
    </div>
  );

}

export function RoomList({ title, rooms, isJoined }: { title: string, rooms: { id: string, name: string, memberCount: number }[], isJoined: boolean }) {
  if (rooms.length === 0) return null;

  return <>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button asChild>
          <Link href={`/rooms/new`}>
            Create Room
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {rooms.map(room => {
          return <RoomCard {...room} isJoined={isJoined} key={room.id} />
        })}
      </div>

    </div>
  </>

}

export function RoomCard({ id, name, memberCount, isJoined }: { id: string, name: string, memberCount: number, isJoined: boolean }) {
  return <Card>
    <CardHeader>
      <CardTitle>{name}</CardTitle>
      <CardDescription>{memberCount} {memberCount === 1 ? "member" : "members"}</CardDescription>
    </CardHeader>
    <CardContent className="flex gap-2">
      {isJoined ? (
        <>
          <Button
            asChild
            className="grow" size={"sm"}>
            <Link href={`/rooms/${id}`}>Enter</Link>
          </Button>
          <LeaveRoomButton roomId={id} size="sm" variant="destructive" >Leave</LeaveRoomButton>
        </>
      ) : (
        <JoinRoomButton className="" roomId={id} size="sm" variant="outline" >Join</JoinRoomButton>
      )}
    </CardContent>
  </Card>
}

export async function getPublicRooms() {
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
    memberCount: room.chat_room_member[0].count,
  }));
}

export async function getJoinedRooms(userId: string) {

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member (member_id)")
    .order("name", { ascending: true })

  if (error || data == null) {
    return { error: true, message: error?.message ?? "Failed to get public rooms" };
  }

  return data
    .filter((room) => room.chat_room_member.some((member) => member.member_id === userId))
    .map((room) => ({
      id: room.id,
      name: room.name,
      memberCount: room.chat_room_member.length,
    }));
}

