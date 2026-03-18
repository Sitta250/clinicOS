/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookings from "../bookings.js";
import type * as clinics from "../clinics.js";
import type * as conversations from "../conversations.js";
import type * as dashboard from "../dashboard.js";
import type * as followUps from "../followUps.js";
import type * as leads from "../leads.js";
import type * as messages from "../messages.js";
import type * as templates from "../templates.js";
import type * as treatments from "../treatments.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  clinics: typeof clinics;
  conversations: typeof conversations;
  dashboard: typeof dashboard;
  followUps: typeof followUps;
  leads: typeof leads;
  messages: typeof messages;
  templates: typeof templates;
  treatments: typeof treatments;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
