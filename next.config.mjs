const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: isProd ? "/flappy-bird" : ""
};

export default nextConfig;
