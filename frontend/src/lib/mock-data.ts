export type ReportStatus = "draft" | "review_pending" | "approved" | "rejected" | "sent";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  indications: string;
  contraindications: string;
  typicalDosage: string;
  confidenceScore: number;
}

export interface AdverseEvent {
  id: string;
  type: "contraindication" | "medication_interaction" | "lab_abnormality" | "patient_reaction" | "dosage_concern";
  severity: "low" | "moderate" | "high" | "critical";
  description: string;
  detectedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  notes: string;
}

export interface WellnessReport {
  id: string;
  patient: Patient;
  intakeDate: string;
  aiSummary: string;
  status: ReportStatus;
  suggestedProtocol: Protocol;
  approvedProtocol: Protocol | null;
  physicianNotes: string;
  createdAt: string;
  flagged: boolean;
  flaggedReason: string;
  adverseEvents: AdverseEvent[];
}

export interface DashboardStats {
  totalReports: number;
  pendingReview: number;
  approvedToday: number;
  flaggedReports: number;
  activePatients: number;
}

// Mock patients
const mockPatients: Patient[] = [
  {
    id: "pat-001",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@example.com",
    dob: "1985-06-15",
    age: 39,
    gender: "Female",
    phone: "(555) 123-4567",
  },
  {
    id: "pat-002",
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "m.rodriguez@example.com",
    dob: "1972-11-28",
    age: 52,
    gender: "Male",
    phone: "(555) 234-5678",
  },
  {
    id: "pat-003",
    firstName: "Emily",
    lastName: "Thompson",
    email: "emily.t@example.com",
    dob: "1991-03-08",
    age: 34,
    gender: "Female",
    phone: "(555) 345-6789",
  },
  {
    id: "pat-004",
    firstName: "James",
    lastName: "Wilson",
    email: "j.wilson@example.com",
    dob: "1968-09-22",
    age: 56,
    gender: "Male",
    phone: "(555) 456-7890",
  },
  {
    id: "pat-005",
    firstName: "Olivia",
    lastName: "Martinez",
    email: "olivia.m@example.com",
    dob: "1995-01-14",
    age: 30,
    gender: "Female",
    phone: "(555) 567-8901",
  },
  {
    id: "pat-006",
    firstName: "Robert",
    lastName: "Kim",
    email: "robert.kim@example.com",
    dob: "1980-07-03",
    age: 44,
    gender: "Male",
    phone: "(555) 678-9012",
  },
  {
    id: "pat-007",
    firstName: "Amanda",
    lastName: "Foster",
    email: "a.foster@example.com",
    dob: "1988-12-19",
    age: 36,
    gender: "Female",
    phone: "(555) 789-0123",
  },
];

// Mock protocols
const protocols: Protocol[] = [
  {
    id: "proto-glp1",
    name: "GLP-1 Agonist Protocol",
    description:
      "Glucagon-like peptide-1 receptor agonist therapy for weight management and metabolic health. Supports glycemic control and promotes sustainable weight loss.",
    indications:
      "BMI ≥ 27 with weight-related comorbidities, or BMI ≥ 30. Type 2 diabetes management. Metabolic syndrome.",
    contraindications:
      "Personal or family history of medullary thyroid carcinoma (MTC). Multiple Endocrine Neoplasia syndrome type 2 (MEN-2). Severe gastroparesis. Pregnancy or breastfeeding.",
    typicalDosage: "0.25 mg subcutaneous once weekly, titrating to 2.4 mg over 16 weeks",
    confidenceScore: 87,
  },
  {
    id: "proto-bpc157",
    name: "BPC-157 Tissue Repair Protocol",
    description:
      "Body Protection Compound-157 for accelerated healing of soft tissue injuries, ligament damage, and gastrointestinal health.",
    indications:
      "Acute and chronic soft tissue injuries. Tendonitis, ligament sprains. Post-surgical recovery. IBS and GI inflammation.",
    contraindications:
      "Active malignancy. Concurrent use with anticoagulants without physician oversight. Pregnancy or breastfeeding.",
    typicalDosage: "250-500 mcg subcutaneously twice daily for 4-6 weeks",
    confidenceScore: 82,
  },
  {
    id: "proto-tb500",
    name: "TB-500 Thymosin Beta-4 Protocol",
    description:
      "Synthetic thymosin beta-4 for promoting cell migration, angiogenesis, and tissue regeneration. Ideal for chronic wound healing and muscle recovery.",
    indications:
      "Chronic non-healing wounds. Muscle strains and tears. Joint inflammation. Post-operative recovery enhancement.",
    contraindications:
      "Active cancer. Bleeding disorders. Concurrent use with anti-angiogenic medications.",
    typicalDosage: "2.5-5 mg twice weekly for 4-6 weeks",
    confidenceScore: 76,
  },
  {
    id: "proto-ghkc",
    name: "GHK-Cu Copper Peptide Protocol",
    description:
      "Copper-binding peptide for skin regeneration, hair growth, and anti-inflammatory effects. Supports collagen production and wound healing.",
    indications:
      "Skin aging and photoaging. Hair thinning and alopecia. Chronic inflammation. Post-surgical wound healing.",
    contraindications:
      "Wilson's disease. Copper sensitivity. Pregnancy or breastfeeding.",
    typicalDosage: "1-2 mg subcutaneously daily or 5 mg twice weekly",
    confidenceScore: 71,
  },
];

// Helper to generate random protocol
function getRandomProtocol(): Protocol {
  return protocols[Math.floor(Math.random() * protocols.length)];
}

// Mock adverse events
const mockAdverseEvents: AdverseEvent[] = [
  {
    id: "ae-001",
    type: "medication_interaction",
    severity: "moderate",
    description: "Patient on low-dose aspirin (81mg) - potential increased bleeding risk with BPC-157 protocol",
    detectedAt: "2026-05-19T09:20:00Z",
    resolvedAt: null,
    resolvedBy: null,
    notes: "Recommend holding aspirin 48hrs before each injection. Flagged for physician review.",
  },
  {
    id: "ae-002",
    type: "contraindication",
    severity: "critical",
    description: "Family history of medullary thyroid carcinoma (MTC) detected - absolute contraindication for GLP-1 therapy",
    detectedAt: "2026-05-20T08:35:00Z",
    resolvedAt: null,
    resolvedBy: null,
    notes: "Patient must be referred for endocrinology evaluation before any GLP-1 consideration.",
  },
  {
    id: "ae-003",
    type: "lab_abnormality",
    severity: "high",
    description: "Elevated liver enzymes (ALT 85 U/L, AST 72 U/L) - may indicate hepatic stress contraindicating TB-500",
    detectedAt: "2026-05-18T10:15:00Z",
    resolvedAt: "2026-05-19T14:30:00Z",
    resolvedBy: "Dr. Reynolds",
    notes: "Repeat labs ordered. Patient advised to avoid alcohol. Will reassess before protocol initiation.",
  },
  {
    id: "ae-004",
    type: "patient_reaction",
    severity: "low",
    description: "Patient reported mild injection site reaction (erythema, itching) during initial BPC-157 dosing",
    detectedAt: "2026-05-17T11:00:00Z",
    resolvedAt: "2026-05-18T09:00:00Z",
    resolvedBy: "Dr. Reynolds",
    notes: "Reaction self-resolved within 24 hours. Continue protocol with antihistamine pre-treatment.",
  },
  {
    id: "ae-005",
    type: "dosage_concern",
    severity: "moderate",
    description: "Patient BMI 31.0 requires adjusted GLP-1 titration schedule - standard protocol may cause excessive nausea",
    detectedAt: "2026-05-20T08:40:00Z",
    resolvedAt: null,
    resolvedBy: null,
    notes: "Consider extended titration: 0.25mg x 6 weeks instead of 4 weeks before escalation.",
  },
];

// Mock wellness reports
export const mockReports: WellnessReport[] = [
  {
    id: "wr-001",
    patient: mockPatients[0],
    intakeDate: "2026-05-18",
    aiSummary:
      "Patient presents with BMI of 32.4, elevated fasting glucose (112 mg/dL), and reports difficulty losing weight despite diet and exercise. Family history includes type 2 diabetes. Patient is a strong candidate for GLP-1 agonist therapy. No contraindications detected.",
    status: "draft",
    suggestedProtocol: protocols[0],
    approvedProtocol: null,
    physicianNotes: "",
    createdAt: "2026-05-19T08:30:00Z",
    flagged: false,
    flaggedReason: "",
    adverseEvents: [],
  },
  {
    id: "wr-002",
    patient: mockPatients[1],
    intakeDate: "2026-05-17",
    aiSummary:
      "Patient reports chronic right knee pain following sports injury 8 months ago. MRI shows partial MCL tear. Patient is active and wants to avoid surgery. BPC-157 protocol recommended for tissue repair. No contraindications detected.",
    status: "draft",
    suggestedProtocol: protocols[1],
    approvedProtocol: null,
    physicianNotes: "",
    createdAt: "2026-05-19T09:15:00Z",
    flagged: true,
    flaggedReason: "Patient is on low-dose aspirin (81mg) - verify bleeding risk",
    adverseEvents: [mockAdverseEvents[0]],
  },
  {
    id: "wr-003",
    patient: mockPatients[2],
    intakeDate: "2026-05-16",
    aiSummary:
      "Patient presents with BMI of 28.1, normal glucose, but reports significant fatigue, brain fog, and difficulty with exercise recovery. Lab work shows borderline low IGF-1. TB-500 protocol may benefit tissue repair and recovery. Suggest further endocrine workup.",
    status: "review_pending",
    suggestedProtocol: protocols[2],
    approvedProtocol: null,
    physicianNotes: "",
    createdAt: "2026-05-18T10:00:00Z",
    flagged: false,
    flaggedReason: "",
    adverseEvents: [mockAdverseEvents[2]],
  },
  {
    id: "wr-004",
    patient: mockPatients[3],
    intakeDate: "2026-05-15",
    aiSummary:
      "Patient presents with premature skin aging, hair thinning, and complaints of poor wound healing. Lab work within normal ranges. GHK-Cu protocol recommended for its dermal regenerative and anti-inflammatory properties. No contraindications detected.",
    status: "approved",
    suggestedProtocol: protocols[3],
    approvedProtocol: protocols[3],
    physicianNotes:
      "Approved GHK-Cu protocol. Started at 2.5 mg twice weekly due to patient's age and skin concerns. Follow up in 8 weeks to assess progress.",
    createdAt: "2026-05-16T14:20:00Z",
    flagged: false,
    flaggedReason: "",
    adverseEvents: [],
  },
  {
    id: "wr-005",
    patient: mockPatients[4],
    intakeDate: "2026-05-14",
    aiSummary:
      "Patient requests peptide therapy for general anti-aging. BMI 22.5, normal labs, no specific complaints. Not a strong candidate for any specific protocol. Suggest monitoring and lifestyle optimization before initiating therapy.",
    status: "rejected",
    suggestedProtocol: protocols[0],
    approvedProtocol: null,
    physicianNotes:
      "Patient does not meet clinical criteria for peptide therapy at this time. Recommended lifestyle optimization: nutrition counseling, resistance training, and sleep hygiene. Re-evaluate in 3 months.",
    createdAt: "2026-05-15T11:45:00Z",
    flagged: false,
    flaggedReason: "",
    adverseEvents: [],
  },
  {
    id: "wr-006",
    patient: mockPatients[5],
    intakeDate: "2026-05-19",
    aiSummary:
      "Patient reports chronic low back pain and slow recovery after workouts. History of hamstring strain 6 months ago. BPC-157 protocol recommended for soft tissue repair. No contraindications detected. Moderate candidate.",
    status: "draft",
    suggestedProtocol: protocols[1],
    approvedProtocol: null,
    physicianNotes: "",
    createdAt: "2026-05-20T07:00:00Z",
    flagged: false,
    flaggedReason: "",
    adverseEvents: [],
  },
  {
    id: "wr-007",
    patient: mockPatients[6],
    intakeDate: "2026-05-19",
    aiSummary:
      "Patient with BMI 31.0, pre-diabetic (HbA1c 6.2%), and strong family history of type 2 diabetes. Failed prior weight loss attempts. GLP-1 agonist therapy strongly indicated. No contraindications detected.",
    status: "draft",
    suggestedProtocol: protocols[0],
    approvedProtocol: null,
    physicianNotes: "",
    createdAt: "2026-05-20T08:30:00Z",
    flagged: false,
    flaggedReason: "",
    adverseEvents: [mockAdverseEvents[4]],
  },
];

export const dashboardStats: DashboardStats = {
  totalReports: 47,
  pendingReview: 4,
  approvedToday: 3,
  flaggedReports: 2,
  activePatients: 89,
};

export function getReportsByStatus(status: ReportStatus): WellnessReport[] {
  return mockReports.filter((r) => r.status === status);
}

export function getReportById(id: string): WellnessReport | undefined {
  return mockReports.find((r) => r.id === id);
}
