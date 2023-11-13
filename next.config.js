/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        // See https://webpack.js.org/configuration/resolve/#resolvealias
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
                // by next.js will be dropped. Doesn't make much sense, but how it is
                fs: false, // the solution
                module: false,
                perf_hooks: false,
            };
        }
        return config;
    },
}

module.exports = nextConfig
