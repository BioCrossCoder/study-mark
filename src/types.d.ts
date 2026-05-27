type XPathRange = {
  start: string;
  startOffset: number;
  end: string;
  endOffset: number;
};

declare module "xpath-range" {
  export function fromRange(range: Range): XPathRange;
}
