'use client';

import Image from 'next/image'
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const MODEL_PRESET: Record<string, { url: string, libMap: string }> = {
    '7b': {
        url: 'https://huggingface.co/sionic-ai/chat-Llama-2-7b-chat-hf-q4f32_1/resolve/main/',
        libMap: './model-lib/Llama-2-7b-chat-hf-q4f32_1-webgpu.wasm',
    },
    '13b': {
        url: 'https://huggingface.co/sionic-ai/chat-Llama-2-13b-chat-hf-q4f32_1/resolve/main/',
        libMap: './model-lib/Llama-2-13b-chat-hf-q4f32_1-webgpu.wasm',
    },
    '70b': {
        url: 'https://huggingface.co/sionic-ai/chat-Llama-2-70b-chat-hf-q4f16_1/resolve/main/',
        libMap: './model-lib/Llama-2-70b-chat-hf-q4f16_1-webgpu.wasm',
    }
};


export default function Home() {
    const [selected, setSelected] = useState('7b');
    const [modelUrl, setModelUrl] = useState('');
    const [modelLibMap, setModelLibMap] = useState('');

    useEffect(() => {
        if (MODEL_PRESET[selected]) {
            setModelUrl(MODEL_PRESET[selected].url);
            setModelLibMap(MODEL_PRESET[selected].libMap);
        } else {
            setModelUrl('');
            setModelLibMap('');
        }
    }, [selected]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="p-9 relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
                <h2 className="text-5xl font-bold tracking-tight">WASM LLM Loader</h2>
            </div>

            <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Model</CardTitle>
                        <CardDescription>
                            Select a ready-made model or enter your own built model
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <RadioGroup defaultValue="card" className="grid grid-cols-4 gap-4">
                            <div>
                                <RadioGroupItem value="7b" id="7b" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="7b"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/llama.png" alt="Llama2 7B Chat" width={180} height={37} />
                                    Llama 2 7B Chat
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="13b" id="13b" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="13b"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/llama.png" alt="Llama2 7B Chat" width={180} height={37} />
                                    Llama 2 13B Chat
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="70b" id="70b" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="70b"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/llama.png" alt="Llama2 7B Chat" width={180} height={37} />
                                    Llama 2 70B Chat
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="custom" id="custom" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="custom"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/wasm.png" alt="Custom Model" width={180} height={37} />
                                    Custom Model
                                </Label>
                            </div>
                        </RadioGroup>
                        <div className="grid gap-2 mt-8">
                            <Label htmlFor="model-url">Model URL</Label>
                            <Input id="model-url" value={modelUrl} disabled={selected !== 'custom'} />
                            <Label htmlFor="model-url">Model Lib Map</Label>
                            <Input id="model-url" value={modelLibMap} disabled={selected !== 'custom'} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Continue</Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}