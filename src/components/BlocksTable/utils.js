import { DEFAULT_SORT_DESC, DEFAULT_SORT, LEVEL } from "./constants";

export function getSortObject(
  { sortBy, sortDesc } = { sortBy: DEFAULT_SORT, sortDesc: DEFAULT_SORT_DESC }
) {
  return { sort: { [sortDesc ? "desc" : "asc"]: sortBy } };
}

export function isHigherInTable({ newRow, bottomRow, sortBy, sortDesc }) {
  const newVal = newRow[sortBy];
  const oldVal = bottomRow[sortBy];
  if (sortDesc) {
    return (
      newVal > oldVal || (newVal === oldVal && newRow[LEVEL] > bottomRow[LEVEL])
    );
  }
  return (
    newVal < oldVal || (newVal === oldVal && newRow[LEVEL] < bottomRow[LEVEL])
  );
}
