import Fuse from "fuse.js";

export const CATEGORY = {
  None: "None",
  Coffee: "Coffee",
  Food: "Food",
  Groceries: "Groceries",
  Transportation: "Transportation",
  Travel: "Travel",
  Entertainment: "Entertainment",
  Shopping: "Shopping",
  Utilities: "Utilities",
  Fun: "Fun",
  Other: "Other",
};

export const CATEGORIES = Object.values(CATEGORY);

type CategoryValue = (typeof CATEGORY)[keyof typeof CATEGORY];

export const COMMON_WORD_CATEGORIES: Record<string, CategoryValue> = {
  // Coffee
  cafe: CATEGORY.Coffee,
  starbucks: CATEGORY.Coffee,
  coffee: CATEGORY.Coffee,
  espresso: CATEGORY.Coffee,
  latte: CATEGORY.Coffee,
  tea: CATEGORY.Coffee,

  // Food
  restaurant: CATEGORY.Food,
  lunch: CATEGORY.Food,
  dinner: CATEGORY.Food,
  breakfast: CATEGORY.Food,
  takeout: CATEGORY.Food,
  food: CATEGORY.Food,
  sushi: CATEGORY.Food,
  pizza: CATEGORY.Food,
  "whole foods": CATEGORY.Food,
  boba: CATEGORY.Food,

  // Groceries
  grocery: CATEGORY.Groceries,
  groceries: CATEGORY.Groceries,
  supermarket: CATEGORY.Groceries,
  market: CATEGORY.Groceries,
  walmart: CATEGORY.Groceries,
  costco: CATEGORY.Groceries,
  safeway: CATEGORY.Groceries,

  // Transportation
  parking: CATEGORY.Transportation,
  gas: CATEGORY.Transportation,
  uber: CATEGORY.Transportation,
  lyft: CATEGORY.Transportation,
  taxi: CATEGORY.Transportation,
  train: CATEGORY.Transportation,
  bus: CATEGORY.Transportation,
  metro: CATEGORY.Transportation,
  subway: CATEGORY.Transportation,

  // Travel
  flight: CATEGORY.Travel,
  plane: CATEGORY.Travel,
  hotel: CATEGORY.Travel,
  airbnb: CATEGORY.Travel,
  booking: CATEGORY.Travel,
  expedia: CATEGORY.Travel,
  vacation: CATEGORY.Travel,
  trip: CATEGORY.Travel,
  travel: CATEGORY.Travel,
  resort: CATEGORY.Travel,
  motel: CATEGORY.Travel,
  hostel: CATEGORY.Travel,
  rental: CATEGORY.Travel,
  cruise: CATEGORY.Travel,

  // Entertainment
  movie: CATEGORY.Entertainment,
  netflix: CATEGORY.Entertainment,
  spotify: CATEGORY.Entertainment,
  concert: CATEGORY.Entertainment,
  theater: CATEGORY.Entertainment,
  game: CATEGORY.Entertainment,

  // Shopping
  amazon: CATEGORY.Shopping,
  target: CATEGORY.Shopping,
  clothes: CATEGORY.Shopping,
  clothing: CATEGORY.Shopping,
  store: CATEGORY.Shopping,
  mall: CATEGORY.Shopping,

  // Utilities
  electricity: CATEGORY.Utilities,
  water: CATEGORY.Utilities,
  internet: CATEGORY.Utilities,
  phone: CATEGORY.Utilities,
  wifi: CATEGORY.Utilities,

  // Fun
  bar: CATEGORY.Fun,
  club: CATEGORY.Fun,
  party: CATEGORY.Fun,
  drinks: CATEGORY.Fun,
};

// Create a Fuse instance for category matching with stricter settings
const categoryFuse = new Fuse(CATEGORIES, {
  threshold: 0.3,
  distance: 10,
  minMatchCharLength: 3,
});

// Create a Fuse instance for common words matching
const commonWordsFuse = new Fuse(Object.keys(COMMON_WORD_CATEGORIES), {
  threshold: 0.3,
  distance: 10,
  minMatchCharLength: 3,
});

export function suggestCategory(name: string): string | null {
  if (!name.trim() || name.length < 3) {
    return null;
  }

  // Split the name into words and convert to lowercase
  const words = name.toLowerCase().split(/\s+/);

  // First try to match any word exactly against our common words dictionary
  for (const word of words) {
    const commonCategory = COMMON_WORD_CATEGORIES[word];
    if (commonCategory) {
      return commonCategory;
    }
  }

  // Then try fuzzy matching each word against common words
  for (const word of words) {
    const fuzzyMatch = commonWordsFuse.search(word)[0];
    if (fuzzyMatch?.item) {
      return COMMON_WORD_CATEGORIES[fuzzyMatch.item] ?? null;
    }
  }

  // If no common word matches, try fuzzy search on the full name against categories
  const searchResult = categoryFuse.search(name)[0];
  return searchResult?.item ?? null;
}
