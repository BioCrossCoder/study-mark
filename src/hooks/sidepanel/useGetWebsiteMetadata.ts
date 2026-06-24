import { MicroLinkApiResp } from "@/common/types";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useGetWebsiteMetadata(toast: RefObject<Toast | null>) {
  return async (url: string) => {
    const resp = await fetch(`https://api.microlink.io?url=${url}`);
    const summary = "Load Description Failed";
    if (!resp.ok) {
      const detail = `${resp.status}:${resp.statusText}`;
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const result = (await resp.json()) as MicroLinkApiResp;
    if (result.status !== "success") {
      const detail = `${result.status}:${result.message}`;
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    return result.data;
  };
}
