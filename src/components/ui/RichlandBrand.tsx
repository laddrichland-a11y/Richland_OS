import Image from "next/image";

/** Shared product branding for practitioner and client surfaces. */
export default function RichlandBrand({ subtitle }: { subtitle?: string }) {
  return (
    <>
      <span
        className="sidebar-brand-mark"
        style={{ position: "relative", width: 42, height: 42, flex: "0 0 42px", alignSelf: "center", overflow: "visible" }}
      >
        <Image
          className="sidebar-brand-symbol"
          aria-hidden="true"
          src="/images/richland-mark.svg"
          alt=""
          width={64}
          height={64}
          unoptimized
          style={{ position: "absolute", top: "50%", left: "50%", width: "100%", height: "auto", transform: "translate(-50%, -50%)" }}
        />
      </span>
      <div className="sidebar-brand-copy">
        <div className="sidebar-wordmark" style={{ textTransform: "none" }}>Richland OS</div>
        {subtitle && <div className="richland-brand-subtitle">{subtitle}</div>}
      </div>
    </>
  );
}
