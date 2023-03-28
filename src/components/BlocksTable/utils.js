import { DEFAULT_SORT_DESC, SORT_FIELDS, DEFAULT_SORT } from "./constants";

export function getSortObject(
  { sortBy, sortDesc } = { sortBy: DEFAULT_SORT, sortDesc: DEFAULT_SORT_DESC }
) {
  return { [SORT_FIELDS[sortDesc ? "desc" : "asc"]]: sortBy };
}
