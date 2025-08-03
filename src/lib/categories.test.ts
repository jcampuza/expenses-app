import { describe, it, expect } from "bun:test";
import { suggestCategory, CATEGORY } from "./categories";

describe("suggestCategory", () => {
  // Test exact matches from common words dictionary
  it("should match exact words from common dictionary", () => {
    expect(suggestCategory("starbucks")).toBe(CATEGORY.Coffee);
    expect(suggestCategory("walmart")).toBe(CATEGORY.Groceries);
    expect(suggestCategory("netflix")).toBe(CATEGORY.Entertainment);
  });

  // Test case insensitivity
  it("should be case insensitive", () => {
    expect(suggestCategory("STARBUCKS")).toBe(CATEGORY.Coffee);
    expect(suggestCategory("Walmart")).toBe(CATEGORY.Groceries);
    expect(suggestCategory("NetFlix")).toBe(CATEGORY.Entertainment);
  });

  // Test fuzzy matching
  it("should fuzzy match similar words", () => {
    expect(suggestCategory("coffe")).toBe(CATEGORY.Coffee); // Common misspelling
    expect(suggestCategory("entertaiment")).toBe(CATEGORY.Entertainment); // Common misspelling
    expect(suggestCategory("groc")).toBe(CATEGORY.Groceries); // Partial word
  });

  // Test with phrases
  it("should handle multi-word phrases", () => {
    expect(suggestCategory("starbucks coffee")).toBe(CATEGORY.Coffee);
    expect(suggestCategory("walmart groceries")).toBe(CATEGORY.Groceries);
    expect(suggestCategory("going to the movies")).toBe(CATEGORY.Entertainment);
  });

  // Test edge cases
  it("should handle edge cases", () => {
    expect(suggestCategory("")).toBe(null); // Empty string
    expect(suggestCategory("   ")).toBe(null); // Whitespace only
    expect(suggestCategory("a")).toBe(null); // Too short
    expect(suggestCategory("xyz123")).toBe(null); // No match
  });

  // Test threshold behavior
  it("should respect fuzzy matching threshold", () => {
    expect(suggestCategory("coffeeee")).toBe(CATEGORY.Coffee); // Should match
    expect(suggestCategory("coffexxx")).toBe(null); // Too different
  });
});
