import { cache } from "react";
import "server-only";
import type { ProductPage } from "@/types";
import { mergeSettings } from "./model";
import { anonClient, serviceClient, serviceConfigured, supabaseConfigured } from "./supabase";

const ALL_VISIBLE: Record<ProductPage, boolean> = { ecommerce: true, distributors: true, export: true };

const visibilityFrom = (settings: unknown) =>
  mergeSettings(settings as Record<string, unknown> | null | undefined).pages;

/**
 * The page-wide storefront switches saved from Admin → Products & Stock.
 * Preferred path: the public SQL helper (`public_page_visibility`). If that migration hasn't been
 * applied yet, the settings row is read with the server-only service key. If neither is available,
 * every page shows — the safe default. Cached per request, so a page that renders several sections
 * only reads the setting once.
 */
export const getPageVisibility = cache(async (): Promise<Record<ProductPage, boolean>> => {
  if (!supabaseConfigured) return ALL_VISIBLE;
  try {
    const { data, error } = await anonClient().rpc("public_page_visibility");
    if (!error && data && typeof data === "object") return visibilityFrom({ pages: data });
  } catch {
    // Fall through to the service-role read.
  }
  if (serviceConfigured) {
    try {
      const { data } = await serviceClient().from("app_settings").select("data").eq("id", 1).maybeSingle();
      return visibilityFrom(data?.data);
    } catch {
      // Ignore — the storefront simply shows everything.
    }
  }
  return ALL_VISIBLE;
});

