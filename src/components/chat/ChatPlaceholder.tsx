import React from "react";

import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"

import ChatInput from "./ChatInput"

type Props = {};

export default function ChatPlaceholder({ }: Props) {

    return (
        <div className="mb-32 grid text-center lg:w-full lg:mb-0">
            <Card>
                <CardHeader>
                    <CardTitle>Now ask questions!</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <ChatInput className="relative pb-0 h-20" />
                </CardContent>
            </Card>
        </div>
    );
}
