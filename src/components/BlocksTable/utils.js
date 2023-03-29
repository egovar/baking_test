import { DEFAULT_SORT_DESC, DEFAULT_SORT } from "./constants";

export function getSortObject(
  { sortBy, sortDesc } = { sortBy: DEFAULT_SORT, sortDesc: DEFAULT_SORT_DESC }
) {
  return { sort: { [sortDesc ? "desc" : "asc"]: sortBy } };
}
