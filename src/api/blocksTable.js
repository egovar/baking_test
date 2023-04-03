import { server } from "@/api/index";
import { DEFAULT_PARAMS, DEFAULT_SORT_OBJECT } from "@/constants";

export function getBlocks(params = DEFAULT_SORT_OBJECT) {
  return server.get("/v1/blocks", {
    ...DEFAULT_PARAMS,
    ...params,
  });
}
