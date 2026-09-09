export type Dog = {
  name: string;
  slug: string;
  age: number;
  vaccinated: boolean;
  neutered: boolean;
  comments: string;
  area: string;
  image: string;
};

export const dogContacts = [
  { name: "Shashank Rustagi", phone: "917838559783" },
  { name: "Kirti Mishra", phone: "917290006535" }
] as const;

const rawDogs = [
  ["BRUNO", 8, "Friendly", "HOSTEL"],
  ["PANDA", 5, "Friendly", "HOSTEL"],
  ["SNOWY", 8, "Friendly", "HOSTEL"],
  ["CHOTU", 8, "Friendly", "HOSTEL"],
  ["PAPPU", 8, "Friendly", "HOSTEL"],
  ["MOTU", 8, "Friendly", "HOSTEL"],
  ["JUMPY", 8, "Friendly", "MAIN GATE"],
  ["SHERU", 5, "Friendly but does not like belly rubs", "MAIN GATE"],
  ["RAMANI", 4, "Friendly but takes time", "FACULTY HOUSING"],
  ["DAMANI", 4, "Friendly but takes time", "FACULTY HOUSING"],
  ["FLUFFY", 6, "Scared of humans and dogs, no touch policy", "FACULTY HOUSING"],
  ["SIMBA", 6, "Scared of humans and dogs, no touch policy", "FACULTY HOUSING"],
  ["NIMBA", 6, "Scared of humans and dogs, no touch policy", "FACULTY HOUSING"],
  ["BISCUIT", 5, "Friendly", "FACULTY HOUSING"],
  ["WAFER", 5, "Friendly but takes time, scared of guards", "FACULTY HOUSING"],
  ["CHUTKI", 5, "Scared of humans and dogs, no touch policy", "STAFF HOUSING"],
  ["WHITEY", 8, "Likes to stay alone", "STAFF HOUSING"]
] as const;

export const dogs: Dog[] = rawDogs.map(([name, age, comments, area]) => ({
  name,
  slug: name.toLowerCase(),
  age,
  vaccinated: true,
  neutered: true,
  comments,
  area,
  image: `/dogs/${name}.jpg`
}));

export const areas = [...new Set(dogs.map((dog) => dog.area))];

export function getDog(slug: string) {
  return dogs.find((dog) => dog.slug === slug);
}
