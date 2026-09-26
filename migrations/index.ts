import * as migration_20260926_005630_initieel from './20260926_005630_initieel';
import * as migration_20260926_080223_payload_3_90 from './20260926_080223_payload_3_90';

export const migrations = [
  {
    up: migration_20260926_005630_initieel.up,
    down: migration_20260926_005630_initieel.down,
    name: '20260926_005630_initieel',
  },
  {
    up: migration_20260926_080223_payload_3_90.up,
    down: migration_20260926_080223_payload_3_90.down,
    name: '20260926_080223_payload_3_90'
  },
];
