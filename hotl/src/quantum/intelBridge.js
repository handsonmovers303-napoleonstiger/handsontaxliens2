// The mission-tree model the search engine reads: branches, checks and research states.
import { STOP_ITEMS } from "../legacy/ScoutingDept.jsx";
export { BRANCHES, itemById, stateOf } from "../holo/intel";
export const STOP_ITEM_IDS = STOP_ITEMS.map((i) => i.id);
