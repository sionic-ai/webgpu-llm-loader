# WebGPU LLM Loader

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can choose to load a **pre-built Llama 2 Model**(7B, 13B, 70B) or a **Custom Model** that you build yourself.

If you select a Custom LLM Model, three inputs are required.
- **Model Local Id**: The `local_id` from your `mlc-chat-config.json`.
- **Model URL**: The URL of the Model you uploaded to huggingface.
- **WASM File**: The `.wasm` file built for your WebGPU.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Compile Models via MLC](https://llm.mlc.ai/docs/compilation/compile_models.html)
- [Distribute Compiled Models](https://llm.mlc.ai/docs/compilation/distribute_compiled_models.html)

You can check out [GitHub repository](https://github.com/sionic-ai/webgpu-llm-loader/) - your feedback and contributions are welcome!