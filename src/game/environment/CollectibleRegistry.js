// Central registry for collectible banknotes so meshes can toggle visibility with zero GC overhead
export const collectibleRegistry = {
  collectedNotes: new Set()
};
