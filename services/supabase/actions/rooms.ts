"use server";

import { createAdminClient } from "@/lib/server";
import { getCurrentUser } from "../lib/getCurrentUser";
import { createRoomSchema } from "../schemas/rooms";
import z from "zod";
import { redirect } from "next/navigation";

export async function createRoom(unsafeData: z.infer<typeof createRoomSchema>) {
  const { success, data } = createRoomSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true, message: "Invalid data" };
  }

  const user = await getCurrentUser();

  if (user == null) {
    return { error: true, message: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  const { data: room, error: roomError } = await supabase
    .from("chat_room")
    .insert({
      name: data.name,
      is_public: data.isPublic,
    })
    .select("id")
    .single();

  if (roomError || room == null) {
    return {
      error: true,
      message: roomError?.message ?? "Failed to create room",
    };
  }

  const { error: membershipError } = await supabase
    .from("chat_room_member")
    .insert({
      chat_room_id: room.id,
      member_id: user.id,
    });

  if (membershipError) {
    return {
      error: true,
      message: membershipError?.message ?? "Failed to add user to room",
    };
  }

  redirect(`/rooms/${room.id}`);
}

export async function addUserToRoom({roomId, userId}: {roomId: string, userId: string}){

  const currentUser = await getCurrentUser();
  if(currentUser == null) {
    return {error: true, message:"User Not Authenticated..."}
  }

  const supabase = await createAdminClient()

  const {data: roomMembership, error: roomMembershipError} = await supabase
  .from("chat_room_member")
  .select("member_id")
  .eq("chat_room_id", roomId)
  .eq("member_id", currentUser.id)
  .single()

  if(roomMembershipError || !roomMembership ){
    return {error: true, message: "Current user is not a member of the room"}
  }

  const {data: userProfie} = await supabase
  .from("user_profile")
  .select("id")
  .eq("id", userId)
  .single()

  if(userProfie == null){
    return {error: true, message: "User Not Found"}
  }

  const {data: existingMembership} = await supabase
  .from("chat_room_member")
  .select("member_id")
  .eq("chat_room_id", roomId)
  .eq("member_id", userProfie.id)
  .single()

  if(existingMembership) {
    return {error: false, message: "User is already a member of the room"}
  }

  const {error: insertError} = await supabase
  .from("chat_room_member")
  .insert({chat_room_id: roomId, member_id: userProfie.id})

  if(insertError) {
    return { error: true, message: "Failed to add user to room"}
  }

  return {error: false, message: "User Added to room successfully"}

}
