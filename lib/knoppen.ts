// Knopstijlen voor de back-office (DESIGN.md: rechthoekig, zinshoofdletter, kleurwissel 160 ms).
const basis =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60 cursor-pointer";
export const knopPrimair = `${basis} h-10 px-4 text-sm bg-lime-300 text-ink-900 hover:bg-bone-100`;
export const knopSecundair = `${basis} h-10 px-4 text-sm border border-olive-600 text-bone-100 hover:border-lime-300 hover:text-lime-300`;
/** Compacte variant voor in tabelrijen. */
export const knopKlein = `${basis} h-8 px-3 text-[0.8125rem] border border-olive-600 text-bone-100 hover:border-lime-300 hover:text-lime-300`;
