export const CONSENT_COOKIE_NAME = "riskly_consent";
export const CONSENT_STORAGE_KEY = "riskly:consent:v1";

export type ConsentStatus = "granted" | "denied";

export function oneYearSeconds() {
  return 60 * 60 * 24 * 365;
}
