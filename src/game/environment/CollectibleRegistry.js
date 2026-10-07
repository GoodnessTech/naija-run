// Central registry for collectible notes, valuables, and traps with zero GC overhead
export const collectibleRegistry = {
  collectedNotes: new Set(),
  collectedValuables: new Set(),
  triggeredCatalysts: new Set(),
  clearedFrontWitches: new Set(),
  reset() {
    this.collectedNotes.clear();
    this.collectedValuables.clear();
    this.triggeredCatalysts.clear();
    this.clearedFrontWitches.clear();
  }
};
