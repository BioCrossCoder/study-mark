type XPathRange = {
  start: string;
  startOffset: number;
  end: string;
  endOffset: number;
};

declare module "xpath-range" {
  export function fromRange(range: Range): XPathRange;
}

// https://github.com/hemanth/mcp-web-bridge
declare module "mcp-web-bridge" {
  type WebMcpTool = {
    name: string;
    description: string;
    inputSchema: JSONSchema.BaseSchema;
  };

  export class WebMCPBridge {
    constructor(serverUrl: string);
    connect: () => Promise<{ tools: WebMcpTool[] }>;
    callTool(name: string, ...args: any);
  }
}
