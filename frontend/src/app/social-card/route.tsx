import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(135deg, #ffffff 0%, #eff6ff 54%, #dbeafe 100%)",
          color: "#111827",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "980px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "64px",
              fontWeight: 800,
              letterSpacing: "-0.06em",
            }}
          >
            Whats<span style={{ color: "#2563eb" }}>Next</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "72px",
              fontWeight: 700,
              letterSpacing: "-0.055em",
              lineHeight: 1.05,
            }}
          >
            Find the next movie worth watching.
          </div>
          <div
            style={{
              color: "#475569",
              display: "flex",
              fontSize: "30px",
              lineHeight: 1.4,
            }}
          >
            Upcoming releases, personal watchlists, and community reviews in
            one place.
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
