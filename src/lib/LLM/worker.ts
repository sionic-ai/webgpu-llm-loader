import * as Comlink from 'comlink';
import * as webllm from "@mlc-ai/web-llm";

import { LLMChatMessage } from "./LLM.types";

// Use the Singleton pattern to enable lazy construction of the engine.
class LLMSingleton {
    static instance: (webllm.ChatModule | null) = null;

    static async getInstance(modelConfig?: webllm.AppConfig, progressCallback?: Function) {
        if (this.instance !== null) {
            return this.instance;
        } else if (!modelConfig) {
            throw new Error('modelUrl and modelLibMap must be provided');
        }

        const chat = new webllm.ChatModule();

        let prevProgress = 0;
        chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
            const progress = Math.round(report.progress * 100);
            if (progress > prevProgress) {
                progressCallback && progressCallback(progress, report.timeElapsed, report.text);
            }
        });

        const modelId = modelConfig.model_list[0].local_id;
        await chat.reload(modelId, undefined, modelConfig);

        this.instance = chat;
        return chat;
    }

    static makeModelConfig = (modelId: string, modelUrl: string, wasmUrl: string): webllm.AppConfig => {
        let config = {
            'model_list': [{
                'model_url': modelUrl,
                'local_id': modelId,
            }],
            'model_lib_map': {}
        };
        (config.model_lib_map as Record<string, string>)[modelId] = wasmUrl;
        
        return config;
    }

    static async init(modelId: string, modelUrl: string, wasmUrl: string, progressCallback?: Function): Promise<{ success: boolean, message?: string }> {
        try {
            await this.getInstance(this.makeModelConfig(modelId, modelUrl, wasmUrl), progressCallback);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static async unload() {
        try {
            const chat = await this.getInstance();
            await chat.unload();
            this.instance = null;
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    static makePrompt = (messages: LLMChatMessage[], ragResult?: string[]): string => {
        //! 현재 webLLM은 마지막 질문만 추가해서 generate를 한다.
        //! 따라서, 임시로 prompt를 만들 때 RAG 결과가 담긴 시스템 메시지와 마지막 메시지를 추가한다.
        // const prompt = messages.map(m => m.content).join(' ');
        const systemMessage = messages.find(m => m.role === 'system') as { role: string, content: string };
        const lastQuestionMessage = messages.filter(m => m.role === 'user').pop() as { role: string, content: string };
        const ragContent = ragResult ? ragResult.map(text => `\n###\ngiven: ${text}`).join('') : '';

        return `${systemMessage.content}${ragContent}\n###\nquestion: ${lastQuestionMessage.content}`;
    }

    static async completion(
        messages: LLMChatMessage[],
        ragResult: string[],
        generateProgressCallback: (_step: number, message: string) => void,
    ) {
        const chat = await this.getInstance();

        // 프롬프트 구성
        const prompt = this.makePrompt(messages, ragResult);
        console.log('[WORKER: webLLM] prompt: ', prompt);

        // webLLM API 호출
        const reply = await chat.generate(prompt, generateProgressCallback);
        console.log('[WORKER: webLLM] ', reply);
        return reply;
    }
}
Comlink.expose(LLMSingleton);
export default LLMSingleton;