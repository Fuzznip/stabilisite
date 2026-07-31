"use server";

import { CollectionLogEvent } from "@/lib/types";
import { PaginatedResponse } from "@/lib/fetch/getSplits";
import { getRecentCollections } from "@/lib/fetch/getRecentCollections";

/** Lets the client pager fetch another page without a full navigation. */
export async function getRecentPage(
  page: number
): Promise<PaginatedResponse<CollectionLogEvent>> {
  return getRecentCollections(page);
}
