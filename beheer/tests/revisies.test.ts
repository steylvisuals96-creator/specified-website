import assert from 'node:assert/strict';
import { test } from 'node:test';
import { revisiePad, revisieInvoer } from '../lib/revisies.ts';

test('alleen lokale websitepaden worden aanvaard', () => {
  for (const pad of ['/', '/voor-bedrijven#sectoren', '/en/for-companies', '/vacatures?regio=Antwerpen']) assert.equal(revisiePad(pad), pad);
  for (const pad of ['https://evil.be', '//evil.be', '/\\evil.be', '/ pad', 'javascript:alert(1)', '/\n/evil.be']) assert.equal(revisiePad(pad), null);
});

test('revisievelden worden op lengte en toegelaten keuzes gecontroleerd', () => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ titel: 'Correctie', beschrijving: 'Nieuwe tekst', pagina: '/', prioriteit: 'normaal', apparaat: 'alle' })) fd.set(k, v);
  assert.deepEqual(revisieInvoer(fd).velden, {});
  fd.set('titel', 'x'.repeat(161));
  fd.set('prioriteit', 'admin');
  fd.set('apparaat', 'onbekend');
  fd.set('beschrijving', ' ');
  assert.deepEqual(Object.keys(revisieInvoer(fd).velden).sort(), ['apparaat', 'beschrijving', 'prioriteit', 'titel']);
});
