export const LEGAL_INFO = {
  serviceName: "Riskly",
  serviceUrl: "https://riskly.store",
  operatorName: "조현우",
  operatorCountry: "Republic of Korea",
  contactEmail: "gusdndlek12@naver.com",
  supportResponseWindow: "within 7 business days"
} as const;

export const DATA_RETENTION = {
  account: "for the account lifetime and up to 30 days after deletion request",
  analytics: "up to 24 months unless earlier deleted by user request",
  securityLogs: "up to 180 days",
  billingRecords: "up to 5 years or longer if required by tax/accounting laws"
} as const;
