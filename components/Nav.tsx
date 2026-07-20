"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Eén bron voor desktop- én mobiel menu. "Jobs" gaat rechtstreeks naar de
// volledige vacaturepagina; de rest scrollt naar een sectie op de homepage.
const NAV_ITEMS = [
  { label: "Diensten", href: "/#diensten" },
  { label: "Jobs", href: "/vacatures" },
  { label: "Over ons", href: "/#over-ons" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "var(--dark-2)",
        borderBottom: "1px solid",
        borderColor: `rgba(255,255,255,${borderOpacity})`,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image
            src="/images/team/logo_specified.svg"
            alt="Specified"
            width={140}
            height={36}
            style={{ filter: "brightness(0) invert(1)", height: "28px", width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
          }}
          className="hidden md:flex nav-desktop"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 400,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {item.label}
            </Link>
          ))}
          <motion.a
            href="/#contact"
            style={{
              backgroundColor: "var(--lime)",
              color: "var(--dark)",
              padding: "0.6rem 1.4rem",
              borderRadius: "100px",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Neem contact op
          </motion.a>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            padding: "4px",
          }}
          aria-label="Menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "24px",
                height: "1.5px",
                backgroundColor: "var(--white)",
                transition: "all 0.3s",
                transformOrigin: "center",
                transform:
                  menuOpen && i === 0
                    ? "rotate(45deg) translate(4.5px, 4.5px)"
                    : menuOpen && i === 2
                    ? "rotate(-45deg) translate(4.5px, -4.5px)"
                    : menuOpen && i === 1
                    ? "opacity: 0; scaleX(0)"
                    : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderTop: "1px solid var(--border)",
            padding: "1.5rem clamp(1.5rem, 5vw, 4rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "var(--white)",
                textDecoration: "none",
                fontSize: "1.1rem",
                fontWeight: 400,
              }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            style={{
              backgroundColor: "var(--lime)",
              color: "var(--dark)",
              padding: "0.75rem 1.4rem",
              borderRadius: "100px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            Neem contact op
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
