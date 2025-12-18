import { KnipConfig } from "knip";

type IsNotFunction<T> = T extends (...args: any) => any ? never : T;
type RecordValues<T> = T extends Record<any, infer U> ? U : never;

type KnipConfigObject = IsNotFunction<KnipConfig>;

type WorkspaceProjectConfig = RecordValues<
  Required<KnipConfigObject["workspaces"]>
>;

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
  ignoreDependencies: ["tslib"],
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
