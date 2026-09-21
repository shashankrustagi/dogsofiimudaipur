import { Document } from "@langchain/core/documents";
import { dogContacts, dogs } from "../../lib/dogs";

const campusGuide = new Document({
  pageContent: [
    "Dogs of IIM Udaipur helps campus visitors learn about resident dogs.",
    "Read each dog's body language, be gentle, and respect their space.",
    `For an injured, missing, or distressed dog, contact ${dogContacts.map((contact) => `${contact.name} at ${contact.phone}`).join(" or ")}.`
  ].join(" "),
  metadata: { source: "campus-guide" }
});

const dogDocuments = dogs.map(
  (dog) =>
    new Document({
      pageContent: [
        `${dog.name} is a ${dog.age}-year-old campus dog in ${dog.area}.`,
        `Temperament and handling note: ${dog.comments}.`,
        `Vaccinated: ${dog.vaccinated ? "yes" : "no"}. Neutered: ${dog.neutered ? "yes" : "no"}.`
      ].join(" "),
      metadata: { source: "dog-profile", dog: dog.name, area: dog.area }
    })
);

function terms(value: string) {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1);
}

export function retrieveDogDocuments(question: string, limit = 4) {
  const queryTerms = new Set(terms(question));
  const ranked = dogDocuments
    .map((document) => {
      const contentTerms = terms(document.pageContent);
      const score = contentTerms.reduce((total, term) => total + (queryTerms.has(term) ? 1 : 0), 0);
      return { document, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ document }) => document);

  return ranked.length > 0 ? [campusGuide, ...ranked] : [campusGuide, ...dogDocuments.slice(0, limit)];
}

export function formatDocuments(documents: Document[]) {
  return documents.map((document) => `[${document.metadata.source}] ${document.pageContent}`).join("\n");
}