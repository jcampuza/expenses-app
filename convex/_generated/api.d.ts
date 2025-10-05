/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as connections from "../connections.js";
import type * as crons from "../crons.js";
import type * as exchangeRates from "../exchangeRates.js";
import type * as expenses from "../expenses.js";
import type * as helpers from "../helpers.js";
import type * as invitations from "../invitations.js";
import type * as queries from "../queries.js";
import type * as user from "../user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  connections: typeof connections;
  crons: typeof crons;
  exchangeRates: typeof exchangeRates;
  expenses: typeof expenses;
  helpers: typeof helpers;
  invitations: typeof invitations;
  queries: typeof queries;
  user: typeof user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
