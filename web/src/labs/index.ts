// Loaded on demand by the guides page; maps each guide group to its lab.
import type { LabSpec } from './engine';
import { basicsLab } from './basics';
import { stringsLab } from './strings';
import { loopsLab } from './loops';
import { bigoLab } from './bigo';
import { stackQueueLab } from './stackqueue';
import { linkedListLab, pointersLab } from './linkedlist';
import { treeLab } from './tree';
import { eventsLab } from './events';
import { sortingLab } from './sorting';
import { searchingLab } from './searching';

export { labHtml, mountLab } from './engine';
export const labs: Record<string, LabSpec> = {
  '01': basicsLab, '02': stringsLab, '03': loopsLab, '04': bigoLab, '05': stackQueueLab,
  '06': linkedListLab, '07': pointersLab, '08': treeLab, '09': eventsLab, '10': sortingLab, '11': searchingLab,
};
