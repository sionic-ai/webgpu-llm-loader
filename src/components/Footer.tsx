import React from "react";
import { Badge } from "@/components/ui/badge";
import { Github, Link } from "lucide-react";

type Props = {};

export default function ChatFooter({ }: Props) {
    return (
        <footer className="max-w-3xl rounded-lg">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center">© 2023 <a href="https://sionic.ai/" className="hover:underline">
                    Sionic AI</a>. All Rights Reserved.
                </span>
                <a href="https://github.com/sionic-ai/webgpu-llm-loader" target="_blank">
                    <Badge className="text-base ml-4 px-3 py-1">
                        <Github />&nbsp;GitHub
                    </Badge>
                </a>
            </div>
        </footer>

    );
}
