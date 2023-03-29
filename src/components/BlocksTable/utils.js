import {
  DEFAULT_SORT_DESC,
  DEFAULT_SORT,
  LEVEL,
  BLOCK_HASH_LENGTH,
  PROPOSER_START_LENGTH,
  PROPOSER_END_LENGTH,
} from "./constants";

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

export function formatHash(hash) {
  return `${hash.slice(0, BLOCK_HASH_LENGTH)}...`;
}

export function formatProposer(proposer) {
  return `${proposer.slice(0, PROPOSER_START_LENGTH)}...${proposer.slice(
    -PROPOSER_END_LENGTH
  )}`;
}
