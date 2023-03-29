import { server } from "@/api";
import { DEFAULT_PARAMS, DEFAULT_SORT_OBJECT } from "./constants";

export function getBlocks(sortAndOffsetObject = DEFAULT_SORT_OBJECT) {
  return server.get("/v1/blocks", {
    ...DEFAULT_PARAMS,
    ...sortAndOffsetObject,
  });
}
