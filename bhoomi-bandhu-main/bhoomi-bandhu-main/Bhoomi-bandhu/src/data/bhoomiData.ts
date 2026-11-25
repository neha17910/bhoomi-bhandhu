export interface SchemeItem {
  id: string;
  name: string;
  shortName: string;
  category:
    | "Income Support"
    | "Crop Insurance"
    | "Soil & Inputs"
    | "Loan & Credit"
    | "Equipment & Irrigation";
  summary: string;
  ministry: string;
  benefitHighlight: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  howToApply: string[];
  officialUrl: string;
  eligibleStates: string[];
  maxLandAcres: number | null;
  targetNeeds: string[];
}

export type ContentAudience = "farmer" | "warehouse_owner" | "both";

export interface InsurancePlan {
  id: string;
  name: string;
  category: string;
  audience?: ContentAudience;
  summary: string;
  eligibility: string[];
  premiumAndCoverage: string[];
  documents: string[];
  howToApply: string[];
  officialUrl: string;
}

export interface LoanOption {
  id: string;
  name: string;
  provider: string;
  loanType:
    | "Crop Loan"
    | "Equipment Loan"
    | "Infrastructure Loan"
    | "Allied Agri Loan"
    | "Warehouse Construction"
    | "Warehouse Running Capital"
    | "Land Purchase Loan";
  audience?: ContentAudience;
  summary: string;
  interestSummary: string;
  eligibility: string[];
  repaymentTerms: string[];
  documents: string[];
  howToApply: string[];
  officialUrl: string;
}

export interface WarehouseItem {
  id: string;
  ownerId: string;
  name: string;
  cityState: string;
  distanceKm: number;
  totalCapacityMt: number;
  availableCapacityMt: number;
  pricePerQuintalMonth: number;
  rating: number;
  facilities: string[];
  description: string;
  status: "active" | "paused";
  mapX: number;
  mapY: number;
  isCatalog?: boolean;
}

export interface WellbeingArticle {
  id: string;
  title: string;
  topic: string;
  readTime: string;
  summary: string;
  paragraphs: string[];
  practicalSteps: string[];
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface PartnerCompanyItem {
  id: string;
  name: string;
  category: "loan" | "insurance";
  audience?: ContentAudience;
  interestOrPremium: string;
  coverageOrLimit: string;
  eligibilitySummary: string;
  contactHelpline: string;
  websiteUrl?: string;
  status: "active" | "paused";
  createdBy: string;
}

export interface PsychiatristProfileItem {
  id: string;
  userId: string;
  name: string;
  qualification: string;
  specialization: string;
  languages: string[];
  experienceYears: number;
  state: string;
  bio: string;
  availableForConsult: boolean;
  consultMode?:
    | "Audio & Video"
    | "Audio Call Only"
    | "Video Call Only"
    | "Chat & Audio";
  sessionDurationMins?: 20 | 30 | 45;
  preferredSlots?: string[];
}

export const INDIAN_STATES = [
  "All India",
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Andhra Pradesh",
  "Bihar",
  "West Bengal",
  "Odisha",
  "Kerala",
  "Assam",
  "Chhattisgarh",
  "Jharkhand",
  "Himachal Pradesh",
  "Uttarakhand",
];

export const SCHEMES_DATA: SchemeItem[] = [
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    shortName: "PM-KISAN",
    category: "Income Support",
    summary:
      "Direct income support of Rs. 6,000 per year in three equal installments to eligible landholding farmer families.",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefitHighlight: "Rs. 6,000 / year directly to Aadhaar-linked bank account",
    eligibility: [
      "Cultivable landholding farmer families across India (husband, wife, and minor children).",
      "Land records must be updated in the state land registry.",
      "Aadhaar number linked with an active bank account and e-KYC completed.",
      "Institutional landholders and income-tax payers are excluded.",
    ],
    benefits: [
      "Rs. 2,000 transferred every 4 months (Rs. 6,000 annually) via Direct Benefit Transfer (DBT).",
      "Funds can be used freely for seeds, fertilizers, or household farm needs.",
    ],
    documents: [
      "Aadhaar Card",
      "Land Ownership Record (Khatauni / RoR / 7-12 Extract)",
      "Bank Passbook with IFSC code",
      "Active Mobile Number for OTP e-KYC",
    ],
    howToApply: [
      "Visit the official PM-KISAN portal (pmkisan.gov.in) or visit your nearest Common Service Centre (CSC).",
      "Select 'New Farmer Registration' and enter your Aadhaar number and state.",
      "Upload or enter landholding details (Khata/Survey number) and bank account details.",
      "Complete OTP or biometric e-KYC so installments are released smoothly.",
    ],
    officialUrl: "https://pmkisan.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: null,
    targetNeeds: ["income", "all"],
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    shortName: "PMFBY Crop Insurance",
    category: "Crop Insurance",
    summary:
      "Affordable crop insurance covering yield losses from drought, flood, hailstorm, pests, and post-harvest damage.",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefitHighlight: "Farmer pays max 2% Kharif, 1.5% Rabi, 5% commercial crop premium",
    eligibility: [
      "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
      "Both loanee farmers (with KCC) and non-loanee farmers can enroll voluntarily.",
      "Must enroll before the seasonal cut-off date announced by the state.",
    ],
    benefits: [
      "Low capped farmer premium: 2% for Kharif crops, 1.5% for Rabi crops, 5% for horticulture/commercial crops.",
      "Remaining actuarial premium is subsidized jointly by Central and State Governments.",
      "Covers prevented sowing, standing crop loss, localized calamities (hailstorm/landslide), and post-harvest losses up to 14 days.",
    ],
    documents: [
      "Aadhaar Card",
      "Bank Account Details",
      "Land Possession Certificate / Tenancy Agreement",
      "Sowing Certificate from Patwari / Panchayat (where applicable)",
    ],
    howToApply: [
      "Visit pmfby.gov.in, your nearest bank branch, PACS, or CSC center before the season deadline.",
      "Select your state, season (Kharif/Rabi), district, and notified crop.",
      "Pay only the subsidized farmer share of the premium and collect your policy receipt.",
      "Report localized crop damage within 72 hours via the Krishi Rakshak helpline (14447) or Crop Insurance App.",
    ],
    officialUrl: "https://pmfby.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: null,
    targetNeeds: ["insurance", "all"],
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme",
    shortName: "Soil Health Card",
    category: "Soil & Inputs",
    summary:
      "Free soil testing every 2 years with crop-wise fertilizer recommendations to cut input costs and boost soil fertility.",
    ministry: "Department of Agriculture & Farmers Welfare",
    benefitHighlight: "Free lab testing of 12 soil parameters + fertilizer dosage guide",
    eligibility: [
      "All farmers owning or cultivating agricultural land in India.",
      "Samples are collected per grid (2.5 ha irrigated / 10 ha rainfed) or individual request at local KVK.",
    ],
    benefits: [
      "Measures N, P, K, Sulphur, pH, EC, Organic Carbon, and 5 micronutrients.",
      "Prevents overuse of expensive chemical urea/DAP by giving exact crop-specific dosages.",
    ],
    documents: [
      "Aadhaar Card",
      "Mobile Number",
      "Farm Survey / Khasra Number",
    ],
    howToApply: [
      "Contact your local Krishi Vigyan Kendra (KVK), Village Agriculture Worker, or soil testing lab.",
      "Submit a soil sample collected from 15 cm depth across 4-5 spots in your field.",
      "Download your printed or digital Soil Health Card from soilhealth.dac.gov.in using your mobile number.",
    ],
    officialUrl: "https://soilhealth.dac.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: null,
    targetNeeds: ["soil", "all"],
  },
  {
    id: "kcc-scheme",
    name: "Kisan Credit Card (KCC) Interest Subvention",
    shortName: "Kisan Credit Card",
    category: "Loan & Credit",
    summary:
      "Timely working capital loans for seeds, fertilizers, and allied activities at an effective 4% interest rate on prompt repayment.",
    ministry: "Ministry of Finance & NABARD",
    benefitHighlight: "Up to Rs. 3 Lakh short-term crop credit at 4% effective interest",
    eligibility: [
      "Individual or joint farmers who are owner-cultivators.",
      "Tenant farmers, oral lessees, and sharecroppers, plus SHGs/JLGs of farmers.",
      "Also extended to dairy, poultry, and fisheries farmers.",
    ],
    benefits: [
      "Base 7% interest rate with 3% Prompt Repayment Incentive, making effective interest just 4% per annum up to Rs. 3 Lakh.",
      "Collateral-free crop loans up to Rs. 1.60 Lakh (up to Rs. 2 Lakh under revised RBI norms).",
      "Flexible RuPay KCC card for ATM and input-dealer withdrawals.",
    ],
    documents: [
      "Completed KCC Application Form",
      "Aadhaar Card & PAN / Voter ID",
      "Land Records (Khatauni / 7-12)",
      "2 Passport-size Photographs",
    ],
    howToApply: [
      "Visit your nearest Public Sector Bank, Regional Rural Bank, or Cooperative Bank, or apply via JanSamarth portal.",
      "Submit identity proof, land records, and crop cultivation plan.",
      "Once verified, the bank sanctions your KCC limit based on District Scale of Finance.",
    ],
    officialUrl: "https://www.jansamarth.in/",
    eligibleStates: ["All India"],
    maxLandAcres: null,
    targetNeeds: ["loan", "all"],
  },
  {
    id: "pm-kusum",
    name: "PM-KUSUM Solar Pump & Power Subsidy",
    shortName: "PM-KUSUM",
    category: "Equipment & Irrigation",
    summary:
      "Up to 60% government subsidy for installing standalone solar agricultural water pumps or solarizing grid pumps.",
    ministry: "Ministry of New and Renewable Energy",
    benefitHighlight: "60% combined Central & State subsidy + 30% bank loan support",
    eligibility: [
      "Individual farmers, farmer producer organizations (FPOs), panchayats, and water user associations.",
      "Priority often given to small/marginal farmers using micro-irrigation.",
    ],
    benefits: [
      "Reduces diesel and daytime electricity bills with reliable daytime solar irrigation.",
      "30% Central subsidy + 30% State subsidy; farmer contributes only 10% upfront (30% via bank loan).",
      "Surplus solar power on grid-connected pumps can be sold back to DISCOMs.",
    ],
    documents: [
      "Aadhaar Card",
      "Land Record showing water source / borewell",
      "Bank Account Passbook",
      "Passport-size Photograph",
    ],
    howToApply: [
      "Check your State Renewable Energy Nodal Agency portal (linked via pmkusum.mnre.gov.in).",
      "Apply online with pump capacity requirement (2 HP to 7.5 HP) and land details.",
      "Deposit your beneficiary share only after receiving official state approval.",
    ],
    officialUrl: "https://pmkusum.mnre.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: null,
    targetNeeds: ["equipment", "irrigation", "all"],
  },
  {
    id: "pmksy-drip",
    name: "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
    shortName: "PMKSY Micro-Irrigation",
    category: "Equipment & Irrigation",
    summary:
      "Financial assistance of 45% to 55% for installing drip and sprinkler irrigation systems to save water and boost yield.",
    ministry: "Department of Agriculture & Farmers Welfare",
    benefitHighlight: "55% subsidy for small/marginal farmers; 45% for other farmers",
    eligibility: [
      "Farmers with valid cultivable land and a water source (well, borewell, pond, or canal).",
      "Small and marginal farmers receive higher 55% subsidy tier.",
    ],
    benefits: [
      "Saves 30% to 50% irrigation water compared to flood irrigation.",
      "Improves crop quality in horticulture, sugarcane, cotton, and vegetable fields.",
    ],
    documents: [
      "Aadhaar Card",
      "Land Record (7/12, RoR, or Khatauni)",
      "Bank Passbook",
      "Quotation from approved drip/sprinkler vendor",
    ],
    howToApply: [
      "Register on your State Agriculture / Horticulture DBT portal (e.g. MahaDBT, UP Agriculture, RajKisan).",
      "Select Micro-Irrigation component and submit land details.",
      "Install equipment from an empaneled supplier after inspection approval.",
    ],
    officialUrl: "https://pmksy.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: 12,
    targetNeeds: ["equipment", "irrigation", "all"],
  },
  {
    id: "pkvy-organic",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    shortName: "PKVY Organic Farming",
    category: "Soil & Inputs",
    summary:
      "Cluster-based support of Rs. 31,500 to Rs. 50,000 per hectare over 3 years for farmers adopting chemical-free organic farming.",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefitHighlight: "Cluster support + DBT input assistance & PGS-India certification",
    eligibility: [
      "Farmers forming a local cluster of at least 20 hectares (typically 20+ farmers).",
      "Open to small and marginal farmers transitioning to organic methods.",
    ],
    benefits: [
      "Direct support for organic seeds, bio-fertilizers, vermicompost, and neem-based pest control.",
      "Free PGS-India organic certification and branding support to earn better mandi prices.",
    ],
    documents: [
      "Aadhaar Card",
      "Land Record",
      "Cluster Group Resolution / FPO details",
      "Bank Account Details",
    ],
    howToApply: [
      "Approach your District Agriculture Office or local FPO to join or form a 20-hectare cluster.",
      "Register the cluster on pgsindia-ncof.gov.in through the Regional Council.",
    ],
    officialUrl: "https://pgsindia-ncof.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: 15,
    targetNeeds: ["soil", "income", "all"],
  },
  {
    id: "e-nam",
    name: "National Agriculture Market (e-NAM)",
    shortName: "e-NAM Mandi Platform",
    category: "Income Support",
    summary:
      "Pan-India electronic trading portal connecting APMC mandis for transparent auction pricing and direct bank settlement.",
    ministry: "Small Farmers' Agribusiness Consortium (SFAC)",
    benefitHighlight: "Transparent online bidding across 1,389+ linked mandis",
    eligibility: [
      "Any farmer selling notified agricultural produce in an e-NAM linked APMC mandi.",
    ],
    benefits: [
      "Access multiple buyers beyond local commission agents for fairer price discovery.",
      "Free assaying/quality testing at mandi labs and direct online payment to bank account.",
    ],
    documents: [
      "Aadhaar Card",
      "Bank Passbook with IFSC",
      "Mobile Number",
    ],
    howToApply: [
      "Register online at enam.gov.in or at your nearest e-NAM APMC mandi gate.",
      "Bring produce for quality assaying, receive lot ID, and accept the highest e-auction bid.",
    ],
    officialUrl: "https://www.enam.gov.in/",
    eligibleStates: ["All India"],
    maxLandAcres: null,
    targetNeeds: ["income", "all"],
  },
];

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: "pmfby-plan",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    category: "Yield-Based Crop Insurance",
    audience: "farmer",
    summary:
      "India's primary crop insurance shield protecting farmers against natural calamities, pests, and post-harvest losses at ultra-low premiums.",
    eligibility: [
      "All farmers (owner-cultivators, sharecroppers, and tenant farmers) growing notified crops.",
      "Both loanee and non-loanee farmers can enroll voluntarily.",
    ],
    premiumAndCoverage: [
      "Kharif Food & Oilseed Crops: Maximum 2.0% of Sum Insured paid by farmer.",
      "Rabi Food & Oilseed Crops: Maximum 1.5% of Sum Insured paid by farmer.",
      "Annual Commercial & Horticultural Crops: Maximum 5.0% paid by farmer.",
      "Covers pre-sowing failure, standing crop damage, unseasonal rain, hailstorm, and post-harvest losses up to 14 days for cut-and-spread crops.",
    ],
    documents: [
      "Aadhaar Card",
      "Bank Passbook",
      "Land Record (RoR / Khatauni) or Tenant Agreement",
      "Sowing Declaration Form",
    ],
    howToApply: [
      "Apply on pmfby.gov.in, via the Crop Insurance Mobile App, at a CSC center, or through your bank branch before the state cut-off date.",
      "If localized weather damage occurs, report within 72 hours on the app or call 14447.",
    ],
    officialUrl: "https://pmfby.gov.in/",
  },
  {
    id: "rwbcis-plan",
    name: "Restructured Weather Based Crop Insurance Scheme (RWBCIS)",
    category: "Weather-Index Insurance",
    audience: "farmer",
    summary:
      "Uses local weather station measurements (rainfall, temperature, frost, humidity) to trigger faster payouts when adverse weather hits crops.",
    eligibility: [
      "Farmers cultivating notified crops in districts/blocks where RWBCIS is implemented by the State Government.",
    ],
    premiumAndCoverage: [
      "Same low farmer premium caps as PMFBY (2% Kharif, 1.5% Rabi, 5% commercial/horticulture).",
      "Payouts are calculated automatically from verified weather-index deviations without waiting for lengthy crop-cutting experiments.",
    ],
    documents: [
      "Aadhaar Card",
      "Bank Passbook",
      "Landholding / Tenancy Proof",
    ],
    howToApply: [
      "Check if your district notifies RWBCIS for horticulture or seasonal crops on pmfby.gov.in.",
      "Enroll via your cooperative bank, CSC, or the official portal.",
    ],
    officialUrl: "https://pmfby.gov.in/",
  },
  {
    id: "cpis-plan",
    name: "Coconut Palm Insurance Scheme (CPIS)",
    category: "Perennial Plantation Insurance",
    audience: "farmer",
    summary:
      "Protects coconut growers against total loss of palms caused by cyclones, floods, severe drought, and uncontrollable pests.",
    eligibility: [
      "Farmers owning at least 5 healthy nut-bearing coconut palms in contiguous plots in coconut-growing states.",
    ],
    premiumAndCoverage: [
      "Covers palms aged 4 to 60 years; 50% premium subsidized by Coconut Development Board and 25% by State Government.",
      "Farmer pays only 25% of the low annual per-palm premium.",
    ],
    documents: [
      "Aadhaar Card",
      "Land Ownership Record",
      "Palm Count Declaration",
    ],
    howToApply: [
      "Contact your State Horticulture Officer or Coconut Development Board regional office.",
    ],
    officialUrl: "https://www.coconutboard.gov.in/",
  },
  {
    id: "wh-property-fire-plan",
    name: "Commercial Warehouse Building, Fire & Standard Perils Insurance",
    category: "Warehouse Building & Running Cover",
    audience: "warehouse_owner",
    summary:
      "Comprehensive commercial property protection for grain godowns, pre-engineered sheds, weighbridges, solar roofs, and office blocks against fire, storm, and flood.",
    eligibility: [
      "Registered warehouse owners, partnership firms, cold-storage operators, and WDRA-compliant godowns.",
      "Applicable for both owned commercial plots and long-term leased industrial storage facilities.",
    ],
    premiumAndCoverage: [
      "Covers building superstructure, RCC flooring, boundary walls, loading docks, and firefighting installations.",
      "Protects against fire, lightning, explosion, storm, cyclone, flood, inundation, and impact damage.",
      "Optional add-ons for burglary, debris removal, and rent/revenue loss during repair.",
    ],
    documents: [
      "GST Registration & Business PAN",
      "Warehouse Property Ownership / Registered Lease Deed",
      "Fire Safety NOC & Asset Valuation Summary",
    ],
    howToApply: [
      "Share total built-up area (sq. ft.), construction type (RCC/PEB), and asset sum insured with an empaneled commercial insurer.",
      "Schedule a pre-policy risk inspection for preferred commercial rates on WDRA-compliant godowns.",
    ],
    officialUrl: "https://www.newindia.co.in/",
  },
  {
    id: "wh-deterioration-machinery-plan",
    name: "Cold Storage Machinery Breakdown & Deterioration of Stock (DOS)",
    category: "Operations & Cold-Chain Cover",
    audience: "warehouse_owner",
    summary:
      "Dual operational shield covering refrigeration compressors, DG backup sets, and stored produce spoilage caused by sudden temperature failure.",
    eligibility: [
      "Commercial cold storages, controlled-atmosphere chambers, and multi-commodity agro-warehouses.",
      "Requires routine maintenance logbooks and calibrated temperature sensors.",
    ],
    premiumAndCoverage: [
      "Reimburses repair or replacement cost of compressors, condensers, chillers, transformers, and electrical panels.",
      "Covers financial loss of stored commodities if sudden machinery breakdown triggers temperature rise beyond safe thresholds.",
    ],
    documents: [
      "Machinery Asset Schedule & Invoice Values",
      "Annual Maintenance Contract (AMC) or Service Records",
      "Cold Chamber Capacity & Stock Register",
    ],
    howToApply: [
      "Submit equipment inventory and peak stock valuation to a commercial general insurer.",
      "Bundle Machinery Breakdown + DOS in one commercial policy to lower annual premium.",
    ],
    officialUrl: "https://www.icicilombard.com/",
  },
  {
    id: "wh-liability-stock-plan",
    name: "Warehouseman Legal Liability & Stored Inventory Policy",
    category: "Stored Stock & Liability Cover",
    audience: "warehouse_owner",
    summary:
      "Protects warehouse operators against third-party farmer stock claims, theft, moisture ingress, and e-NWR custodian liability during active operations.",
    eligibility: [
      "Private and cooperative warehouse operators issuing storage receipts or e-NWRs to farmers and traders.",
    ],
    premiumAndCoverage: [
      "Covers legal defense and indemnity for accidental loss or damage to third-party agricultural produce in custody.",
      "Required by most commercial banks before accepting your warehouse receipts for pledge financing.",
    ],
    documents: [
      "WDRA Registration / State Warehouse License",
      "Standard Storage Agreement & Stock Ledger Sample",
      "Security & CCTV Compliance Checklist",
    ],
    howToApply: [
      "Estimate maximum peak value of stored commodities across all bays.",
      "Request a declaration-based Commercial Warehouseman Liability policy with quarterly stock adjustments.",
    ],
    officialUrl: "https://wdra.gov.in/",
  },
  {
    id: "wh-land-car-plan",
    name: "Warehouse Construction All-Risk (CAR) & Commercial Site Cover",
    category: "Construction & Land Cover",
    audience: "warehouse_owner",
    summary:
      "Dedicated project insurance for newly purchased commercial warehouse land during civil foundation work, steel erection, silo fabrication, and commissioning.",
    eligibility: [
      "Warehouse developers, logistics firms, and owners expanding bays or constructing on newly acquired commercial land.",
    ],
    premiumAndCoverage: [
      "Covers civil structure under construction, steel trusses, roofing sheets, and site materials against collapse, storm, or theft.",
      "Includes third-party bodily injury / property liability on the construction plot until handover.",
    ],
    documents: [
      "Approved Building Plan & Sanctioned Construction Estimate",
      "Land Purchase Sale Deed / Industrial Plot Allotment Letter",
      "EPC / Civil Contractor Agreement",
    ],
    howToApply: [
      "Obtain CAR cover before breaking ground or ordering structural steel to satisfy bank project-loan disbursement conditions.",
    ],
    officialUrl: "https://www.unitedindia.co.in/",
  },
];

export const LOANS_DATA: LoanOption[] = [
  {
    id: "kcc-crop-loan",
    name: "Kisan Credit Card (KCC) Crop Loan",
    provider: "Public Sector, RRB & Cooperative Banks",
    loanType: "Crop Loan",
    audience: "farmer",
    summary:
      "Short-term revolving credit for seasonal cultivation expenses, seeds, fertilizers, and minor equipment repairs.",
    interestSummary: "7% p.a. base rate; effective 4% p.a. with 3% timely repayment subsidy (up to Rs. 3 Lakh).",
    eligibility: [
      "Owner-cultivators, tenant farmers, sharecroppers, and allied dairy/fisheries farmers.",
      "No active default on previous institutional agricultural loans.",
    ],
    repaymentTerms: [
      "12-month cycle aligned with Kharif and Rabi harvest sales.",
      "Collateral-free up to Rs. 1.60 Lakh (Rs. 2 Lakh under updated RBI collateral-free limit).",
    ],
    documents: [
      "Aadhaar Card & Identity Proof",
      "Land Records / Tenancy Proof",
      "2 Passport Photos",
    ],
    howToApply: [
      "Apply online via the Government JanSamarth portal (jansamarth.in) or visit your local bank branch.",
    ],
    officialUrl: "https://www.jansamarth.in/",
  },
  {
    id: "agri-infra-fund",
    name: "Agriculture Infrastructure Fund (AIF)",
    provider: "Scheduled Commercial Banks & NABARD",
    loanType: "Infrastructure Loan",
    audience: "both",
    summary:
      "Medium-to-long-term financing for building warehouses, cold storages, sorting/grading units, and primary processing centers.",
    interestSummary: "3% interest subvention on loans up to Rs. 2 Crore (capped at max 9% lender rate) for up to 7 years.",
    eligibility: [
      "Warehouse owners, agri-entrepreneurs, FPOs, PACS, and farmers building post-harvest storage or processing infrastructure.",
    ],
    repaymentTerms: [
      "Up to 7 years repayment with an initial moratorium period of 6 months to 2 years.",
      "Credit guarantee coverage available under CGTMSE for loans up to Rs. 2 Crore.",
    ],
    documents: [
      "Detailed Project Report (DPR)",
      "Land Lease / Ownership Papers",
      "KYC & Bank Statements",
    ],
    howToApply: [
      "Submit your project proposal online on agriinfra.dac.gov.in and select a participating bank.",
    ],
    officialUrl: "https://agriinfra.dac.gov.in/",
  },
  {
    id: "wh-construction-loan",
    name: "Warehouse & Cold Storage Construction Term Loan",
    provider: "NABARD AMI / SIDBI & Commercial Banks",
    loanType: "Warehouse Construction",
    audience: "warehouse_owner",
    summary:
      "Long-term commercial project finance for constructing scientific grain godowns, pre-engineered steel sheds, silos, and multi-chamber cold storages.",
    interestSummary: "8.75% – 10.25% p.a. commercial term rates (eligible for 3% AIF interest subvention & AMI capital subsidy).",
    eligibility: [
      "Individual warehouse proprietors, LLPs, private limited firms, and partnerships with clear non-agricultural / commercial land title.",
      "Minimum 15% – 25% promoter margin contribution toward civil & structural cost.",
    ],
    repaymentTerms: [
      "7 to 12 years repayment tenure aligned with storage rental cashflows.",
      "Includes 12 to 24 months construction moratorium before principal EMI starts.",
    ],
    documents: [
      "Detailed Project Report (DPR) with Civil Architect Estimate",
      "CLU (Change of Land Use) / Industrial Plot Approval",
      "Last 2–3 Years ITRs, GST Returns & Bank Statements",
    ],
    howToApply: [
      "Prepare a bankable DPR showing MT capacity, bay layout, and projected rental revenue.",
      "Apply through a scheduled commercial bank SME/Agri-Infra desk or link via agriinfra.dac.gov.in.",
    ],
    officialUrl: "https://agriinfra.dac.gov.in/",
  },
  {
    id: "wh-running-capital-loan",
    name: "Warehouse Operations & Working Capital Overdraft",
    provider: "SBI / HDFC / Axis Commercial Agri-Business Desks",
    loanType: "Warehouse Running Capital",
    audience: "warehouse_owner",
    summary:
      "Revolving cash-credit and equipment upgrade line to fund day-to-day warehouse running expenses, power bills, solar backup, weighbridges, and staffing.",
    interestSummary: "9.25% – 11.20% p.a. floating overdraft; interest charged only on daily utilized balance.",
    eligibility: [
      "Operational grain warehouses and cold storages with at least 12 months of active rental billing or storage receipts.",
      "Clean GST & credit track record.",
    ],
    repaymentTerms: [
      "Annual renewable Cash Credit (CC) / Overdraft limit for running expenses + 3–5 year term add-on for solar/HVAC upgrades.",
      "Flexible drawdowns to bridge seasonal off-peak occupancy months.",
    ],
    documents: [
      "GST Filing History & Warehouse Occupancy Ledger",
      "Last 12 Months Current Account Bank Statements",
      "Existing Property Valuation & WDRA Certificate (if applicable)",
    ],
    howToApply: [
      "Submit your annual operating cashflow summary at your commercial bank's SME or Supply-Chain Finance branch.",
    ],
    officialUrl: "https://www.sidbi.in/",
  },
  {
    id: "wh-land-purchase-loan",
    name: "Commercial Storage Land Acquisition & Site Development Loan",
    provider: "Scheduled Commercial Banks & NBFC Infra Desks",
    loanType: "Land Purchase Loan",
    audience: "warehouse_owner",
    summary:
      "Commercial mortgage financing for acquiring industrial, highway-corridor, or mandi-adjacent plots specifically for building or expanding warehouse capacity.",
    interestSummary: "9.5% – 11.75% p.a. against clear land title + site development plan (up to 65% – 70% LTV).",
    eligibility: [
      "Existing warehouse operators expanding capacity or commercial logistics entrepreneurs acquiring zoned storage plots.",
      "Plot must have verified road access, non-disputed title chain, and permissible commercial/agri-infra zoning.",
    ],
    repaymentTerms: [
      "Up to 10 years commercial mortgage tenure.",
      "Can be structured as a composite loan: Land Acquisition tranche + Construction disbursement tranche.",
    ],
    documents: [
      "Sale Agreement / Allotment Letter & 30-Year Title Search Report",
      "Zoning / CLU Certificate Permitting Godown Construction",
      "Promoter KYC, Net-Worth Statement & Financial Projections",
    ],
    howToApply: [
      "Obtain legal title clearance and land valuation from a bank-empaneled valuer before signing final sale registration.",
    ],
    officialUrl: "https://www.jansamarth.in/",
  },
  {
    id: "farm-mechanization-loan",
    name: "Tractor & Farm Mechanization Loan",
    provider: "SBI / NABARD Partner Banks",
    loanType: "Equipment Loan",
    audience: "farmer",
    summary:
      "Term loan to buy tractors, rotavators, harvesters, and power tillers with repayment schedules matched to harvest seasons.",
    interestSummary: "Typically 8.9% – 11.5% p.a. depending on bank, down payment, and state SMAM subsidy.",
    eligibility: [
      "Farmers with minimum 2 to 4 acres of cultivable land (varies by lender) and steady farm income.",
    ],
    repaymentTerms: [
      "Repayment tenure from 3 to 7 years in half-yearly or quarterly installments aligned to harvest.",
      "Can be combined with Sub-Mission on Agricultural Mechanization (SMAM) subsidy where eligible.",
    ],
    documents: [
      "Aadhaar & PAN Card",
      "Land Ownership Record",
      "Dealer Proforma Invoice",
    ],
    howToApply: [
      "Obtain an authorized dealer quotation and apply at your bank branch or through your state SMAM portal.",
    ],
    officialUrl: "https://agrimachinery.nic.in/",
  },
  {
    id: "dairy-allied-loan",
    name: "Dairy, Poultry & Allied Farming Loan",
    provider: "NABARD / Regional Rural Banks",
    loanType: "Allied Agri Loan",
    audience: "farmer",
    summary:
      "Working capital and term credit for purchasing milch cattle, building sheds, poultry units, or beekeeping setups.",
    interestSummary: "KCC-linked working capital at 4% effective rate (up to Rs. 2 Lakh); term loans at bank MCLR-linked rates.",
    eligibility: [
      "Small farmers, rural women SHGs, and livestock rearers with shed space and basic veterinary access.",
    ],
    repaymentTerms: [
      "Monthly or quarterly repayments from dairy/poultry cashflows over 3 to 5 years.",
    ],
    documents: [
      "Aadhaar Card",
      "Bank Passbook",
      "Local Milk Cooperative / Veterinary Certificate",
    ],
    howToApply: [
      "Visit your nearest Cooperative Bank, Regional Rural Bank, or apply via JanSamarth under KCC Animal Husbandry.",
    ],
    officialUrl: "https://www.jansamarth.in/",
  },
];

export const SEEDED_WAREHOUSES: WarehouseItem[] = [
  {
    id: "wh-ludhiana-green",
    ownerId: "catalog-owner-1",
    name: "Satluj Grain & Cold Hub",
    cityState: "Ludhiana, Punjab",
    distanceKm: 6.4,
    totalCapacityMt: 2500,
    availableCapacityMt: 820,
    pricePerQuintalMonth: 18,
    rating: 4.8,
    facilities: ["Moisture Control", "24x7 Security", "Digital Weighbridge", "Loading Dock"],
    description:
      "WDRA-compliant dry grain and wheat storage facility near Khanna Mandi road with pest-monitored bays and direct tractor-trolley unloading.",
    status: "active",
    mapX: 28,
    mapY: 22,
    isCatalog: true,
  },
  {
    id: "wh-nashik-cold",
    ownerId: "catalog-owner-2",
    name: "Sahyadri Onion & Produce Cold Store",
    cityState: "Nashik, Maharashtra",
    distanceKm: 11.2,
    totalCapacityMt: 1800,
    availableCapacityMt: 540,
    pricePerQuintalMonth: 42,
    rating: 4.7,
    facilities: ["Cold Storage", "Ventilated Onion Racks", "24x7 Security", "Sorting Bay"],
    description:
      "Temperature-controlled chambers built for onions, grapes, and pulses with backup solar power and e-NWR receipt assistance.",
    status: "active",
    mapX: 34,
    mapY: 61,
    isCatalog: true,
  },
  {
    id: "wh-indore-malwa",
    ownerId: "catalog-owner-3",
    name: "Malwa Soy & Wheat Godown",
    cityState: "Indore, Madhya Pradesh",
    distanceKm: 8.9,
    totalCapacityMt: 3200,
    availableCapacityMt: 1240,
    pricePerQuintalMonth: 16,
    rating: 4.6,
    facilities: ["Dry Grain Storage", "Moisture Control", "Loading Dock", "Fire Safety"],
    description:
      "Clean, rodent-proof concrete bays ideal for soybean, chana, and Sharbati wheat, located 4 km from the Indore grain mandi.",
    status: "active",
    mapX: 49,
    mapY: 48,
    isCatalog: true,
  },
  {
    id: "wh-lucknow-avadh",
    ownerId: "catalog-owner-4",
    name: "Avadh Kisan Agro Storage",
    cityState: "Barabanki, Uttar Pradesh",
    distanceKm: 14.5,
    totalCapacityMt: 2000,
    availableCapacityMt: 670,
    pricePerQuintalMonth: 22,
    rating: 4.5,
    facilities: ["Cold Storage", "Dry Grain Storage", "Digital Weighbridge", "24x7 Security"],
    description:
      "Dual-purpose potato cold chambers and paddy storage godowns serving small farmers with flexible 1-month minimum bookings.",
    status: "active",
    mapX: 64,
    mapY: 36,
    isCatalog: true,
  },
  {
    id: "wh-bengaluru-kaveri",
    ownerId: "catalog-owner-5",
    name: "Kaveri Pulses & Spice Vault",
    cityState: "Tumakuru, Karnataka",
    distanceKm: 18.0,
    totalCapacityMt: 1500,
    availableCapacityMt: 430,
    pricePerQuintalMonth: 26,
    rating: 4.8,
    facilities: ["Moisture Control", "Sorting Bay", "Loading Dock", "Pest Monitoring"],
    description:
      "Humidity-regulated racks designed for ragi, tur dal, groundnut, and dry spices with clean bag-tagging for every farmer.",
    status: "active",
    mapX: 46,
    mapY: 79,
    isCatalog: true,
  },
  {
    id: "wh-jalandhar-doaba",
    ownerId: "catalog-owner-6",
    name: "Doaba Cold & Wheat Hub",
    cityState: "Jalandhar, Punjab",
    distanceKm: 12.1,
    totalCapacityMt: 2100,
    availableCapacityMt: 740,
    pricePerQuintalMonth: 20,
    rating: 4.7,
    facilities: ["Cold Storage", "Moisture Control", "Digital Weighbridge", "24x7 Security"],
    description:
      "Potato cold storage bays and WDRA-certified dry wheat blocks serving Jalandhar and Kapurthala farmers with zero unloading wait.",
    status: "active",
    mapX: 33,
    mapY: 19,
    isCatalog: true,
  },
  {
    id: "wh-patiala-malwa",
    ownerId: "catalog-owner-7",
    name: "Patiala Shahi Grain Godown",
    cityState: "Patiala, Punjab",
    distanceKm: 19.4,
    totalCapacityMt: 2900,
    availableCapacityMt: 1120,
    pricePerQuintalMonth: 17,
    rating: 4.6,
    facilities: ["Dry Grain Storage", "Loading Dock", "Pest Monitoring", "Fire Safety"],
    description:
      "High-roof moisture-sealed paddy and wheat godown near Rajpura highway with electronic receipt and farmer bagging support.",
    status: "active",
    mapX: 39,
    mapY: 25,
    isCatalog: true,
  },
  {
    id: "wh-nagpur-vidarbha",
    ownerId: "catalog-owner-8",
    name: "Vidarbha Agri & Cotton Vault",
    cityState: "Nagpur, Maharashtra",
    distanceKm: 15.3,
    totalCapacityMt: 2200,
    availableCapacityMt: 680,
    pricePerQuintalMonth: 21,
    rating: 4.6,
    facilities: ["Dry Grain Storage", "Fire Safety", "24x7 Security", "Digital Weighbridge"],
    description:
      "Ventilated storage chambers built for Vidarbha cotton bales, tur dal, oranges, and soybean near Kalamna Mandi.",
    status: "active",
    mapX: 55,
    mapY: 60,
    isCatalog: true,
  },
  {
    id: "wh-rajkot-saurashtra",
    ownerId: "demo-owner-1",
    name: "Saurashtra Cotton & Groundnut Hub",
    cityState: "Rajkot, Gujarat",
    distanceKm: 9.7,
    totalCapacityMt: 2800,
    availableCapacityMt: 960,
    pricePerQuintalMonth: 20,
    rating: 4.6,
    facilities: ["Dry Grain Storage", "24x7 Security", "Fire Safety", "Digital Weighbridge"],
    description:
      "Wide-bay ventilated storage tailored for groundnut pods, cumin, and cotton bales with easy highway access.",
    status: "active",
    mapX: 21,
    mapY: 49,
    isCatalog: true,
  },
];

export const WELLBEING_ARTICLES: WellbeingArticle[] = [
  {
    id: "wb-crop-loss-stress",
    title: "When Rain or Crop Loss Feels Overwhelming",
    topic: "Emotional Grounding",
    readTime: "3 min read",
    summary:
      "Practical ways to steady your mind during uncertain harvest weeks without carrying every worry alone.",
    paragraphs: [
      "Farming depends on weather, prices, and timing that no single person can control. When unseasonal rain damages a standing crop or mandi rates dip, feeling heavy, sleepless, or irritable is a natural human response — not a personal failure.",
      "During hard weeks, separating today's next small step from the entire season's worry helps restore calm. You do not have to solve the whole year in one evening.",
    ],
    practicalSteps: [
      "Share what is weighing on you with one trusted person — a family member, fellow farmer, or village elder.",
      "Break tomorrow into two simple tasks: for example, documenting field damage for PMFBY within 72 hours, and resting by evening.",
      "Call Tele-MANAS (14416) anytime for free, confidential emotional support in regional languages.",
    ],
  },
  {
    id: "wb-sleep-and-rest",
    title: "Rest & Sleep During Peak Sowing and Harvest",
    topic: "Daily Rest",
    readTime: "3 min read",
    summary:
      "Simple habits to protect your body and energy during 5 AM irrigation shifts and long harvest days.",
    paragraphs: [
      "Long hours in heat and dust drain both physical strength and patience. Even a 20-minute shaded rest after midday water checks helps prevent exhaustion and farm accidents.",
      "Keeping heavy financial calculations for daytime rather than late night helps your mind wind down when it is time to sleep.",
    ],
    practicalSteps: [
      "Drink plain water with a pinch of salt and lemon between field rounds.",
      "Step away from loan or mandi price worries for 30 minutes before sleeping.",
      "Use the 4-4-6 breathing timer below whenever your chest feels tight or restless.",
    ],
  },
  {
    id: "wb-talking-family",
    title: "Talking Openly About Farm Debt and Pressure",
    topic: "Family & Community",
    readTime: "4 min read",
    summary:
      "Why silent pressure grows heavier, and how community groups and FPOs lighten the load.",
    paragraphs: [
      "Many farmers try to protect their families by keeping loan stress completely silent. In reality, silence makes stress feel twice as heavy and hides practical options like KCC restructuring or state relief.",
      "Joining a local Farmer Producer Organization (FPO) or cooperative gives you peers facing the same seasons and shared access to storage, inputs, and advice.",
    ],
    practicalSteps: [
      "Speak with your bank branch manager early if a harvest is delayed — banks often have official rescheduling rules after notified calamities.",
      "Visit your local Krishi Vigyan Kendra (KVK) or call Kisan Call Centre (1800-180-1551) for guidance on relief schemes.",
    ],
  },
];

export const FAQS_DATA: FaqItem[] = [
  {
    id: "faq-1",
    category: "Account & Privacy",
    question: "Is BhoomiBandhu free for farmers?",
    answer:
      "Yes. Browsing government schemes, checking eligibility, reading crop insurance and loan guides, using the Crop Advisor, and accessing farmer well-being resources are completely free for farmers.",
  },
  {
    id: "faq-2",
    category: "Government Schemes",
    question: "Can I apply for PM-KISAN or PMFBY directly inside this app?",
    answer:
      "BhoomiBandhu helps you check eligibility, gather the exact documents, and understand every step in plain language. Every scheme detail page links directly to the official Government of India portal (such as pmkisan.gov.in or pmfby.gov.in) so you submit your application safely on official systems.",
  },
  {
    id: "faq-3",
    category: "Storage & Warehouses",
    question: "How does warehouse storage booking work?",
    answer:
      "Choose a warehouse near your mandi, enter your crop type, quantity (in kg, quintal, or ton), and storage duration to see the estimated monthly cost. When you submit a request, the warehouse owner reviews and approves or declines it directly.",
  },
  {
    id: "faq-4",
    category: "Crop Advisor",
    question: "Is the Crop Advisor recommendation a guaranteed yield?",
    answer:
      "No. The Crop Advisor gives an agronomic suggestion based on the soil type, N-P-K levels, temperature, humidity, rainfall, and pH you enter. Always confirm local seed variety suitability with your nearest Krishi Vigyan Kendra (KVK).",
  },
  {
    id: "faq-5",
    category: "AI Farmer Chat",
    question: "When should I use Fast mode vs Deep Reasoning mode in AI Chat?",
    answer:
      "Use Balanced or Fast mode for quick crop questions, definitions, or scheme summaries. Switch to Deep Reasoning (High Thinking) when comparing multiple schemes, planning crop rotation, or analyzing complex soil/storage trade-offs.",
  },
  {
    id: "faq-6",
    category: "Account & Privacy",
    question: "How is my personal farm data kept private?",
    answer:
      "Your name, phone number, email, saved schemes, chat history, and bookings are stored privately under your authenticated account and are never visible to other farmers.",
  },
];

export const SEEDED_PARTNER_COMPANIES: PartnerCompanyItem[] = [
  {
    id: "comp-aic-pmfby",
    name: "Agriculture Insurance Company of India (AIC)",
    category: "insurance",
    audience: "farmer",
    interestOrPremium: "1.5% Rabi / 2% Kharif farmer share",
    coverageOrLimit: "Up to Rs. 2,50,000 per hectare Sum Insured",
    eligibilitySummary:
      "Notified crops under PMFBY & RWBCIS across 18+ states for loanee and non-loanee farmers.",
    contactHelpline: "14447 / 1800-116-515",
    websiteUrl: "https://www.aicofindia.com/",
    status: "active",
    createdBy: "system-seed",
  },
  {
    id: "comp-iffco-tokio",
    name: "IFFCO-Tokio Rural Crop Shield",
    category: "insurance",
    audience: "farmer",
    interestOrPremium: "2% Kharif / 5% Horticulture capped share",
    coverageOrLimit: "Standing crop, hailstorm & post-harvest 14-day protection",
    eligibilitySummary:
      "Available for small, marginal, and tenant farmers with sowing certificate.",
    contactHelpline: "1800-103-5499",
    websiteUrl: "https://www.iffcotokio.co.in/",
    status: "active",
    createdBy: "system-seed",
  },
  {
    id: "comp-newindia-wh-ins",
    name: "New India Commercial Warehouse & Fire Shield",
    category: "insurance",
    audience: "warehouse_owner",
    interestOrPremium: "Custom commercial tariff (WDRA discount available)",
    coverageOrLimit: "Rs. 50 Lakh to Rs. 25 Crore (Building, Fire, CAR & Stock Liability)",
    eligibilitySummary:
      "Registered grain godowns, cold storages, and newly constructed commercial warehouse facilities.",
    contactHelpline: "1800-209-1415",
    websiteUrl: "https://www.newindia.co.in/",
    status: "active",
    createdBy: "system-seed",
  },
  {
    id: "comp-icici-lombard-wh",
    name: "ICICI Lombard Cold-Chain & Godown Protect",
    category: "insurance",
    audience: "warehouse_owner",
    interestOrPremium: "Bundled Machinery Breakdown + DOS Stock Cover",
    coverageOrLimit: "Compressors, DG backup, solar arrays & stored produce spoilage",
    eligibilitySummary:
      "Commercial cold storages, multi-bay warehouses, and warehouse expansion sites under construction.",
    contactHelpline: "1800-2666",
    websiteUrl: "https://www.icicilombard.com/",
    status: "active",
    createdBy: "system-seed",
  },
  {
    id: "comp-sbi-kcc",
    name: "State Bank of India (SBI) Kisan Credit Desk",
    category: "loan",
    audience: "farmer",
    interestOrPremium: "4% effective p.a. (with prompt repayment)",
    coverageOrLimit: "Up to Rs. 3,00,000 seasonal crop limit; collateral-free up to Rs. 2 Lakh",
    eligibilitySummary:
      "Individual cultivators, joint borrowers, and tenant farmers with Aadhaar and land papers.",
    contactHelpline: "1800-1234",
    websiteUrl: "https://sbi.co.in/web/agri-rural/agriculture-banking",
    status: "active",
    createdBy: "system-seed",
  },
  {
    id: "comp-nabard-aif",
    name: "NABARD & PNB Agri Infrastructure Finance",
    category: "loan",
    audience: "both",
    interestOrPremium: "3% interest subvention (capped max 9%)",
    coverageOrLimit: "Rs. 5 Lakh to Rs. 2 Crore for warehouses, cold stores & infrastructure",
    eligibilitySummary:
      "Warehouse owners, commercial storage developers, FPOs, PACS, and progressive farmers.",
    contactHelpline: "1800-180-2222",
    websiteUrl: "https://agriinfra.dac.gov.in/",
    status: "active",
    createdBy: "system-seed",
  },
  {
    id: "comp-sidbi-wh-loan",
    name: "SIDBI & Commercial Godown Infra Credit Desk",
    category: "loan",
    audience: "warehouse_owner",
    interestOrPremium: "8.75% – 10.75% p.a. (Term + Working Capital Overdraft)",
    coverageOrLimit: "Rs. 25 Lakh to Rs. 5 Crore for construction, running capital & land purchase",
    eligibilitySummary:
      "Commercial warehouse proprietors, cold-chain operators, and logistics firms expanding godown sites.",
    contactHelpline: "1800-22-6753",
    websiteUrl: "https://www.sidbi.in/",
    status: "active",
    createdBy: "system-seed",
  },
];

export const SEEDED_PSYCHIATRISTS: PsychiatristProfileItem[] = [
  {
    id: "demo-psychiatrist-1",
    userId: "demo-psychiatrist-1",
    name: "Dr. Ananya Deshmukh",
    qualification: "MD Psychiatry, NIMHANS Fellow",
    specialization: "Rural Stress, Financial Anxiety & Family Support",
    languages: ["Hindi", "Marathi", "English"],
    experienceYears: 9,
    state: "Maharashtra",
    bio: "Works closely with rural families and growers navigating unseasonal crop loss, loan pressure, and sleeplessness with compassionate, confidential guidance.",
    availableForConsult: true,
  },
  {
    id: "psych-harjinder",
    userId: "psych-harjinder",
    name: "Dr. Harjinder Singh Brar",
    qualification: "MD Psychiatry, PGIMER Chandigarh",
    specialization: "Harvest Burnout, Sleep Recovery & Stress Resilience",
    languages: ["Punjabi", "Hindi", "English"],
    experienceYears: 12,
    state: "Punjab",
    bio: "Specializes in practical coping routines and confidential community counseling for farming households across Punjab and Haryana.",
    availableForConsult: true,
  },
  {
    id: "psych-kavitha",
    userId: "psych-kavitha",
    name: "Dr. Kavitha Sundaram",
    qualification: "DPM, M.D. Counseling Psychiatry",
    specialization: "Grief Support, Crisis Calm & Household Wellbeing",
    languages: ["Tamil", "Kannada", "Telugu", "English"],
    experienceYears: 7,
    state: "Tamil Nadu",
    bio: "Provides calm, judgment-free phone and scheduled video check-ins tailored for Southern Indian agricultural communities.",
    availableForConsult: true,
  },
];

export const SEEDED_DEMO_CONSULTATIONS = [
  {
    id: "consult-demo-1",
    farmerId: "demo-farmer-1",
    farmerName: "Harpreet Singh Gill",
    farmerState: "Punjab",
    psychiatristId: "demo-psychiatrist-1",
    psychiatristName: "Dr. Ananya Deshmukh",
    preferredSlot: "Tomorrow · 5:00 PM - 5:30 PM",
    language: "Hindi",
    concernTopic: "Unseasonal rain & harvest loan anxiety",
    notes:
      "Rain delayed our wheat harvesting by 10 days and I have been struggling to sleep thinking about KCC repayment.",
    doctorResponse:
      "Confirmed for tomorrow 5:00 PM. We will go through slow evening wind-down steps and practical ways to share loan timelines calmly with your family.",
    status: "scheduled" as const,
  },
  {
    id: "consult-demo-2",
    farmerId: "farmer-ramesh-mp",
    farmerName: "Rameshwar Patidar",
    farmerState: "Madhya Pradesh",
    psychiatristId: "demo-psychiatrist-1",
    psychiatristName: "Dr. Ananya Deshmukh",
    preferredSlot: "Friday · 11:00 AM - 11:30 AM",
    language: "Hindi",
    concernTopic: "Feeling overwhelmed & irritable at home",
    notes:
      "Soybean market prices dropped sharply this week and I feel constant heaviness in my chest. Would appreciate a quiet talk.",
    status: "requested" as const,
  },
];

export const SEEDED_DEMO_TICKETS = [
  {
    id: "ticket-demo-complaint-1",
    userId: "demo-farmer-1",
    category: "complaint" as const,
    subject: "Warehouse Overcharging / Facility Dispute",
    message:
      "Storage godown billed Rs 18/quintal extra for moisture bagging despite agreed Rs 24/quintal/month booking rate. Requesting immediate fee review.",
    priority: "urgent" as const,
    status: "open" as const,
    createdAtIso: "2026-11-22T02:15:00.000Z",
    updatedAtIso: "2026-11-22T02:15:00.000Z",
  },
  {
    id: "ticket-demo-complaint-2",
    userId: "demo-farmer-1",
    category: "complaint" as const,
    subject: "Scheme / Subsidy Application Grievance",
    message:
      "Kharif PMFBY premium receipt was debited from KCC account but policy number has not reflected in district portal for 9 days.",
    priority: "urgent" as const,
    assignedEmployeeId: "demo-support-1",
    assignedEmployeeName: "Vikram Verma",
    employeeReply:
      "Escalated policy UTR number to district crop insurance nodal officer for manual sync within 24 hours.",
    status: "in_review" as const,
    createdAtIso: "2026-11-19T06:40:00.000Z",
    updatedAtIso: "2026-11-21T11:20:00.000Z",
  },
  {
    id: "ticket-demo-1",
    userId: "demo-farmer-1",
    category: "support" as const,
    subject: "Scheme Application Help",
    message:
      "My PM-KISAN Aadhaar e-KYC shows pending even after OTP verification at CSC. Which bank record should I check?",
    priority: "urgent" as const,
    status: "open" as const,
    createdAtIso: "2026-11-21T08:10:00.000Z",
    updatedAtIso: "2026-11-21T08:10:00.000Z",
  },
  {
    id: "ticket-demo-2",
    userId: "farmer-ramesh-mp",
    category: "support" as const,
    subject: "Warehouse Booking Issue",
    message:
      "Need to adjust wheat storage request from 40 quintals to 55 quintals at Malwa Soy & Wheat Godown.",
    priority: "normal" as const,
    assignedEmployeeId: "demo-support-1",
    assignedEmployeeName: "Vikram Verma",
    employeeReply:
      "We coordinated with Malwa Godown — please cancel the pending 40 quintal request and submit a fresh 55 quintal request so capacity stays reserved.",
    status: "in_review" as const,
    createdAtIso: "2026-11-20T05:30:00.000Z",
    updatedAtIso: "2026-11-20T14:00:00.000Z",
  },
  {
    id: "ticket-demo-3",
    userId: "farmer-lakshmi-tn",
    category: "wellbeing" as const,
    subject: "Need local helpline contact",
    message:
      "Looking for Tamil-speaking mental health support helpline hours for our village FPO women growers group.",
    priority: "normal" as const,
    assignedEmployeeId: "demo-support-1",
    assignedEmployeeName: "Vikram Verma",
    employeeReply:
      "Shared Tele-MANAS 14416 (press 4 for Tamil 24x7 counseling) and scheduled a group orientation note with Dr. Kavitha Sundaram.",
    status: "resolved" as const,
    createdAtIso: "2026-11-17T09:15:00.000Z",
    updatedAtIso: "2026-11-18T11:45:00.000Z",
  },
];

export const SEEDED_DEMO_BOOKINGS = [
  {
    id: "booking-demo-1",
    farmerId: "demo-farmer-1",
    farmerName: "Harpreet Singh Gill",
    warehouseId: "wh-rajkot-saurashtra",
    warehouseOwnerId: "demo-owner-1",
    warehouseName: "Saurashtra Cotton & Groundnut Hub",
    cropType: "Groundnut",
    quantity: 35,
    unit: "quintal" as const,
    startDate: "2026-06-05",
    durationMonths: 3,
    estimatedCostInr: 2100,
    notes: "Packed in dry jute bags, morning tractor arrival.",
    status: "pending" as const,
  },
  {
    id: "booking-demo-2",
    farmerId: "farmer-ramesh-mp",
    farmerName: "Rameshwar Patidar",
    warehouseId: "wh-ludhiana-green",
    warehouseOwnerId: "catalog-owner-1",
    warehouseName: "Satluj Grain & Cold Hub",
    cropType: "Wheat",
    quantity: 50,
    unit: "quintal" as const,
    startDate: "2026-05-25",
    durationMonths: 2,
    estimatedCostInr: 1800,
    notes: "Moisture tested at 11.5%.",
    status: "approved" as const,
  },
];

