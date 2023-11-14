'use client';

import { useEffect, useState } from "react"
import Image from 'next/image'
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog, AlertDialogAction, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useLLM } from '@/context/LLMProvider';

const MODEL_PRESET: Record<string, { url: string, localId: string, wasmUrl: string }> = {
    '7b': {
        url: 'https://huggingface.co/sionic-ai/chat-Llama-2-7b-chat-hf-q4f32_1',
        localId: 'Llama-2-7b-chat-hf-q4f32_1',
        wasmUrl: '/model-lib/Llama-2-7b-chat-hf-q4f32_1-webgpu.wasm'
    },
    '13b': {
        url: 'https://huggingface.co/sionic-ai/chat-Llama-2-13b-chat-hf-q4f32_1',
        localId: 'Llama-2-13b-chat-hf-q4f32_1',
        wasmUrl: '/model-lib/Llama-2-13b-chat-hf-q4f32_1-webgpu.wasm'
    },
    '70b': {
        url: 'https://huggingface.co/sionic-ai/chat-Llama-2-70b-chat-hf-q4f16_1',
        localId: 'Llama-2-70b-chat-hf-q4f16_1',
        wasmUrl: '/model-lib/Llama-2-70b-chat-hf-q4f16_1-webgpu.wasm'
    }
};

export default function Home() {
    const router = useRouter();
    const { initLocalLLM, isInitLocalLLM } = useLLM();

    const [selected, setSelected] = useState('7b');
    const [modelUrl, setModelUrl] = useState('');
    const [modelLocalId, setModelLocalId] = useState('');
    const [wasmUrl, setWasmUrl] = useState('');

    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [outputText, setOutputText] = useState('');

    const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setWasmUrl(result);
                }
            }
            reader.readAsDataURL(file);
        }
    }

    const loadHandler = async () => {
        const modelUrl_ = (
            (modelUrl.lastIndexOf('/') === modelUrl.length - 1) ?
                modelUrl.slice(0, -1) :
                modelUrl
        ) + '/resolve/main/';

        const { success, message } = await initLocalLLM(modelLocalId, modelUrl_, wasmUrl, (progress: number, timeElapsed: number, text: string) => {
            setProgress(progress);
            setElapsedTime(Math.trunc(timeElapsed));
            setOutputText(text)
        })
        console.log('[loadHandler]', success, message);
    }

    useEffect(() => {
        if (isInitLocalLLM) {
            router.push('/chat');
        }
    }, []);

    useEffect(() => {
        if (MODEL_PRESET[selected]) {
            setModelUrl(MODEL_PRESET[selected].url);
            setModelLocalId(MODEL_PRESET[selected].localId);
            setWasmUrl(MODEL_PRESET[selected].wasmUrl);
        } else {
            setModelUrl('');
            setModelLocalId('');
            setWasmUrl('');
        }
    }, [selected]);

    return (
        <main className="flex min-h-screen flex-col items-center px-24 py-8">
            <div className="p-9 relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
                <Image src="/webgpu.png" alt="Llama2 7B Chat" width={64} height={64} className="mr-2" />
                <h2 className="text-5xl font-bold tracking-tight">WebGPU LLM Loader</h2>
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
                        <RadioGroup defaultValue="7b" className="grid grid-cols-4 gap-4">
                            <div>
                                <RadioGroupItem value="7b" id="7b" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="7b"
                                    className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/llama.png" alt="Llama2 7B Chat" width={180} height={37} />
                                    Llama 2 7B Chat
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="13b" id="13b" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="13b"
                                    className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/llama.png" alt="Llama2 7B Chat" width={180} height={37} />
                                    Llama 2 13B Chat
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="70b" id="70b" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="70b"
                                    className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/llama.png" alt="Llama2 7B Chat" width={180} height={37} />
                                    Llama 2 70B Chat
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="custom" id="custom" className="peer sr-only" onClick={e => setSelected(e.currentTarget.value)} />
                                <Label
                                    htmlFor="custom"
                                    className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <Image src="/wasm.png" alt="Custom Model" width={180} height={37} />
                                    Custom Model
                                </Label>
                            </div>
                        </RadioGroup>
                        <div className="grid gap-2 mt-8">
                            <Label htmlFor="model-local-id">Model Local Id</Label>
                            <Input id="model-local-id"
                                value={modelLocalId}
                                disabled={selected !== 'custom'}
                                onChange={e => setModelLocalId(e.currentTarget.value)}
                            />
                            <Label htmlFor="model-url">Model URL</Label>
                            <Input id="model-url"
                                value={modelUrl}
                                disabled={selected !== 'custom'}
                                onChange={e => setModelUrl(e.currentTarget.value)}
                            />
                            <Label htmlFor="model-wasm">WASM File</Label>
                            <Input id="model-wasm" className="cursor-pointer" type="file" accept='.wasm'
                                disabled={selected !== 'custom'}
                                onChange={fileHandler}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" onClick={loadHandler}>Load</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>LLM takes some time to load.</AlertDialogTitle>
                                    <div>
                                        <Progress value={progress} className='mb-4' />
                                        <div className='font-bold'>Elapsed Time: {elapsedTime} sec</div>
                                        <div className='font-bold'>Output Text</div>
                                        <div className='text-sm text-slate-500 italic truncate max-w-md'>{outputText}</div>
                                    </div>
                                </AlertDialogHeader>
                                <AlertDialogFooter className={isInitLocalLLM ? "" : "hidden"}>
                                    <AlertDialogAction asChild>
                                        <Button className="w-full" onClick={() => {
                                            router.push('/chat');
                                        }}>Continue!</Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}