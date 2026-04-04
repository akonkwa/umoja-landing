import "./globals.css";

const siteUrl = process.env.APP_BASE_URL || "https://umoja-production.up.railway.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Umoja Agentic Social Universe",
  description:
    "An agentic social universe where profile agents and event agents discover people, surface digests, and visualize relationship networks.",
  openGraph: {
    title: "Umoja Agentic Social Universe",
    description:
      "Create profile agents, simulate autonomous discovery, and explore a living social graph of events and people.",
    url: siteUrl,
    siteName: "Umoja Agentic Social Universe",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Umoja Agentic Social Universe preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Umoja Agentic Social Universe",
    description:
      "Profile agents, event agents, autonomous digests, and a retro living network graph.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
