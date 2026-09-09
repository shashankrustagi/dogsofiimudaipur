import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DogVisual } from "../../../components/dog-visual";
import { dogs, getDog } from "../../../lib/dogs";

export function generateStaticParams() {
  return dogs.map((dog) => ({ slug: dog.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const dog = getDog(params.slug);
  return { title: dog?.name ?? "Dog profile", description: dog ? `Meet ${dog.name}, one of the dogs of IIM Udaipur.` : undefined };
}

export default function DogProfile({ params }: { params: { slug: string } }) {
  const dog = getDog(params.slug);
  if (!dog) notFound();

  return (
    <main className="profile-page">
      <div className="profile-top">
        <Link className="back-link" href="/">← All dogs</Link>
        <span className="profile-logo">dogs of <strong>IIMU</strong></span>
      </div>
      <section className="profile-hero page-width">
        <div className="profile-photo">
          <DogVisual name={dog.name} image={dog.image} profile />
          <span className="profile-area">{dog.area}</span>
        </div>
        <div className="profile-intro">
          <p className="eyebrow">Nice to meet you</p>
          <h1>{dog.name}<span>.</span></h1>
          <p className="profile-age">{dog.age} years old · Campus resident</p>
          <div className="status-row">
            <span><i>✓</i> Vaccinated</span>
            <span><i>✓</i> Neutered</span>
          </div>
        </div>
      </section>
      <section className="profile-details page-width">
        <div className="detail-note">
          <p className="eyebrow">A little note</p>
          <blockquote>“{dog.comments}.”</blockquote>
        </div>
        <div className="visit-card">
          <p className="eyebrow">When you see {dog.name}</p>
          <h2>Let them set<br />the pace.</h2>
          <p>Every dog is different. Read their body language, be gentle, and always respect their space.</p>
        </div>
      </section>
      <div className="profile-bottom page-width">
        <Link className="outline-button" href="/">Meet another dog <span>↗</span></Link>
        <p>Profile from the IIM Udaipur campus pack</p>
      </div>
    </main>
  );
}
