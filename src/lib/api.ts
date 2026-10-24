import { demoApi } from "./demoApi";
import { isLive, liveApi } from "./liveApi";
import type { Api } from "./types";

/** Live (Supabase + Razorpay) when VITE_SUPABASE_* are set, otherwise the on-device demo. */
export const api: Api = isLive ? liveApi : demoApi;
