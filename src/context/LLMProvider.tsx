import React, { PropsWithChildren, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as Comlink from 'comlink';

import {
    History, clearHistory, getHistory,
    Conversation, storeConversation, updateConversation,
    deleteConversationFromHistory,
} from "@/lib/history";
import { LLMChatMessage, LLMSystemMessage, DEFAULT_SYSTEM_MESSAGE, AddMessageOption } from "@/lib/LLM";
import { LLMType } from "@/lib/LLM";

import WebLLMApi from "@/lib/LLM/worker";
import { sendAnalytics } from "@/lib/utils";

const CHAT_ROUTE = "/";

const defaultContext = {
    activatedLLM: null,
    messages: [] as LLMChatMessage[],
    isInitLocalLLM: false,
    initLocalLLM: async (modelId: string, modelUrl: string, wasmUrl: string, cb: Function) => ({ success: false }),
    unloadLocalLLM: async () => ({ success: false }),
    addMessage: () => { },
    removeMessage: (id: number) => { },
    conversationName: "",
    conversationId: "",
    deleteConversation: () => { },
    updateConversationName: () => { },
    conversations: {} as History,
    clearConversations: () => { },
    clearConversation: () => { },
    loadConversation: (id: string, conversation: Conversation) => { },
    toggleMessageRole: (id: number) => { },
    updateMessageContent: (id: number, content: string) => { },
    loading: true,
    error: "",
};

const LLMContext = React.createContext<{
    activatedLLM: LLMType | null;
    messages: LLMChatMessage[];
    isInitLocalLLM: boolean;
    initLocalLLM: (modelId: string, modelUrl: string, wasmUrl: string, cb: (progress: number, timeElapsed: number, text: string) => void) => Promise<{
        success: boolean;
        message?: string;
    }>;
    unloadLocalLLM: () => Promise<{
        success: boolean;
        message?: string;
    }>;
    addMessage: (addMessageOption: AddMessageOption) => void;
    removeMessage: (id: number) => void;
    conversationName: string;
    conversationId: string;
    deleteConversation: (id: string) => void;
    updateConversationName: (id: string, name: string) => void;
    conversations: History;
    clearConversation: () => void;
    clearConversations: () => void;
    loadConversation: (id: string, conversation: Conversation) => void;
    toggleMessageRole: (id: number) => void;
    updateMessageContent: (id: number, content: string) => void;
    loading: boolean;
    error: string;
}>(defaultContext);

export default function LLMProvider({ children }: PropsWithChildren) {
    const router = useRouter();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    // Conversation state
    const [conversations, setConversations] = React.useState<History>({} as History);
    const [conversationId, setConversationId] = React.useState<string>("");
    const [conversationName, setConversationName] = React.useState("");
    const [messages, setMessages] = React.useState<LLMChatMessage[]>([]);


    const [activatedLLM, setActivatedLLM] = React.useState<LLMType | null>(null);

    // Load LLM Worker
    const [isInitLocalLLM, setIsInitLocalLLM] = React.useState(false);
    const webLLMApi = React.useRef<Comlink.Remote<typeof WebLLMApi>>();


    // Load conversation from local storage
    useEffect(() => {
        if (!webLLMApi.current) {
            const webLLMWorker = new Worker(
                new URL('../lib/LLM/worker.ts', import.meta.url), { type: 'module' }
            );
            webLLMApi.current = Comlink.wrap<typeof WebLLMApi>(webLLMWorker);
        }
        setConversations(getHistory());
    }, []);

    const initLocalLLM = async (modelId: string, modelUrl: string, wasmUrl: string, cb: (progress: number, timeElapsed: number, text: string) => void) => {
        sendAnalytics('init_start_local_llm', { modelUrl, modelId });

        let result = await webLLMApi.current?.init(modelId, modelUrl, wasmUrl, Comlink.proxy(cb));
        result = result || { success: false, message: 'Failed to init local LLM' }

        setIsInitLocalLLM(result.success);
        sendAnalytics('init_finish_local_llm', { modelUrl, modelId });
        return result;
    };
    const unloadLocalLLM = async () => {
        let result = await webLLMApi.current?.unload();
        result = result || { success: false, message: 'Failed to unload local LLM' }

        setIsInitLocalLLM(!result.success);
        return result;
    }


    // Message
    const removeMessage = (id: number) => {
        setMessages((prev) => {
            return [...prev.filter((message) => message.id !== id)];
        });
    };

    const toggleMessageRole = (id: number) => {
        setMessages((prev) => {
            const index = prev.findIndex((message) => message.id === id);
            if (index === -1) return prev;
            const message = prev[index];
            return [
                ...prev.slice(0, index),
                {
                    ...message,
                    role: message.role === "user" ? "assistant" : "user",
                },
                ...prev.slice(index + 1),
            ];
        });
    };

    const updateMessageContent = (id: number, content: string) => {
        setMessages((prev) => {
            const index = prev.findIndex((message) => message.id === id);
            if (index === -1) return prev;
            const message = prev[index];
            return [
                ...prev.slice(0, index),
                { ...message, content },
                ...prev.slice(index + 1),
            ];
        });
    };


    // Conversation
    const handleStoreConversation = useCallback(() => {
        if (messages.length === 0) return;

        const conversation = {
            name: conversationName,
            messages,
            lastMessage: Date.now(),
        } as Conversation;

        let id = storeConversation(conversationId, conversation);
        setConversationId(id);
        setConversations((prev) => ({ ...prev, [id]: conversation }));

        if (router.pathname === CHAT_ROUTE) router.push(`/chat/${id}`);
    }, [messages, conversationId]);

    useEffect(() => {
        handleStoreConversation();
    }, [messages]);

    const loadConversation = (id: string, conversation: Conversation) => {
        setConversationId(id);

        const { messages, name } = conversation;

        setMessages(messages);
        setConversationName(name);
    };

    const clearConversations = useCallback(() => {
        clearHistory();

        setMessages([]);
        setConversationId("");
        setConversations({});

        router.push("/");
    }, []);

    const clearConversation = () => {
        setMessages([]);
        setConversationId("");
    };

    const deleteConversation = (id: string) => {
        deleteConversationFromHistory(id);
        setConversations((prev) => {
            const { [id]: _, ...rest } = prev;
            return rest;
        });

        if (id === conversationId) clearConversation();
    };

    const updateConversationName = (id: string, name: string) => {
        setConversations((prev) => {
            const conversation = prev[id];
            if (!conversation) return prev;
            return {
                ...prev,
                [id]: {
                    ...conversation,
                    name,
                },
            };
        });

        if (id === conversationId) setConversationName(name);

        updateConversation(id, { name });
    };


    // Submit, AddMessage
    const submit = useCallback(async (
        systemMessage: LLMSystemMessage = DEFAULT_SYSTEM_MESSAGE,
        newMessage: LLMChatMessage,
    ) => {
        if (loading) return;
        setLoading(true);

        try {
            // 응답 메시지 생성
            const resMessage = {
                id: messages.length,
                role: "assistant",
                content: "",
            } as LLMChatMessage;

            setMessages((prev) => {
                resMessage.id = prev.length;
                return [...prev, resMessage];
            });

            await webLLMApi.current?.completion([systemMessage, ...messages, newMessage].map(
                ({ role, content }) => ({ role, content })
            ), Comlink.proxy((_step: number, chunkValue: string) => {
                resMessage.content = chunkValue;

                updateMessageContent(resMessage.id as number, resMessage.content);
            }));
        } catch (error: any) {
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        id: prev.length,
                        role: "assistant",
                        content: error.message,
                    },
                ];
            });
        }

        setLoading(false);
    }, [messages, loading, activatedLLM]);


    const addMessage = useCallback(({
        content, systemMessageContent,
        role = "user", isSubmit = true,
    }: AddMessageOption) => {
        const message = { role, content } as LLMChatMessage;

        setMessages((prev) => {
            message.id = prev.length;
            return [...prev, message];
        });

        // 시스템 메시지 직접 던진다.
        isSubmit && submit({
            role: "system",
            content: systemMessageContent,
        }, message);
    }, [submit]);

    const value = React.useMemo(
        () => ({
            activatedLLM,
            messages,
            loading,
            isInitLocalLLM,
            initLocalLLM,
            unloadLocalLLM,
            addMessage,
            removeMessage,
            conversationId,
            conversationName,
            updateConversationName,
            deleteConversation,
            loadConversation,
            clearConversation,
            conversations,
            clearConversations,
            toggleMessageRole,
            updateMessageContent,
            error,
        }),
        [
            activatedLLM,
            isInitLocalLLM,
            messages,
            loading,
            addMessage,
            conversationId,
            conversations,
            clearConversations,
            error,
        ]
    );

    return (
        <LLMContext.Provider value={value}> {children} </LLMContext.Provider>
    );
}

export const useLLM = () => React.useContext(LLMContext);
