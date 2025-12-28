"use client";

import { useCurrentuser } from "@/services/supabase/hooks/useCurrentuser";
import Link from "next/link";
import { Button } from "./button";
import { LogoutButton } from "@/services/supabase/components/logout-button";
import Image from "next/image";

export default function Navbar() {
  const { user, isLoading } = useCurrentuser();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="border-b bg-background h-header">
      <nav className="container mx-auto px-4 flex justify-between items-center h-full gap-4">
        <Link href="/" className="text-xl font-bold ">
          {/* <Image src="/logo.svg" alt="Whispr" width={100} height={100} /> */}
          Whispr Chat
        </Link>
        {isLoading || user == null ? (
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Image
              src={user.user_metadata?.avatar_url || ""}
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.full_name || user.email}
            </span>
            <Button asChild>
              <LogoutButton />
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
}
