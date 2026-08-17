// TypeScript interfaces for the Cyber-Sphere data model.

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  zoomLevel: number;
}

export interface Country {
  countryId: string;
  countryName: string;
  isoCode: string;
  flagEmoji: string;
  geo: GeoCoordinates;
  overallStrictnessScore: number;
  colorCode: string;
  primaryAct: string;
  enactedYear: number;
  lastAmendmentYear: number;
  lawStatus: "enacted" | "draft" | "partial";
  enforcementAgency: string;
}

export interface DraftLaw {
  id: number;
  countryId: string;
  billName: string;
  currentStage: string;
  isNotified: boolean;
  keyFocus: string;
}

export interface CrimeMatrixEntry {
  id: number;
  countryId: string;
  categoryId: string;
  crimeName: string;
  legalSection: string;
  maxPrisonTermYears: number;
  maxFineUsd: number;
  isBailable: boolean;
  strictnessRating: number;
  summary: string;
}

export interface AiCyberCrime {
  id: number;
  countryId: string;
  hasDedicatedAiAct: boolean;
  aiRegulationsStatus: string;
  deepfakeRules: {
    applicableSections: string;
    takedownWindowHours: number;
    penalties: string;
  };
  voiceCloningAndSyntheticFraud: {
    status: string;
    strictnessRating: number;
  };
}

export interface CountryDetail extends Country {
  draftLaws: DraftLaw[];
  crimesMatrix: CrimeMatrixEntry[];
  aiCyberCrimes: AiCyberCrime | null;
}

export interface ApiEnvelope<T = unknown> {
  status: boolean;
  statusCode: number;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
}

export interface ComparisonRequest {
  countryIds: string[];
}

export interface SummarizeRequest {
  countryName: string;
  crimeTopic: string;
}

export interface SearchLawRequest {
  query: string;
}
