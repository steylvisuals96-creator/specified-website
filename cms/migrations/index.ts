import * as migration_20260926_005630_initieel from './20260926_005630_initieel';
import * as migration_20260926_080223_payload_3_90 from './20260926_080223_payload_3_90';
import * as migration_20261026_205209_website_homepage from './20261026_205209_website_homepage';
import * as migration_20261027_214106_website_contact from './20261027_214106_website_contact';
import * as migration_20261112_120830_vacature_velden from './20261112_120830_vacature_velden';

export const migrations = [
  {
    up: migration_20260926_005630_initieel.up,
    down: migration_20260926_005630_initieel.down,
    name: '20260926_005630_initieel',
  },
  {
    up: migration_20260926_080223_payload_3_90.up,
    down: migration_20260926_080223_payload_3_90.down,
    name: '20260926_080223_payload_3_90',
  },
  {
    up: migration_20261026_205209_website_homepage.up,
    down: migration_20261026_205209_website_homepage.down,
    name: '20261026_205209_website_homepage',
  },
  {
    up: migration_20261027_214106_website_contact.up,
    down: migration_20261027_214106_website_contact.down,
    name: '20261027_214106_website_contact',
  },
  {
    up: migration_20261112_120830_vacature_velden.up,
    down: migration_20261112_120830_vacature_velden.down,
    name: '20261112_120830_vacature_velden'
  },
];
