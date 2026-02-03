const adjectives = [
  "Spicy",
  "Iced",
  "Salty",
  "Cozy",
  "Chaotic",
  "Midnight",
  "Electric",
  "Cosmic",
  "Smoky",
  "Velvet",
  "Bubbly",
  "Neon",
  "Feral",
  "Ghosted",
  "Delulu",
];

const teaTypes = [
  "Matcha",
  "Earl Grey",
  "Oolong",
  "Jasmine",
  "Chai",
  "Genmaicha",
  "Thai Tea",
  "Milk Tea",
  "Bubble Tea",
  "Yerba",
  "Peppermint",
  "Black Tea",
  "Green Tea",
  "Hojicha",
  "London Fog",
];

/**
 * Generates a random Tea-themed username like "Spicy Matcha" or "Salty Earl Grey".
 * This is intentionally non-cryptographic and purely for fun identity display.
 */
export function generateRandomTeaName(): string {
  const adjective =
    adjectives[Math.floor(Math.random() * adjectives.length)] ?? "Mysterious";
  const tea = teaTypes[Math.floor(Math.random() * teaTypes.length)] ?? "Tea";

  return `${adjective} ${tea}`;
}

