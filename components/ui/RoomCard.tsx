
import Link from "next/link";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import LeaveRoomButton from "../LeaveRoomButton";
import JoinRoomButton from "../JoinRoomButton";

export default function RoomCard({ id, name, memberCount, isJoined }: { id: string, name: string, memberCount: number, isJoined: boolean }) {
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