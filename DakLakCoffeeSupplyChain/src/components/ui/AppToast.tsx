"use client";

import { toast } from "sonner";

//Toast support <br /> and \n
export const AppToast = {
    success: (message: string) =>
        toast.success(<span dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, "<br />") }} />),
    error: (message: string) =>
        toast.error(<span dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, "<br />") }} />),
    warning: (message: string) =>
        toast.warning(<span dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, "<br />") }} />),
    info: (message: string) =>
        toast(<span dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, "<br />") }} />),
};
