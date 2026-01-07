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
import { getCurrentUser } from "@/services/supabase/lib/getCurrentUser";
import { redirect } from "next/navigation";
import RoomCard from "@/components/ui/RoomCard";
import { getJoinedRooms, getPublicRooms } from "@/services/helper/Room.helper";

export default async function Home() {

  const user = await getCurrentUser();

  if (user == null) {
    redirect("/auth/login");
  }
  const [publicRoomsResult, joinedRoomsResult] = await Promise.all([getPublicRooms(), getJoinedRooms(user.id)]);

  // Check for errors
  if ('error' in publicRoomsResult) {
    return <div className="container mx-auto px-4 py-8">Error: {publicRoomsResult.message}</div>;
  }

  if ('error' in joinedRoomsResult) {
    return <div className="container mx-auto px-4 py-8">Error: {joinedRoomsResult.message}</div>;
  }

  const publicRooms = publicRoomsResult;
  const joinedRooms = joinedRoomsResult;

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
