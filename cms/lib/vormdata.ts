/**
 * Zet formulierdata met puntnamen om in een object: "hero.prefix" wordt
 * { hero: { prefix } } en "callouts.0.label" een lijst. Gebruikt door de
 * server (opslaan) en de browser (live voorbeeld), dus geen server-API's hier.
 */
export function unflatten(entries: Iterable<[string, unknown]>): Record<string, any> {
  const root: Record<string, any> = {};
  for (const [sleutel, waarde] of entries) {
    if (typeof waarde !== "string" || sleutel.startsWith("$") || sleutel.startsWith("_")) continue;
    const delen = sleutel.split(".");
    let huidig: any = root;
    delen.forEach((deel, i) => {
      const laatste = i === delen.length - 1;
      const volgendeIsIndex = /^\d+$/.test(delen[i + 1] ?? "");
      if (laatste) {
        huidig[deel] = waarde;
      } else {
        huidig[deel] ??= volgendeIsIndex ? [] : {};
        huidig = huidig[deel];
      }
    });
  }
  return root;
}
