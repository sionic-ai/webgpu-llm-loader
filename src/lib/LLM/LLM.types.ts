
export interface LLMChatMessage {
  id?: number;
  role: "system" | "assistant" | "user";
  content: string;
}

export interface LLMSystemMessage {
  role: "system";
  content: string;
}

export interface AddMessageOption {
    content: string;
    systemMessageContent: string;
    ragResult: string[];
    role?: "user" | "assistant";
    isSubmit?: boolean;
}

export type LLMRequest = {
    ragResult: string[];
    messages: LLMChatMessage[];
};