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

export function isHigherInTable({ newRow, comparisonRow, sortBy, sortDesc }) {
  const newVal = newRow[sortBy];
  const oldVal = comparisonRow[sortBy];
  if (sortDesc) {
    return (
      newVal > oldVal ||
      (newVal === oldVal && newRow[LEVEL] > comparisonRow[LEVEL])
    );
  }
  return (
    newVal < oldVal ||
    (newVal === oldVal && newRow[LEVEL] < comparisonRow[LEVEL])
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

export function getLightBlock(heavyBlock) {
  const { level, timestamp, hash, proposer, reward, fees } = heavyBlock;
  return { level, timestamp, hash, proposer, reward, fees };
}

export function binarySearchNewBlockIndex(comparisonObject) {
  //{ newRow, allBlocks, sortBy, sortDesc }
  const { allBlocks } = comparisonObject;
  const bottomRow = allBlocks.slice(-1)[0];
  const topRow = allBlocks[0];
  if (isHigherInTable({ ...comparisonObject, comparisonRow: topRow })) {
    return 0;
  }
  if (!isHigherInTable({ ...comparisonObject, comparisonRow: bottomRow }))
    return -1;
  return binarySearchIteration({
    start: 0,
    end: allBlocks.length - 1,
  });
  function binarySearchIteration({ start, end }) {
    let _start = start;
    let _end = end;
    const checkIndex = start + Math.round((end - start) / 2);
    if (
      isHigherInTable({
        ...comparisonObject,
        comparisonRow: allBlocks[checkIndex],
      })
    ) {
      _end = checkIndex;
    } else {
      _start = checkIndex;
    }
    if (_end - _start === 1) return _end;
    return binarySearchIteration({ start: _start, end: _end });
  }
}
