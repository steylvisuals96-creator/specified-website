import DashboardShell, { PageHeader, GoldBtn } from "./DashboardShell";

const G = "#facb04";
const BORDER = "#1e1e1e";

export default function FormShell({
  activePath, userName, title, backHref, children, actions,
}: {
  activePath: string;
  userName: string;
  title: string;
  backHref: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <DashboardShell activePath={activePath} userName={userName}>
      <PageHeader
        title={title}
        actions={
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <GoldBtn href={backHref} outline>← Annuleren</GoldBtn>
            {actions}
          </div>
        }
      />
      <div style={{ padding: "2rem 2.5rem", maxWidth: "860px" }}>
        {children}
      </div>
    </DashboardShell>
  );
}

export function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      {title && (
        <div style={{
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: G, marginBottom: "1rem",
          paddingBottom: "0.5rem", borderBottom: "1px solid #1a1a1a",
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: "1rem", marginBottom: "1.25rem" }}>
      {children}
    </div>
  );
}

export function Field({
  label, name, type = "text", required, defaultValue, placeholder, rows, children,
}: {
  label: string; name?: string; type?: string; required?: boolean;
  defaultValue?: string | number; placeholder?: string; rows?: number; children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: children ? 0 : "1.25rem" }}>
      <label style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>
        {label}{required && <span style={{ color: G, marginLeft: "2px" }}>*</span>}
      </label>
      {children ?? (
        type === "textarea" ? (
          <textarea
            name={name}
            rows={rows ?? 4}
            defaultValue={defaultValue}
            placeholder={placeholder}
            required={required}
            style={{
              background: "#141414", border: `1px solid ${BORDER}`, color: "#f0ede8",
              borderRadius: "5px", padding: "0.6rem 0.85rem", fontSize: "0.85rem",
              fontFamily: "DM Sans, sans-serif", resize: "vertical", lineHeight: 1.6,
            }}
          />
        ) : (
          <input
            type={type}
            name={name}
            defaultValue={defaultValue}
            placeholder={placeholder}
            required={required}
            step={type === "number" ? "any" : undefined}
            style={{
              background: "#141414", border: `1px solid ${BORDER}`, color: "#f0ede8",
              borderRadius: "5px", padding: "0.6rem 0.85rem", fontSize: "0.85rem",
              fontFamily: "DM Sans, sans-serif",
            }}
          />
        )
      )}
    </div>
  );
}

export function SelectField({
  label, name, required, defaultValue, options, placeholder,
}: {
  label: string; name: string; required?: boolean; defaultValue?: string;
  options: { label: string; value: string }[]; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1.25rem" }}>
      <label style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>
        {label}{required && <span style={{ color: G, marginLeft: "2px" }}>*</span>}
      </label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        style={{
          background: "#141414", border: `1px solid ${BORDER}`, color: "#f0ede8",
          borderRadius: "5px", padding: "0.6rem 0.85rem", fontSize: "0.85rem",
          fontFamily: "DM Sans, sans-serif", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function CheckboxField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginBottom: "1.25rem" }}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} value="true" style={{ accentColor: G, width: "16px", height: "16px" }} />
      <span style={{ fontSize: "0.85rem", color: "#d0c8be" }}>{label}</span>
    </label>
  );
}

export function RelationField({
  label, name, required, defaultValue, options, placeholder,
}: {
  label: string; name: string; required?: boolean; defaultValue?: string;
  options: { label: string; value: string }[]; placeholder?: string;
}) {
  return (
    <SelectField
      label={label} name={name} required={required} defaultValue={defaultValue}
      placeholder={placeholder ?? "— Selecteer —"}
      options={options}
    />
  );
}

export function SaveBtn({ label = "Opslaan", form }: { label?: string; form?: string }) {
  return (
    <button
      type="submit"
      form={form}
      style={{
        background: G, color: "#111", border: "none", borderRadius: "5px",
        padding: "0.55rem 1.25rem", fontWeight: 700, fontSize: "0.8rem",
        cursor: "pointer", letterSpacing: "0.04em", boxShadow: "0 2px 12px rgba(250,203,4,0.25)",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {label}
    </button>
  );
}

export function DeleteBtn({ label = "Verwijderen" }: { label?: string }) {
  return (
    <button
      type="submit"
      name="_action"
      value="delete"
      onClick={(e) => { if (!confirm("Zeker verwijderen?")) e.preventDefault(); }}
      style={{
        background: "transparent", color: "#e05252", border: "1px solid #e05252",
        borderRadius: "5px", padding: "0.5rem 1rem", fontWeight: 600, fontSize: "0.78rem",
        cursor: "pointer", fontFamily: "DM Sans, sans-serif",
      }}
    >
      {label}
    </button>
  );
}

export function TabBar({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect: (t: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid #1a1a1a", marginBottom: "1.5rem" }}>
      {tabs.map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onSelect(t)}
          style={{
            background: "transparent", border: "none", borderBottom: `2px solid ${t === active ? G : "transparent"}`,
            color: t === active ? G : "#555", padding: "0.65rem 1.1rem",
            cursor: "pointer", fontSize: "0.8rem", fontWeight: t === active ? 600 : 400,
            fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
          }}
        >{t}</button>
      ))}
    </div>
  );
}
