import React from "react";
import { SendHorizontal } from "lucide-react"

import { useLLM } from "@/context/LLMProvider";
import {sendAnalytics} from "@/lib/utils";

type Props = {
    className?: string;
};

export default function ChatInput({ className }: Props) {
    const { loading, addMessage } = useLLM();
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

    const [input, setInput] = React.useState("");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (loading) return;
        e.preventDefault();
        
        addMessage({ // 메시지 발송
            content: input,
            systemMessageContent: 'You play a friendly chatbot.',
        });

        sendAnalytics('send_query');
        setInput("");
    };

    React.useEffect(() => {
        const resize = () => {
            if (textAreaRef.current) {
                textAreaRef.current.style.height = "40px";
                textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
            }
        };

        resize();
    }, [input]);

    // Handle submitting with enter
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey && e.isComposing === false) {
                e.preventDefault();
                handleSubmit(e as any);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleSubmit]);

    return (
        <div className={`${className} bottom-0 flex w-full`}>
            <form
                className="mx-auto flex h-full w-full max-w-4xl items-end justify-center p-4"
                onSubmit={handleSubmit}
            >
                <div className="relative flex w-full flex-row rounded border border-stone-500/20 bg-tertiary shadow-xl">
                    <textarea
                        ref={textAreaRef}
                        className="max-h-[200px] w-full resize-none border-none p-4 text-primary outline-none"
                        onChange={handleChange}
                        value={input}
                        rows={1}
                    />
                    <button
                        type="submit"
                        className="rounded p-4 text-black bg-storm hover:bg-storm/50"
                    >
                        {loading ? (
                            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                        ) : (
                            <SendHorizontal />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
