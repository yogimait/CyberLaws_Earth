// Seeded JSON database for 3 countries + fetch helpers.
import type {
  Country,
  CountryDetail,
  DraftLaw,
  CrimeMatrixEntry,
  AiCyberCrime,
} from "./types";

const COUNTRIES: Country[] = [
  {
    countryId: "IND",
    countryName: "India",
    isoCode: "IN",
    flagEmoji: "🇮🇳",
    geo: { latitude: 20.5937, longitude: 78.9629, zoomLevel: 2.5 },
    overallStrictnessScore: 7.2,
    colorCode: "#f59e0b",
    primaryAct: "IT Act 2000 & DPDP Act 2023",
    enactedYear: 2000,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "CERT-In / Cyber Crime Coordination Centre (I4C)",
  },
  {
    countryId: "USA",
    countryName: "United States",
    isoCode: "US",
    flagEmoji: "🇺🇸",
    geo: { latitude: 37.0902, longitude: -95.7129, zoomLevel: 2.2 },
    overallStrictnessScore: 8.8,
    colorCode: "#ef4444",
    primaryAct: "CFAA (18 U.S.C. § 1030) & ECPA",
    enactedYear: 1986,
    lastAmendmentYear: 2020,
    lawStatus: "enacted",
    enforcementAgency: "CISA / FBI Cyber Division / FTC",
  },
  {
    countryId: "EU_EST",
    countryName: "Estonia (EU)",
    isoCode: "EE",
    flagEmoji: "🇪🇪",
    geo: { latitude: 58.5953, longitude: 25.0136, zoomLevel: 3.8 },
    overallStrictnessScore: 9.1,
    colorCode: "#dc2626",
    primaryAct: "EU AI Act, EU GDPR & Estonian Cybersecurity Act",
    enactedYear: 2018,
    lastAmendmentYear: 2024,
    lawStatus: "enacted",
    enforcementAgency: "Estonian Information System Authority (RIA) / ENISA",
  },
  {
    countryId: "GBR",
    countryName: "United Kingdom",
    isoCode: "GB",
    flagEmoji: "🇬🇧",
    geo: { latitude: 55.3781, longitude: -3.4360, zoomLevel: 3.5 },
    overallStrictnessScore: 8.4,
    colorCode: "#ef4444",
    primaryAct: "Computer Misuse Act 1990 & UK GDPR / Data Protection Act 2018",
    enactedYear: 1990,
    lastAmendmentYear: 2022,
    lawStatus: "enacted",
    enforcementAgency: "National Cyber Security Centre (NCSC) / ICO",
  },
  {
    countryId: "SGP",
    countryName: "Singapore",
    isoCode: "SG",
    flagEmoji: "🇸🇬",
    geo: { latitude: 1.3521, longitude: 103.8198, zoomLevel: 5.0 },
    overallStrictnessScore: 9.3,
    colorCode: "#dc2626",
    primaryAct: "Computer Misuse Act & Cybersecurity Act 2018",
    enactedYear: 1993,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "Cyber Security Agency of Singapore (CSA)",
  },
  {
    countryId: "CHN",
    countryName: "China",
    isoCode: "CN",
    flagEmoji: "🇨🇳",
    geo: { latitude: 35.8617, longitude: 104.1954, zoomLevel: 2.3 },
    overallStrictnessScore: 9.5,
    colorCode: "#dc2626",
    primaryAct: "Cybersecurity Law 2017 & Data Security Law 2021",
    enactedYear: 2017,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "Cyberspace Administration of China (CAC)",
  },
  {
    countryId: "DEU",
    countryName: "Germany",
    isoCode: "DE",
    flagEmoji: "🇩🇪",
    geo: { latitude: 51.1657, longitude: 10.4515, zoomLevel: 3.5 },
    overallStrictnessScore: 8.6,
    colorCode: "#ef4444",
    primaryAct: "IT Security Act 2.0 & EU GDPR",
    enactedYear: 2015,
    lastAmendmentYear: 2021,
    lawStatus: "enacted",
    enforcementAgency: "BSI (Federal Office for Information Security)",
  },
  {
    countryId: "JPN",
    countryName: "Japan",
    isoCode: "JP",
    flagEmoji: "🇯🇵",
    geo: { latitude: 36.2048, longitude: 138.2529, zoomLevel: 3.2 },
    overallStrictnessScore: 7.0,
    colorCode: "#f59e0b",
    primaryAct: "Act on Prohibition of Unauthorized Computer Access",
    enactedYear: 2000,
    lastAmendmentYear: 2022,
    lawStatus: "enacted",
    enforcementAgency: "National Police Agency / NISC",
  },
  {
    countryId: "BRA",
    countryName: "Brazil",
    isoCode: "BR",
    flagEmoji: "🇧🇷",
    geo: { latitude: -14.2350, longitude: -51.9253, zoomLevel: 2.2 },
    overallStrictnessScore: 6.5,
    colorCode: "#f59e0b",
    primaryAct: "Marco Civil da Internet & LGPD",
    enactedYear: 2014,
    lastAmendmentYear: 2020,
    lawStatus: "enacted",
    enforcementAgency: "Brazilian National Data Protection Authority (ANPD)",
  },
  {
    countryId: "AUS",
    countryName: "Australia",
    isoCode: "AU",
    flagEmoji: "🇦🇺",
    geo: { latitude: -25.2744, longitude: 133.7751, zoomLevel: 2.3 },
    overallStrictnessScore: 8.2,
    colorCode: "#ef4444",
    primaryAct: "Criminal Code Act 1995 (Cybercrime) & Privacy Act 1988",
    enactedYear: 1995,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "Australian Cyber Security Centre (ACSC)",
  },
  {
    countryId: "UAE",
    countryName: "United Arab Emirates",
    isoCode: "AE",
    flagEmoji: "🇦🇪",
    geo: { latitude: 23.4241, longitude: 53.8478, zoomLevel: 3.5 },
    overallStrictnessScore: 9.0,
    colorCode: "#dc2626",
    primaryAct: "Federal Decree-Law No. 34 on Combating Rumours and Cybercrimes",
    enactedYear: 2021,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "UAE Cybersecurity Council / TDRA",
  },
  {
    countryId: "KOR",
    countryName: "South Korea",
    isoCode: "KR",
    flagEmoji: "🇰🇷",
    geo: { latitude: 35.9078, longitude: 127.7669, zoomLevel: 3.5 },
    overallStrictnessScore: 8.7,
    colorCode: "#ef4444",
    primaryAct: "Information and Communications Network Act & Personal Information Protection Act",
    enactedYear: 2001,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "Korea Internet & Security Agency (KISA)",
  },
  {
    countryId: "NGA",
    countryName: "Nigeria",
    isoCode: "NG",
    flagEmoji: "🇳🇬",
    geo: { latitude: 9.0820, longitude: 8.6753, zoomLevel: 3.0 },
    overallStrictnessScore: 4.8,
    colorCode: "#22c55e",
    primaryAct: "Cybercrimes (Prohibition, Prevention, etc.) Act 2015",
    enactedYear: 2015,
    lastAmendmentYear: 2024,
    lawStatus: "enacted",
    enforcementAgency: "Nigeria Computer Emergency Response Team (ngCERT)",
  },
  {
    countryId: "RUS",
    countryName: "Russia",
    isoCode: "RU",
    flagEmoji: "🇷🇺",
    geo: { latitude: 61.5240, longitude: 105.3188, zoomLevel: 1.8 },
    overallStrictnessScore: 8.9,
    colorCode: "#ef4444",
    primaryAct: "Federal Law on Information (No. 149-FZ) & Sovereign Internet Law",
    enactedYear: 2006,
    lastAmendmentYear: 2023,
    lawStatus: "enacted",
    enforcementAgency: "FSB / Roskomnadzor",
  },
  {
    countryId: "ISR",
    countryName: "Israel",
    isoCode: "IL",
    flagEmoji: "🇮🇱",
    geo: { latitude: 31.0461, longitude: 34.8516, zoomLevel: 4.0 },
    overallStrictnessScore: 8.5,
    colorCode: "#ef4444",
    primaryAct: "Computer Law 5755-1995 & Privacy Protection Law",
    enactedYear: 1995,
    lastAmendmentYear: 2022,
    lawStatus: "enacted",
    enforcementAgency: "Israel National Cyber Directorate (INCD)",
  },
];

const DRAFT_LAWS: DraftLaw[] = [
  {
    id: 1,
    countryId: "IND",
    billName: "Digital India Act (DIA)",
    currentStage: "Public Consultation",
    isNotified: false,
    keyFocus:
      "Modern intermediary liability, AI deepfake regulation, and algorithmic accountability.",
  },
  {
    id: 2,
    countryId: "USA",
    billName: "American Privacy Rights Act (APRA)",
    currentStage: "Bill Introduced",
    isNotified: false,
    keyFocus:
      "Comprehensive federal data privacy standard and mandatory AI algorithmic discrimination audits.",
  },
  {
    id: 3,
    countryId: "EU_EST",
    billName: "EU Cyber Resilience Act (Full Enforcement Rollout)",
    currentStage: "Phased Implementation",
    isNotified: false,
    keyFocus:
      "Mandatory security standards and vulnerability reporting for IoT and smart devices.",
  },
  {
    id: 4,
    countryId: "GBR",
    billName: "Online Safety Act (Full Enforcement)",
    currentStage: "Phased Rollout",
    isNotified: false,
    keyFocus:
      "Platform liability for harmful content, age verification mandates, and encrypted messaging oversight.",
  },
  {
    id: 5,
    countryId: "JPN",
    billName: "AI Governance Framework Bill",
    currentStage: "Draft Proposal",
    isNotified: false,
    keyFocus:
      "Voluntary-to-mandatory AI governance standards, transparency requirements for generative AI.",
  },
  {
    id: 6,
    countryId: "BRA",
    billName: "AI Regulation Bill (PL 2338/2023)",
    currentStage: "Senate Committee",
    isNotified: false,
    keyFocus:
      "Risk-based AI classification, algorithmic impact assessments, and automated decision transparency.",
  },
  {
    id: 7,
    countryId: "AUS",
    billName: "Privacy Act Reform Bill",
    currentStage: "Consultation",
    isNotified: false,
    keyFocus:
      "Modernized privacy protections, children's online safety, and expanded enforcement powers.",
  },
];

const CRIMES_MATRIX: CrimeMatrixEntry[] = [
  // India
  {
    id: 101,
    countryId: "IND",
    categoryId: "unauthorized_access",
    crimeName: "Hacking & Unauthorized System Access",
    legalSection: "IT Act Section 43 & Section 66",
    maxPrisonTermYears: 3,
    maxFineUsd: 6000,
    isBailable: true,
    strictnessRating: 6.0,
    summary:
      "Imprisonment up to 3 years or fine up to 5 lakh INR for hacking computer systems.",
  },
  {
    id: 102,
    countryId: "IND",
    categoryId: "financial_fraud",
    crimeName: "Online Identity Theft & Phishing",
    legalSection: "IT Act Section 66C & 66D",
    maxPrisonTermYears: 3,
    maxFineUsd: 1200,
    isBailable: false,
    strictnessRating: 7.0,
    summary:
      "Cheating by personation using computer resources attracts non-bailable imprisonment up to 3 years.",
  },
  {
    id: 103,
    countryId: "IND",
    categoryId: "data_breach",
    crimeName: "Corporate Data Breach / Privacy Violation",
    legalSection: "DPDP Act Section 33",
    maxPrisonTermYears: 0,
    maxFineUsd: 30000000,
    isBailable: true,
    strictnessRating: 8.5,
    summary:
      "Financial penalties up to 250 Crore INR (~$30M) on data fiduciaries failing to take reasonable security measures.",
  },
  // USA
  {
    id: 201,
    countryId: "USA",
    categoryId: "unauthorized_access",
    crimeName: "Hacking & Unauthorized System Access",
    legalSection: "18 U.S.C. § 1030 (CFAA)",
    maxPrisonTermYears: 20,
    maxFineUsd: 250000,
    isBailable: false,
    strictnessRating: 9.2,
    summary:
      "Severe federal felony penalties up to 10-20 years imprisonment for damaging protected computers or critical infrastructure.",
  },
  {
    id: 202,
    countryId: "USA",
    categoryId: "financial_fraud",
    crimeName: "Wire Fraud & Identity Theft",
    legalSection: "18 U.S. Code § 1343 & § 1028A",
    maxPrisonTermYears: 30,
    maxFineUsd: 1000000,
    isBailable: false,
    strictnessRating: 9.5,
    summary:
      "Mandatory 2-year consecutive enhancement for aggravated identity theft; up to 30 years for financial fraud.",
  },
  {
    id: 203,
    countryId: "USA",
    categoryId: "data_breach",
    crimeName: "Corporate Data Breach / Privacy Violation",
    legalSection: "FTC Act Section 5 / State Laws (CCPA/CPRA)",
    maxPrisonTermYears: 0,
    maxFineUsd: 50000000,
    isBailable: true,
    strictnessRating: 8.0,
    summary:
      "State-level statutory damages plus massive civil FTC consent decrees and class-action liabilities.",
  },
  // EU/Estonia
  {
    id: 301,
    countryId: "EU_EST",
    categoryId: "unauthorized_access",
    crimeName: "Hacking & Cyber Terrorism",
    legalSection: "Estonian Penal Code § 206 - § 208",
    maxPrisonTermYears: 12,
    maxFineUsd: 18000000,
    isBailable: false,
    strictnessRating: 9.4,
    summary:
      "Attacking vital digital infrastructure carries up to 12 years imprisonment with stringent liability.",
  },
  {
    id: 302,
    countryId: "EU_EST",
    categoryId: "data_breach",
    crimeName: "Corporate Data Breach / Privacy Violation",
    legalSection: "EU GDPR Article 83",
    maxPrisonTermYears: 0,
    maxFineUsd: 22000000,
    isBailable: true,
    strictnessRating: 9.6,
    summary:
      "Fines up to €20 Million or 4% of global annual turnover, whichever is higher.",
  },
  {
    id: 303,
    countryId: "EU_EST",
    categoryId: "financial_fraud",
    crimeName: "Online Fraud & Digital Forgery",
    legalSection: "Estonian Penal Code § 209-213",
    maxPrisonTermYears: 7,
    maxFineUsd: 500000,
    isBailable: false,
    strictnessRating: 8.8,
    summary:
      "Digital fraud and forgery carry up to 7 years imprisonment under Estonian penal law.",
  },
  // UK
  {
    id: 401,
    countryId: "GBR",
    categoryId: "unauthorized_access",
    crimeName: "Unauthorized Access to Computer Material",
    legalSection: "Computer Misuse Act 1990 § 1-3",
    maxPrisonTermYears: 10,
    maxFineUsd: 150000,
    isBailable: false,
    strictnessRating: 8.5,
    summary:
      "Up to 10 years for unauthorized access with intent to commit further offences or impair computer operation.",
  },
  {
    id: 402,
    countryId: "GBR",
    categoryId: "data_breach",
    crimeName: "Data Protection Violation",
    legalSection: "UK GDPR / Data Protection Act 2018",
    maxPrisonTermYears: 0,
    maxFineUsd: 21000000,
    isBailable: true,
    strictnessRating: 9.0,
    summary:
      "ICO can levy fines up to £17.5 million or 4% of annual worldwide turnover for serious data breaches.",
  },
  // Singapore
  {
    id: 501,
    countryId: "SGP",
    categoryId: "unauthorized_access",
    crimeName: "Unauthorized Access & Cybersecurity Offences",
    legalSection: "Computer Misuse Act § 3-10",
    maxPrisonTermYears: 20,
    maxFineUsd: 50000,
    isBailable: false,
    strictnessRating: 9.5,
    summary:
      "Up to 20 years for critical infrastructure attacks; mandatory reporting under Cybersecurity Act.",
  },
  // China
  {
    id: 601,
    countryId: "CHN",
    categoryId: "unauthorized_access",
    crimeName: "Illegal Intrusion into Computer Systems",
    legalSection: "Criminal Law Art. 285-287",
    maxPrisonTermYears: 15,
    maxFineUsd: 500000,
    isBailable: false,
    strictnessRating: 9.7,
    summary:
      "Severe penalties for hacking state systems; 7-15 years for critical infrastructure attacks.",
  },
  {
    id: 602,
    countryId: "CHN",
    categoryId: "data_breach",
    crimeName: "Data Security & Cross-border Transfer Violations",
    legalSection: "Data Security Law 2021 & PIPL",
    maxPrisonTermYears: 0,
    maxFineUsd: 7500000,
    isBailable: true,
    strictnessRating: 9.3,
    summary:
      "Fines up to ¥50M; potential criminal liability for cross-border data transfer violations.",
  },
  // Germany
  {
    id: 701,
    countryId: "DEU",
    categoryId: "unauthorized_access",
    crimeName: "Computer Fraud & Data Espionage",
    legalSection: "StGB § 202a-202d, § 303a-303b",
    maxPrisonTermYears: 10,
    maxFineUsd: 200000,
    isBailable: false,
    strictnessRating: 8.8,
    summary:
      "Up to 10 years for data espionage and computer sabotage targeting critical infrastructure.",
  },
  // Japan
  {
    id: 801,
    countryId: "JPN",
    categoryId: "unauthorized_access",
    crimeName: "Unauthorized Computer Access",
    legalSection: "Unauthorized Access Prohibition Act Art. 3-4",
    maxPrisonTermYears: 3,
    maxFineUsd: 7500,
    isBailable: true,
    strictnessRating: 6.0,
    summary:
      "Up to 3 years imprisonment or ¥1M fine for unauthorized access; lighter than Western counterparts.",
  },
  // Brazil
  {
    id: 901,
    countryId: "BRA",
    categoryId: "unauthorized_access",
    crimeName: "Invasion of Computer Devices",
    legalSection: "Penal Code Art. 154-A (Carolina Dieckmann Law)",
    maxPrisonTermYears: 5,
    maxFineUsd: 20000,
    isBailable: true,
    strictnessRating: 5.5,
    summary:
      "1-5 years for invasion of computer devices; enhanced penalties if economic damage results.",
  },
  // Australia
  {
    id: 1001,
    countryId: "AUS",
    categoryId: "unauthorized_access",
    crimeName: "Unauthorized Access & Modification",
    legalSection: "Criminal Code Act 1995 Part 10.7",
    maxPrisonTermYears: 10,
    maxFineUsd: 100000,
    isBailable: false,
    strictnessRating: 8.5,
    summary:
      "Up to 10 years for unauthorized access to restricted data; enhanced for Commonwealth computers.",
  },
  // UAE
  {
    id: 1101,
    countryId: "UAE",
    categoryId: "unauthorized_access",
    crimeName: "Illegal Access to Information Systems",
    legalSection: "Federal Decree-Law No. 34 Art. 2-4",
    maxPrisonTermYears: 15,
    maxFineUsd: 1500000,
    isBailable: false,
    strictnessRating: 9.2,
    summary:
      "Heavy fines (AED 500K-2M) and 10-15 years for attacking government/critical infrastructure systems.",
  },
  // South Korea
  {
    id: 1201,
    countryId: "KOR",
    categoryId: "unauthorized_access",
    crimeName: "Unauthorized Access & Network Intrusion",
    legalSection: "Information and Communications Network Act Art. 48-49",
    maxPrisonTermYears: 7,
    maxFineUsd: 50000,
    isBailable: false,
    strictnessRating: 8.5,
    summary:
      "Up to 7 years for network intrusion; enhanced penalties for damaging public infrastructure.",
  },
  // Nigeria
  {
    id: 1301,
    countryId: "NGA",
    categoryId: "unauthorized_access",
    crimeName: "Cybercrime Offences",
    legalSection: "Cybercrimes Act 2015 Part III",
    maxPrisonTermYears: 5,
    maxFineUsd: 15000,
    isBailable: true,
    strictnessRating: 4.5,
    summary:
      "3-5 years for unauthorized access; enforcement remains a challenge with limited cyber court capacity.",
  },
  // Russia
  {
    id: 1401,
    countryId: "RUS",
    categoryId: "unauthorized_access",
    crimeName: "Unauthorized Access to Computer Information",
    legalSection: "Criminal Code Art. 272-274",
    maxPrisonTermYears: 7,
    maxFineUsd: 30000,
    isBailable: false,
    strictnessRating: 8.0,
    summary:
      "Up to 7 years for unauthorized access; enhanced penalties when state security systems are targeted.",
  },
  // Israel
  {
    id: 1501,
    countryId: "ISR",
    categoryId: "unauthorized_access",
    crimeName: "Computer Offences",
    legalSection: "Computer Law 5755-1995 § 2-6",
    maxPrisonTermYears: 5,
    maxFineUsd: 75000,
    isBailable: false,
    strictnessRating: 8.0,
    summary:
      "Up to 5 years for unauthorized access; Israel's strong cyber capabilities inform strict enforcement.",
  },
];

const AI_CYBER_CRIMES: AiCyberCrime[] = [
  {
    id: 1,
    countryId: "IND",
    hasDedicatedAiAct: false,
    aiRegulationsStatus: "partially_regulated_under_existing_laws",
    deepfakeRules: {
      applicableSections:
        "IT Rules 2021 (Rule 3(1)(b)) + IT Act Sec 66E / 67",
      takedownWindowHours: 24,
      penalties:
        "Intermediaries lose Safe Harbor protection; up to 3-5 years jail for non-consensual deepfake pornography.",
    },
    voiceCloningAndSyntheticFraud: {
      status:
        "Treated under Section 66D (Cheating by impersonation).",
      strictnessRating: 6.5,
    },
  },
  {
    id: 2,
    countryId: "USA",
    hasDedicatedAiAct: false,
    aiRegulationsStatus: "executive_order_and_state_level",
    deepfakeRules: {
      applicableSections:
        "State laws (California AB 602 / Texas SB 751) & Federal DEEPFAKES Accountability Act drafts",
      takedownWindowHours: 48,
      penalties:
        "Civil damages + criminal misdemeanor/felony if targeting elections or non-consensual imagery.",
    },
    voiceCloningAndSyntheticFraud: {
      status:
        "Prosecuted aggressively under federal wire fraud and identity theft statutes.",
      strictnessRating: 8.9,
    },
  },
  {
    id: 3,
    countryId: "EU_EST",
    hasDedicatedAiAct: true,
    aiRegulationsStatus: "strictly_enforced_eu_ai_act",
    deepfakeRules: {
      applicableSections:
        "EU AI Act Article 50 (Transparency Obligations)",
      takedownWindowHours: 12,
      penalties:
        "Fines up to €35 Million or 7% of worldwide annual turnover for banned AI practices; mandatory watermarking.",
    },
    voiceCloningAndSyntheticFraud: {
      status:
        "High-risk AI category; strict biometric audit requirements and criminal fraud liability.",
      strictnessRating: 9.8,
    },
  },
  {
    id: 4,
    countryId: "GBR",
    hasDedicatedAiAct: false,
    aiRegulationsStatus: "pro_innovation_framework",
    deepfakeRules: {
      applicableSections:
        "Online Safety Act 2023 + Criminal Justice Bill (intimate image deepfakes)",
      takedownWindowHours: 24,
      penalties:
        "Criminal offense for sharing intimate deepfakes; platform liability under Online Safety Act.",
    },
    voiceCloningAndSyntheticFraud: {
      status:
        "Prosecuted under Fraud Act 2006; growing regulatory focus on synthetic media.",
      strictnessRating: 7.5,
    },
  },
  {
    id: 5,
    countryId: "SGP",
    hasDedicatedAiAct: false,
    aiRegulationsStatus: "voluntary_ai_governance_framework",
    deepfakeRules: {
      applicableSections:
        "Protection from Online Falsehoods and Manipulation Act (POFMA)",
      takedownWindowHours: 6,
      penalties:
        "POFMA correction/takedown orders; up to 10 years for malicious deepfake distribution.",
    },
    voiceCloningAndSyntheticFraud: {
      status:
        "Covered under Computer Misuse Act and Penal Code fraud provisions.",
      strictnessRating: 9.0,
    },
  },
  {
    id: 6,
    countryId: "CHN",
    hasDedicatedAiAct: true,
    aiRegulationsStatus: "comprehensive_ai_regulation",
    deepfakeRules: {
      applicableSections:
        "Deep Synthesis Provisions 2023 & Generative AI Measures",
      takedownWindowHours: 4,
      penalties:
        "Mandatory watermarking, real-name registration; severe penalties for unlabeled synthetic content.",
    },
    voiceCloningAndSyntheticFraud: {
      status:
        "Strictly regulated; all synthetic voice content must be labeled and traceable.",
      strictnessRating: 9.5,
    },
  },
];

// Data access helpers — use local JSON, fall back to Supabase if configured.
export function listCountries(): Country[] {
  return COUNTRIES;
}

export function getCountryById(countryId: string): CountryDetail | null {
  const country = COUNTRIES.find((c) => c.countryId === countryId);
  if (!country) return null;

  return {
    ...country,
    draftLaws: DRAFT_LAWS.filter((d) => d.countryId === countryId),
    crimesMatrix: CRIMES_MATRIX.filter((c) => c.countryId === countryId),
    aiCyberCrimes:
      AI_CYBER_CRIMES.find((a) => a.countryId === countryId) ?? null,
  };
}

export function getCountriesForComparison(
  countryIds: string[]
): CountryDetail[] {
  return countryIds
    .map((id) => getCountryById(id))
    .filter((c): c is CountryDetail => c !== null);
}

export function searchCountries(query: string): Country[] {
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(
    (c) =>
      c.countryName.toLowerCase().includes(lowerQuery) ||
      c.countryId.toLowerCase().includes(lowerQuery) ||
      c.primaryAct.toLowerCase().includes(lowerQuery)
  );
}

export function getAllCountryDetails(): CountryDetail[] {
  return COUNTRIES.map((c) => getCountryById(c.countryId) as CountryDetail);
}
