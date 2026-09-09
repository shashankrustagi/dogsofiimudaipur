"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DogVisual } from "../components/dog-visual";
import { areas, dogs } from "../lib/dogs";

export default function HomePage() {
  const [selectedArea, setSelectedArea] = useState("ALL");
  const visibleDogs = useMemo(
    () => (selectedArea === "ALL" ? dogs : dogs.filter((dog) => dog.area === selectedArea)),
    [selectedArea]
  );

  return (
    <main>
      <section className="hero">
        <div className="hero-noise" />
        <nav className="topbar">
          <Link className="brand" href="/">
            <span className="brand-mark">◒</span>
            <span>dogs of <strong>IIMU</strong></span>
          </Link>
          <span className="qr-note">SCAN · MEET · CARE</span>
        </nav>
        <div className="hero-content page-width">
          <p className="eyebrow light">A campus full of good company</p>
          <h1>Every wag has<br /><em>a story.</em></h1>
          <p className="hero-copy">Say hello to the dogs who make IIM Udaipur feel like home. Scan their tag to learn how to say hi.</p>
          <a className="scroll-cue" href="#directory"><span>↓</span> Meet the pack</a>
        </div>
        <div className="hero-scribble" aria-hidden="true">woof!</div>
      </section>

      <section className="directory page-width" id="directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The campus pack</p>
            <h2>Find a friend.</h2>
          </div>
          <span className="count">{visibleDogs.length.toString().padStart(2, "0")} dogs</span>
        </div>
        <div className="filter-row" aria-label="Filter by area">
          <button className={selectedArea === "ALL" ? "filter active" : "filter"} onClick={() => setSelectedArea("ALL")}>All areas</button>
          {areas.map((area) => (
            <button className={selectedArea === area ? "filter active" : "filter"} key={area} onClick={() => setSelectedArea(area)}>
              {area.toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="dog-grid">
          {visibleDogs.map((dog) => (
            <Link className="dog-card" href={`/dogs/${dog.slug}`} key={dog.slug}>
              <div className="card-image">
                <DogVisual name={dog.name} image={dog.image} />
                <span className="area-tag">{dog.area}</span>
                <span className="arrow">↗</span>
              </div>
              <div className="card-info">
                <div>
                  <h3>{dog.name}</h3>
                  <p>{dog.age} years old</p>
                </div>
                <span className="friendly-dot" title="Profile available" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="page-width footer-inner">
          <div><span className="brand-mark">◒</span> Made with care for the IIMU pack.</div>
          <div className="footer-credit">Created by Shashank Rustagi, GSCM&apos;2026 · <a href="mailto:shashankrustagi.gscm2026@iimu.ac.in">shashankrustagi.gscm2026@iimu.ac.in</a></div>
          <div className="footer-small">If you see a dog who needs help, please contact campus security.</div>
        </div>
      </footer>
    </main>
  );
}
