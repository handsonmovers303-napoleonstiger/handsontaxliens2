import type { ComponentType } from "react";

export declare function loadResearchApp(): Promise<{
  installStorage: () => void;
  installLive: () => void;
  artifact: boolean;
  App: ComponentType;
}>;
