import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { z } from "zod";
import { internal } from "./_generated/api";

const exchangeRatesResponseSchema = z.object({
  success: z.boolean(),
  terms: z.string(),
  privacy: z.string(),
  timestamp: z.number(),
  date: z.string(),
  base: z.string(),
  rates: z.record(z.string(), z.number()),
});

type ExchangeRatesResponse = z.infer<typeof exchangeRatesResponseSchema>;

const SUPPORTED_CURRENCIES = ["EUR", "GBP", "JPY", "MXN", "CAD", "CNY"];

const fetchExchangeRates = async (): Promise<ExchangeRatesResponse> => {
  console.info("fetchExchangeRates start");
  if (!process.env.FX_RATES_API_KEY) {
    throw new Error("FX_RATES_API_KEY environment variable is not set");
  }

  const params = new URLSearchParams({
    base: "USD",
    currencies: SUPPORTED_CURRENCIES.join(","),
    resolution: "1m",
    amount: "1",
    places: "6",
    format: "json",
    api_key: process.env.FX_RATES_API_KEY,
  });

  const response = await fetch(
    `https://api.fxratesapi.com/latest?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch exchange rates: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  const parsed = exchangeRatesResponseSchema.safeParse(data);
  if (parsed.error) {
    throw new Error(
      `Invalid FX Rates API response format: ${parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
    );
  }

  console.info("fetchExchangeRates data parsed", parsed.data);

  return parsed.data;
};

export const storeExchangeRates = internalMutation({
  args: {
    rates: v.array(
      v.object({
        currency: v.string(),
        rate: v.number(),
        date: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    console.info("storeExchangeRates start", args);
    const { rates } = args;

    await Promise.all(
      rates.map((rate) =>
        ctx.db.insert("exchange_rates", {
          currency: rate.currency,
          rate: rate.rate,
          date: rate.date,
        }),
      ),
    );

    console.info("storeExchangeRates success");

    return "success";
  },
});

export const fetchAndStoreExchangeRates = internalAction({
  args: {},
  handler: async (ctx) => {
    console.info("fetchAndStoreExchangeRates start");
    const response = await fetchExchangeRates();

    const { success, rates, date } = response;

    if (!success) {
      throw new Error("Failed to fetch exchange rates");
    }

    console.info("fetchAndStoreExchangeRates rates", rates);

    const ratesToStore = Object.entries(rates).map(([currency, rate]) => ({
      currency,
      rate,
      date,
    }));

    await ctx.runMutation(internal.exchangeRates.storeExchangeRates, {
      rates: ratesToStore,
    });

    console.info("fetchAndStoreExchangeRates success");

    return "success";
  },
});

export const getLatestExchangeRate = query({
  args: { currency: v.string() },
  handler: async (ctx, { currency }) => {
    // USD is the base currency, so it's always 1
    if (currency === "USD") {
      return { currency, rate: 1, date: new Date().toISOString() };
    }

    return await ctx.db
      .query("exchange_rates")
      .withIndex("by_currency_and_date", (q) => q.eq("currency", currency))
      .order("desc")
      .first();
  },
});

// Get all supported currencies
export const getSupportedCurrencies = query({
  args: {},
  handler: async (ctx) => {
    const currencyPromises = SUPPORTED_CURRENCIES.map(async (currency) => {
      const latestRate = await ctx.db
        .query("exchange_rates")
        .withIndex("by_currency_and_date", (q) => q.eq("currency", currency))
        .order("desc")
        .first();

      // Only return currency if we have exchange rate data for it
      if (latestRate) {
        return {
          currency,
          rate: latestRate.rate,
          date: latestRate.date,
        };
      }

      return null;
    });

    const currencyResults = await Promise.all(currencyPromises);

    // Filter out currencies without exchange rates
    const availableCurrencies = currencyResults
      .filter((currency) => currency !== null)
      .sort((a, b) => a.currency.localeCompare(b.currency));

    return [
      { currency: "USD", rate: 1, date: new Date().toISOString() },
      ...availableCurrencies,
    ];
  },
});
