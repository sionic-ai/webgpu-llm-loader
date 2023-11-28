import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { Separator } from "@/components/ui/separator"

import ChatMessage from "@/components/chat/ChatMessage"
import ChatInput from "@/components/chat/ChatInput"
import ChatPlaceholder from "@/components/chat/ChatPlaceholder"
import Footer from "@/components/Footer"
import { useLLM } from "@/context/LLMProvider";

export default function PlaygroundPage() {
    const router = useRouter();
    const { isInitLocalLLM, messages } = useLLM();

    const messageContainer = React.useRef<HTMLDivElement>(null);
    const [scrolling, setScrolling] = React.useState(false);
    const [prevMessageLength, setPrevMessageLength] = React.useState(0);

    // Scroll handling for auto scroll
    useEffect(() => {
        if (!isInitLocalLLM) {
            router.push('/');
        }
        const msgCont = messageContainer.current;
        const handleScroll = () => {
            msgCont && setScrolling(msgCont.scrollTop < msgCont.scrollHeight - msgCont.offsetHeight)
        };

        msgCont && msgCont.addEventListener("scroll", handleScroll);

        return () => {
            msgCont && msgCont.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const msgCont = messageContainer.current;
        const isPlaceholder = messages.length === 0;

        // 메시지 길이의 변화를 저장
        const isChangedMsgLength = messages.length != prevMessageLength;
        isChangedMsgLength && setPrevMessageLength(messages.length);


        if (!isPlaceholder && msgCont) { // Placeholder 제외하고, 메시지 컨테이너가 존재할 때
            if (!scrolling || isChangedMsgLength) { // 현재 스크롤 맨 끝이거나, 메시지 길이 변경 시에만 스크롤을 맨 아래로 이동
                msgCont.scrollTop = msgCont.scrollHeight;
            }
        }
    }, [messages, scrolling]);

    return (
        <div className="h-full flex-col md:flex">
            <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                <h2 className="text-lg font-semibold">Chat</h2>
                <Footer />
            </div>
            <Separator />

            <div className="flex md:h-full max-md:h-[calc(100%-50px)] w-full flex-col items-stretch">
                <div
                    className="relative flex flex-1 flex-col items-stretch overflow-auto pb-[10rem] overflow-x-hidden
                scrollbar scrollbar-w-3 scrollbar-thumb-[rgb(var(--bg-primary))] scrollbar-track-[rgb(var(--bg-secondary))] scrollbar-thumb-rounded-full"
                    ref={messageContainer}
                >
                    {messages.length === 0 ? (
                        <ChatPlaceholder />
                    ) : (
                        <>
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                            <hr className="border-b border-stone-400/20" />

                            <ChatInput className="fixed pb-10 h-40 bg-gradient-to-t from-[rgb(var(--bg-secondary))] to-transparent " />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}