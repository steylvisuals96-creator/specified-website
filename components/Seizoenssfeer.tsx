import type { Seizoen } from "@/lib/seizoen";

const LICHTJES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ZONNESTRALEN = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];

const SFEREN = {
  kerst: (
    <div className="seizoenssfeer__lichten">
      {LICHTJES.map((lichtje) => <span key={lichtje} />)}
    </div>
  ),
  winter: (
    <>
      <div className="seizoenssfeer__rijp"><span /><span /><span /></div>
      <div className="seizoenssfeer__rijp seizoenssfeer__rijp--rechts"><span /><span /><span /></div>
    </>
  ),
  lente: (
    <>
      <div className="seizoenssfeer__kiem"><span /><span /><span /></div>
      <div className="seizoenssfeer__kiem seizoenssfeer__kiem--rechts"><span /><span /><span /></div>
    </>
  ),
  zomer: (
    <div className="seizoenssfeer__zon">
      {ZONNESTRALEN.map((hoek) => <span key={hoek} style={{ rotate: `${hoek}deg` }} />)}
    </div>
  ),
  herfst: (
    <div className="seizoenssfeer__bladeren">
      <span /><span /><span /><span /><span />
    </div>
  ),
} satisfies Record<Exclude<Seizoen, "standaard">, React.ReactNode>;

export default function Seizoenssfeer({ seizoen }: { seizoen?: Seizoen }) {
  if (seizoen === "standaard") return null;

  return (
    <div className="seizoenssfeer" aria-hidden="true">
      {Object.entries(SFEREN).map(([id, sfeer]) => (
        (!seizoen || seizoen === id) && <div key={id} data-sfeer={id}>{sfeer}</div>
      ))}
    </div>
  );
}
