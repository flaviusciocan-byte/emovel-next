import type { Metadata } from "next";

export const siteUrl = "https://emovel-next.vercel.app";

export const siteName = "EMOVEL";

export const defaultTitle =
  "EMOVEL — Controlled Systems for Digital Products";

export const defaultDescription =
  "EMOVEL is a premium execution ecosystem for building controlled AI systems, prompt engines, assistants, documentation, and monetizable digital products.";

export const ogImage = "/assets/backgrounds/home-hero.png";

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = path === "/" ? siteUrl : `${siteUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [
        {
          url: ogImage,
          alt: `${siteName} digital product ecosystem`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
};

export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "EMOVEL builds controlled systems that turn ideas into structured, monetizable digital products.",
};
