"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { dogs } from "../../lib/dogs";

const siteUrl = "https://dogsofiimudaipur.vercel.app";

type Code = {
  name: string;
  slug: string;
  url: string;
  dataUrl: string;
};

export default function QRCodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all(
      dogs.map(async (dog) => {
        const url = `${siteUrl}/dogs/${dog.slug}`;
        return {
          name: dog.name,
          slug: dog.slug,
          url,
          dataUrl: await QRCode.toDataURL(url, { width: 720, margin: 2, errorCorrectionLevel: "H" })
        };
      })
    ).then((generatedCodes) => {
      if (active) setCodes(generatedCodes);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="qr-page">
      <header className="qr-header page-width">
        <Link className="back-link" href="/">← All dogs</Link>
        <div>
          <p className="eyebrow">Print-ready directory</p>
          <h1>Dog QR codes<span>.</span></h1>
          <p className="qr-intro">Each code opens that dog&apos;s profile directly. Download individual PNGs or print this whole sheet.</p>
        </div>
        <div className="qr-actions">
          <button className="print-button" onClick={() => window.print()}>Print all codes ↗</button>
          <span>{dogs.length} profiles · Production links</span>
        </div>
      </header>

      <section className="qr-grid page-width">
        {codes.length === 0 && <p className="qr-loading">Preparing QR codes…</p>}
        {codes.map((code) => (
          <article className="qr-card" key={code.slug}>
            <div className="qr-image-wrap">
              <img src={code.dataUrl} alt={`QR code for ${code.name}`} />
            </div>
            <div className="qr-card-info">
              <div>
                <p className="eyebrow">Dogs of IIMU</p>
                <h2>{code.name}</h2>
                <p className="qr-url">{code.url}</p>
              </div>
              <a className="download-button" href={code.dataUrl} download={`${code.name}-QR.png`}>Download PNG ↓</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
