import { createClient } from "@/lib/server";
import { cache } from "react";
import { User } from "@supabase/supabase-js";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();

  return await supabase.auth.getUser().then(({ data }) => data.user);
});
