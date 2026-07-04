"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { FormDetails, QuestionPaper } from "@/types/global";
import PaperFormat from "@/components/papers/PaperFormat";

interface StoredPaperData {
  content: QuestionPaper;
  config: FormDetails;
}

const DownloadInPdfPage = () => {
  const [paperData, setPaperData] = useState<StoredPaperData | null>(null);
  const [loading, setLoading] = useState(true);
  const paperContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("downloadPaperData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as StoredPaperData;
        setPaperData(parsed);
      } catch (error) {
        console.error("Error parsing paper data:", error);
      }
    }
    setLoading(false);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: paperContentRef,
    documentTitle: `Question Paper - ${paperData?.config.class} - ${paperData?.config.subject}`,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body::after {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          width: 600px;
          height: 300px;
          background-image: url('/images/sarthaks.png');
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.15;
          filter: grayscale(100%);
          pointer-events: none;
          z-index: 9999;
        }
        .watermark-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .watermark-container img {
          width: 600px;
          height: 200px;
          opacity: 0.15;
          transform: rotate(-15deg);
          filter: grayscale(100%);
        }
        .print-content {
          font-size: 14pt !important;
          line-height: 1.6 !important;
        }
        .print-content h1 {
          font-size: 24pt !important;
        }
        .print-content h2 {
          font-size: 18pt !important;
        }
        .print-content p, .print-content li, .print-content span {
          font-size: 14pt !important;
        }
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `,
  });

  useEffect(() => {
    if (paperData && !loading) {
      // const timer = setTimeout(() => {
        handlePrint();
      // }, 500);
      // return () => clearTimeout(timer);
    }
  }, [paperData, loading, handlePrint]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 w-full">
        <div className="text-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Preparing your PDF...</p>
        </div>
      </div>
    );
  }

  if (!paperData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 w-full">
        <div className="text-center w-full">
          <p className="text-slate-600">No paper data found.</p>
          <p className="text-slate-400 text-sm mt-2">Please generate a paper first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="max-w-3xl mx-auto p-4 md:p-8 w-full">
        <article
          ref={paperContentRef}
          className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-center prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-6 prose-p:text-slate-700 print-content w-full"
        >
          <div className="grayscale fixed -rotate-15 opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 watermark-container scale-150 md:scale-100">
            <img src="/images/sarthaks.png" alt="Watermark" />
          </div>
          <PaperFormat
            data={paperData.content}
            language={paperData.config.language}
          />
        </article>
      </div>
    </div>
  );
};

export default DownloadInPdfPage;
