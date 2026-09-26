import * as migration_20260926_005630_initieel from './20260926_005630_initieel';

export const migrations = [
  {
    up: migration_20260926_005630_initieel.up,
    down: migration_20260926_005630_initieel.down,
    name: '20260926_005630_initieel'
  },
];
