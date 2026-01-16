import React from 'react'
import { Message as Messagetype } from '@/services/supabase/actions/messages'
import Image from 'next/image'
import { User2Icon } from 'lucide-react'

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
});

const ChatMessage = ({ message }: { message: Messagetype }) => {

    const { text, author, created_at, author_id } = message;

    return (
        <div className="flex gap-4 px-4 py-2 hover:bg-accent/50">
            <div className="shrink-0">
                {author?.image_url != null ?
                    <Image src={author.image_url} alt={author.name} width={40} height={40} className="rounded-full" />
                    : (<div className='size-[40px rounded-full flex items-center justify-center border bg-muted text-muted-foreground overflow-hidden' >
                        <User2Icon className='size-[30px]' />
                    </div>)
                }
            </div>
            <div className="grow space-y-0.5">
                <div className="flex items-baseline gap-2">
                    <span className='text-sm font-semibold'>{author?.name}</span>
                    <span className='text-sm text-muted-foreground' >{DATE_FORMATTER.format(new Date(created_at))}</span>
                </div>
                <p className='text-sm wrap-break-words whitespace-pre'>{text}</p>
            </div>
        </div>

    )

}

export default ChatMessage