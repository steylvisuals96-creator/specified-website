import { LEEST_UIT_SUPABASE, supabaseLees } from "./beheer";
import { seizoenOp, type Seizoen } from "./seizoen";

export async function actiefSeizoen(): Promise<Seizoen> {
  if (!LEEST_UIT_SUPABASE) return "standaard";
  try {
    const [rij] = await supabaseLees<{ thema: unknown; vanaf: string | null; tot_en_met: string | null }>(
      "seizoensthema?select=thema,vanaf,tot_en_met&id=eq.true",
    );
    return seizoenOp(rij);
  } catch {
    return "standaard";
  }
}
