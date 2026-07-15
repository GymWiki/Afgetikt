import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Afgetikt — de rekening splitsen zonder gedoe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/logo-icon.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f8f7",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(40,80,72,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(144,200,168,0.25) 0%, transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: 40,
            background: "#ffffff",
            boxShadow: "0 24px 48px -12px rgba(40,80,72,0.35)",
          }}
        >
          <img src={logoSrc} width={130} height={130} alt="" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 40,
            fontSize: 88,
            fontWeight: 700,
            color: "#122420",
            letterSpacing: "-0.02em",
          }}
        >
          Afgetikt
          <span style={{ color: "#b34a0a" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 34,
            fontWeight: 500,
            color: "#5c6d68",
          }}
        >
          De rekening splitsen, zonder rekenwerk
        </div>
      </div>
    ),
    { ...size },
  );
}
