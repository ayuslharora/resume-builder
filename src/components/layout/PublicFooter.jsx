import { Link } from "react-router-dom";

function PublicFooterLogo() {
  return (
    <>
      <div
        className="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]"
        style={{
          boxShadow: "0 1px 2px rgba(15,23,42,.16)",
        }}
      >
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className="h-full w-full"
        />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">
        Resu<span className="serif italic font-normal">Me</span>
      </span>
    </>
  );
}

export default function PublicFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 24px", flexWrap: "wrap" }}>
        <Link to="/" className="flex items-center gap-2">
          <PublicFooterLogo />
        </Link>
        <span className="flex-1" />
        <span className="mono text-[12.5px] text-[var(--muted)]">
          ResuMe by Ayush ·{" "}
          <a
            href="https://Ayuslh.in"
            target="_blank"
            rel="noreferrer"
            className="ulink text-[var(--text-2)]"
          >
            Ayuslh.in
          </a>
        </span>
      </div>
    </footer>
  );
}
