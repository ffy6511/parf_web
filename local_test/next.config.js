/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */

const config = {
    assetPrefix: '/parf/', // 静态资源路径的前缀
    basePath: '',           // 应用的基础路径
};

export default config;
