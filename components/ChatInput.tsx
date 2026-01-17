import React, { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from './ui/input-group'
import { SendIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Message, sendMessage } from '@/services/supabase/actions/messages'

type props = {
    roomId: string
    onSend: (message: { id: string; text: string }) => void
    onSuccessSend: (message: Message) => void
    onErrorSend: (id: string) => void
}

const ChatInput = ({ roomId, onSend, onSuccessSend, onErrorSend }: props) => {
    const [message, setMessage] = useState('')


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const text = message.trim();
        if (!text) return;

        setMessage('');
        const id = crypto.randomUUID()
        onSend({ id, text })
        const result = await sendMessage({ id, text, roomId });
        if (result.error) {
            toast.error(result.message);
            onErrorSend(id)
            return;
        } else {
            // toast.success(`Message sent: ${result.message.text}`);
            onSuccessSend(result.message)
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