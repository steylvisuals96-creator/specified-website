import type { Seizoen } from "@/lib/seizoen";

const TEKENS = {
  kerst: (
    <>
      <path d="M24 8l3.8 11.6L40 24l-12.2 4.4L24 40l-3.8-11.6L8 24l12.2-4.4L24 8Z" />
      <path className="seizoensteken__vonk" d="M14 14l4 4m16-4-4 4m4 16-4-4m-16 4 4-4" />
    </>
  ),
  winter: (
    <>
      <path d="M24 9v30M11 16.5l26 15M11 31.5l26-15M19.5 11.5 24 16l4.5-4.5m-9 25L24 32l4.5 4.5M11 22l6.1-2.1-1.3-6.3M37 26l-6.1 2.1 1.3 6.3m-16-0.8 1.1-6.3-6.2-2m21-12.2-1.1 6.3 6.2 2" />
      <circle className="seizoensteken__sneeuw" cx="9" cy="9" r="1.25" />
      <circle className="seizoensteken__sneeuw seizoensteken__sneeuw--later" cx="38" cy="8" r="1" />
      <circle className="seizoensteken__sneeuw" cx="42" cy="17" r=".75" />
    </>
  ),
  lente: (
    <>
      <path d="M24 39V23" />
      <path className="seizoensteken__scheut" d="M24 31C14 31 10 25 10 17c9 0 14 4 14 14Z" />
      <path className="seizoensteken__scheut seizoensteken__scheut--rechts" d="M24 24c0-10 5-15 15-15 0 10-5 15-15 15Z" />
    </>
  ),
  zomer: (
    <>
      <circle cx="24" cy="24" r="7.5" />
      <path className="seizoensteken__stralen" d="M24 9v5m0 20v5M9 24h5m20 0h5M13.4 13.4l3.5 3.5m14.2 14.2 3.5 3.5m0-21.2-3.5 3.5M16.9 31.1l-3.5 3.5" />
    </>
  ),
  herfst: (
    <path className="seizoensteken__blad" d="M12 37 33 16m-14 14v-7m7 0h7M15 34C8 22 19 12 37 11c0 17-9 28-22 23Z" />
  ),
} satisfies Record<Exclude<Seizoen, "standaard">, React.ReactNode>;

export default function Seizoensteken({ seizoen }: { seizoen?: Seizoen }) {
  if (seizoen === "standaard") return null;
  return (
    <svg className="seizoensteken" viewBox="0 0 48 48" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
      <path opacity=".5" d="M1 10V1h9m28 0h9v9m0 28v9h-9m-28 0H1v-9" />
      {Object.entries(TEKENS).map(([id, teken]) => (
        (!seizoen || seizoen === id) && <g key={id} data-teken={id} strokeWidth="1.35">{teken}</g>
      ))}
    </svg>
  );
}
