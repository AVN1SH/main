import Footer from "@/components/landing/Footer";
import SarthaksAILanding from "@/components/landing/SarthaksAILanding";
import { getBaseUrl } from "@/utils/getBaseUrl";
import SarthaksAIExplore from "../components/landing/SarthaksAIExplore";

export async function generateMetadata() {
  const baseUrl = await getBaseUrl();
  return {
    title: "Sarthaks AI - Free AI Question Paper Generator | CBSE, BSEB, ICSE",
    description:
      "Generate professional question papers in seconds with Sarthaks AI. Supports CBSE, BSEB, ICSE & all state boards. Chat naturally to create MCQs, case studies & more. Free to use!",

    metadataBase: new URL(baseUrl),

    keywords: [
      "AI question paper generator",
      "Sarthaks AI",
      "auto generated question paper",
      "CBSE paper & test generator",
      "BSEB paper & test generator",
      "ICSE paper & test generator",
      "exam paper maker",
      "test paper generator",
      "create question paper online",
      "free question paper generator",
      "Sarthaks econnect AI",
      "class 10 question paper",
      "class 12 question paper",
      "JEE test generator",
      "NEET test generator",
      "AI test generator",

    ],

    openGraph: {
      title: "Sarthaks AI - Free AI Question Paper and Test Generator",
      description:
        "Generate professional question papers and tests in seconds with Sarthaks AI. Supports CBSE, BSEB, ICSE & all state boards.",
      url: `${baseUrl}/sarthaks-ai`,
      siteName: "Sarthaks eConnect",
      locale: "en_US",
      type: "website",
      images: [
        {
          // url: "/images/sarthaks.png",
          width: 800,
          height: 600,
          alt: "Sarthaks AI - Question Paper and Test Generator",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Sarthaks AI - Free AI Question Paper and Test Generator",
      description:
        "Generate professional question papers and tests in seconds with Sarthaks AI. Supports CBSE, BSEB, ICSE & all state boards.",
      // images: ["/images/sarthaks.png"],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    alternates: {
      canonical: `${baseUrl}/sarthaks-ai`,
    },

    icons: {
      icon: "@/app/favicon.ico",
      shortcut: "@/app/favicon.ico",
      apple: "@/app/favicon.ico",
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sarthaks AI",
  description:
    "AI-powered question paper and mock test generator that helps teachers create professional exam papers and tests in minutes.",
  url: "https://www.sarthaks.com/sarthaks-ai",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "5000",
  },
};

export default function SarthaksAIPage() {
  return (
    <div className="flex flex-col w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* <SarthaksAILanding /> */}
      <SarthaksAIExplore />
      <Footer />
    </div>
  );
}
