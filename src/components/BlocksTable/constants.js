import { getSortObject } from "./utils";

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
export const DEFAULT_SORT = LEVEL;
export const DEFAULT_SORT_DESC = true;
export const DEFAULT_PARAMS = {
  select: {
    fields: DEFAULT_SELECT,
  },
  limit: DEFAULT_LIMIT,
  offset: DEFAULT_OFFSET,
  level: {
    gt: 194965,
    le: 194967,
  },
};
export const DEFAULT_SORT_OBJECT = getSortObject();
export const BAKING_TIME = 8;
const SORTABLE_COLUMN_NAMES = [LEVEL, REWARD, FEES];
export const COLUMNS = COLUMN_NAMES.map((name) => ({
  text: name[0].toUpperCase() + name.slice(1),
  value: name,
  sortable: SORTABLE_COLUMN_NAMES.includes(name),
}));
export const SUBSCRIBE_TO_BLOCKS = "SubscribeToBlocks";
export const BLOCKS_EVENT = "blocks";
