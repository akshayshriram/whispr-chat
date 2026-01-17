import { Message } from "@/services/supabase/actions/messages"
import { createClient } from "@/lib/client";
import { useState } from "react"

const LIMIT = 25

function useInfiniteScrollChat({
    startingMessages,
    roomId
}: {
    startingMessages: Message[],
    roomId: string
}) {
    const [messages, setMessages] = useState<Message[]>(startingMessages)

    const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(startingMessages.length === 0 ? "done" : "idle")

    async function loadMoreMessages() {
        if (status === "done" || status === "loading") return

        const supabase = await createClient()
        setStatus("loading")

        await new Promise(resolve => setTimeout(resolve, 2000)) //Aritifical delay

        const { data, error } = await supabase
            .from("message")
            .select("id, text, created_at, author_id, author:user_profile (name, image_url)")
            .eq("chat_room_id", roomId)
            .lt("created_at", messages[0].created_at)
            .order("created_at", { ascending: false })
            .limit(LIMIT)

        if (error) {
            setStatus("error")
            return
        }
        const mappedData = data.map((message) => ({
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            author_id: message.author_id,
            author: {
                name: message.author.name,
                image_url: message.author.image_url ?? "",
            },
        }))
        setMessages(prev => [...mappedData.toReversed(), ...prev])
        setStatus(data.length < LIMIT ? "done" : "idle")
    }

    function triggerQueryRef(node: HTMLDivElement | null) {
        if (node == null) return
        const observer = new IntersectionObserver(enteries => {
            enteries.forEach(entry => {
                if (entry.isIntersecting && entry.target === node) {
                    observer.unobserve(node)
                    loadMoreMessages()
                }
            })
        }, {
            rootMargin: "50px",
        })

        observer.observe(node)

        return () => {
            observer.disconnect()
        }
    }

    return { loadMoreMessages, messages, status, triggerQueryRef }
}

export default useInfiniteScrollChat