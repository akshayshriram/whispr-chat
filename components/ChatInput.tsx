import React, { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from './ui/input-group'
import { SendIcon } from 'lucide-react'
import { toast } from 'sonner'
import { sendMessage } from '@/services/supabase/actions/messages'

const ChatInput = ({ roomId }: { roomId: string }) => {
    const [message, setMessage] = useState('')


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const text = message.trim();
        if (!text) return;
        
        setMessage('');
        const result = await sendMessage({ text, roomId: roomId });
        if (result.error) {
            toast.error(result.message);
            return;
        } else {
            toast.success(`Message sent: ${result.message.text}`);
            setMessage('');
        }


    }

    return (
        <form onSubmit={handleSubmit}>
            <InputGroup>
                <InputGroupTextarea
                    className='field-sizing-content min-h-auto'
                    placeholder='Type your message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                        }
                    }}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        type="submit"
                        aria-label='Send'
                        title='Send'
                        size="icon-sm">
                        <SendIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </form>
    )
}

export default ChatInput