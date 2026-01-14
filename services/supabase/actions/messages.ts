"use server";

import { createAdminClient } from "@/lib/server";
import { getCurrentUser } from "../lib/getCurrentUser";

export type Message = {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author: {
    name: string;
    image_url: string;
  };
};

async function sendMessage({
  text,
  roomId,
}: {
  text: string;
  roomId: string;
}): Promise<
  { error: false; message: Message } | { error: true; message: string }
> {
  const user = await getCurrentUser();
  if (user == null) {
    return { error: true, message: "You must be logged in to send a message" };
  }

  if (text.trim() === "") {
    return { error: true, message: "Message cannot be empty" };
  }

  const supabase = await createAdminClient();

  const { data: membership, error: membershipError } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", roomId)
    .eq("member_id", user.id)
    .single();

  if (membershipError || membership == null) {
    return {
      error: true,
      message: membershipError?.message ?? "You are not a member of this room",
    };
  }

  const { data: message, error } = await supabase
    .from("message")
    .insert({
      text: text.trim(),
      chat_room_id: roomId,
      author_id: user.id,
    })
    .select(
      "id, text, created_at, author_id, author:user_profile (name, image_url)"
    )
    .single();

  if (error) {
    return { error: true, message: error.message ?? "Failed to send message" };
  }
  return { error: false, message: message as unknown as Message };
}

export { sendMessage };
