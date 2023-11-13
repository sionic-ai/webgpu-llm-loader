import { LLMSystemMessage } from "./LLM.types";

export enum LLMType {
    HYPERCLOVA = "hyperclova",
    OPENAI = "openai",
    LOCAL = "local",
}

export const DEFAULT_SYSTEM_MESSAGE: LLMSystemMessage = {
    role: "system",
    content: "You are a helpful AI chatbot.",
};