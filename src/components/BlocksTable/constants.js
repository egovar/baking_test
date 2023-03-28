export const [LEVEL, TIMESTAMP, HASH, PROPOSER, REWARD, FEES] = [
  "level",
  "timestamp",
  "hash",
  "proposer",
  "reward",
  "fees",
];
export const COLUMN_NAMES = [LEVEL, TIMESTAMP, HASH, PROPOSER, REWARD, FEES];
export const DEFAULT_SELECT = COLUMN_NAMES.join(",");
export const DEFAULT_LIMIT = 40;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_SORT_FIELD = "sort.desc";
export const DEFAULT_SORT = LEVEL;
export const BAKING_TIME = 8;
const SORTABLE_COLUMN_NAMES = [LEVEL, REWARD, FEES];
export const COLUMNS = COLUMN_NAMES.map((name) => ({
  text: name[0].toUpperCase() + name.slice(1),
  value: name,
  sortable: SORTABLE_COLUMN_NAMES.includes(name),
}));
