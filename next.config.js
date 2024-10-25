/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import path from "path";


/** @type {import("next").NextConfig} */
const config = {
    webpack: (config, { isServer, nextRuntime }) => {
        if (isServer && nextRuntime === "nodejs") {
          config.resolve.alias = {
            ...config.resolve.alias,
            playht: path.resolve("node_modules/playht/dist/cjs"),
          };
        }
        return config;
      },
};

export default config;
