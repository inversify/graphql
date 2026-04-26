import { type KnipConfig, type WorkspaceProjectConfig } from "knip";

const defaultWorkspaceProjectConfig: WorkspaceProjectConfig & {
  entry: string[];
  ignoreDependencies: string[];
  project: string[];
} = {
  entry: [
    "{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
    "src/{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
    "**/?(*.)+(spec|spec-d).[jt]s?(x)",
  ],
  ignoreDependencies: [],
  project: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}!", "!**/__mocks__"],
};

export default {
  commitlint: {
    config: "config/commitlint/commitlint.config.js",
  },
  workspaces: {
    ".": {
      entry: [],
      ignoreDependencies: [
        ...defaultWorkspaceProjectConfig.ignoreDependencies,
        "@inversifyjs/foundation-scripts",
      ],
      project: [],
    },
    "packages/*": defaultWorkspaceProjectConfig,
  },
} satisfies KnipConfig;
