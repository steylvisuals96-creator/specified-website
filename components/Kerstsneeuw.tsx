import type { CSSProperties } from "react";

const VLOKKEN = [
  { links: 7, boven: 5, maat: 4, wachttijd: 650 },
  { links: 13, boven: 32, maat: 3, wachttijd: 1000 },
  { links: 21, boven: 14, maat: 2, wachttijd: 450 },
  { links: 28, boven: 38, maat: 4, wachttijd: 750 },
  { links: 35, boven: 7, maat: 3, wachttijd: 850 },
  { links: 43, boven: 25, maat: 2, wachttijd: 1150 },
  { links: 49, boven: 13, maat: 4, wachttijd: 550 },
  { links: 57, boven: 32, maat: 3, wachttijd: 700 },
  { links: 63, boven: 4, maat: 2, wachttijd: 1100 },
  { links: 70, boven: 22, maat: 4, wachttijd: 500 },
  { links: 78, boven: 11, maat: 3, wachttijd: 900 },
  { links: 85, boven: 38, maat: 3, wachttijd: 1200 },
  { links: 92, boven: 20, maat: 4, wachttijd: 625 },
  { links: 96, boven: 34, maat: 2, wachttijd: 950 },
];

export default function Kerstsneeuw() {
  return (
    <div className="kerstsneeuw" aria-hidden="true">
      {VLOKKEN.map(({ links, boven, maat, wachttijd }) => (
        <span
          key={links}
          className="kerstsneeuw__vlok"
          style={{
            insetInlineStart: `${links}%`,
            insetBlockStart: `${boven}%`,
            "--vlok-maat": `${maat}px`,
            animationDelay: `${wachttijd}ms`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
