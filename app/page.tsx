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

export default function Home() {
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
