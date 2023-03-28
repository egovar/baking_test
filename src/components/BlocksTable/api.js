import { server } from "@/api";
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SELECT,
  DEFAULT_SORT,
  DEFAULT_SORT_FIELD,
} from "./constants";

export function getBlocks(
  params = {
    "select.fields": DEFAULT_SELECT,
    [DEFAULT_SORT_FIELD]: DEFAULT_SORT,
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
  }
) {
  return server.get("/v1/blocks", params);
}
