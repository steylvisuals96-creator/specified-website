import type { CSSProperties } from "react";

const VLOKKEN = [
  { links: 3, maat: 3, duur: 14, fase: -3 },
  { links: 8, maat: 4, duur: 17, fase: -10 },
  { links: 14, maat: 2, duur: 13, fase: -12 },
  { links: 19, maat: 3, duur: 15, fase: -1 },
  { links: 24, maat: 4, duur: 13, fase: -6 },
  { links: 29, maat: 3, duur: 16, fase: -12 },
  { links: 34, maat: 2, duur: 12, fase: -4 },
  { links: 40, maat: 4, duur: 15, fase: -9 },
  { links: 44, maat: 3, duur: 14, fase: -6 },
  { links: 49, maat: 2, duur: 17, fase: -14 },
  { links: 54, maat: 4, duur: 13, fase: -2 },
  { links: 60, maat: 2, duur: 16, fase: -9 },
  { links: 65, maat: 3, duur: 14, fase: -11 },
  { links: 70, maat: 4, duur: 15, fase: -5 },
  { links: 75, maat: 2, duur: 12, fase: -8 },
  { links: 80, maat: 3, duur: 16, fase: -4 },
  { links: 85, maat: 4, duur: 14, fase: -8 },
  { links: 90, maat: 2, duur: 13, fase: -12 },
  { links: 94, maat: 3, duur: 16, fase: -10 },
  { links: 97, maat: 2, duur: 12, fase: -5 },
];

export default function Kerstsneeuw() {
  return (
    <div className="kerstsneeuw">
      <label className="kerstsneeuw__knop">
        <input type="checkbox" defaultChecked />
        Sneeuw
      </label>
      <div className="kerstsneeuw__veld" aria-hidden="true">
        {VLOKKEN.map(({ links, maat, duur, fase }) => (
          <span
            key={links}
            className="kerstsneeuw__vlok"
            style={{
              insetInlineStart: `${links}%`,
              "--vlok-maat": `${maat}px`,
              animationDuration: `${duur}s`,
              animationDelay: `${fase}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
