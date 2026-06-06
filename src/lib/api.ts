// API Service Layer for Ogi Backend
// Configure the base URL - points to the NestJS backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Default practice and physician IDs for development
const DEFAULT_PRACTICE_ID = process.env.NEXT_PUBLIC_PRACTICE_ID || "00000000-0000-0000-0000-000000000001";
const DEFAULT_PHYSICIAN_ID = process.env.NEXT_PUBLIC_PHYSICIAN_ID || "00000000-0000-0000-0000-000000000002";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// Types matching the backend API response
// ============================================================

export interface ReportPatient {
  first_name: string;
  last_name: string;
  email: string;
  dob: string | null;
  phone: string | null;
}

export interface WellnessReport {
  id: string;
  intake_id: string;
  physician_id: string | null;
  suggested_protocol_id: string;
  approved_protocol_id: string | null;
  status: "draft" | "review_pending" | "approved" | "rejected" | "sent";
  physician_notes: string | null;
  digital_signature: string | null;
  approved_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient_first_name?: string;
  patient_last_name?: string;
  patient_email?: string;
  suggested_protocol_name?: string;
  approved_protocol_name?: string;
  patient?: ReportPatient;
  content?: {
    ai_summary: string;
    suggested_protocol: {
      name: string;
      description: string;
      indications: string;
      contraindications: string;
      typical_dosage: string;
      confidence_score: number;
    };
    patient_info: {
      age: number;
      gender: string;
    };
  } | null;
}

export interface Practice {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  theme_config: Record<string, unknown>;
  mso_id: string | null;
  stripe_customer_id: string | null;
  stripe_account_id: string | null;
  is_billing_setup: boolean;
  created_at: string;
}

// ============================================================
// Wellness Reports API
// ============================================================

export async function getReports(practiceId?: string, status?: string): Promise<WellnessReport[]> {
  const pid = practiceId || DEFAULT_PRACTICE_ID;
  let endpoint = `/api/v1/wellness-reports?practiceId=${pid}`;
  if (status) {
    endpoint += `&status=${status}`;
  }
  return request<WellnessReport[]>(endpoint);
}

export async function getReportDetails(reportId: string): Promise<WellnessReport> {
  return request<WellnessReport>(`/api/v1/wellness-reports/${reportId}`);
}

export async function approveReport(
  reportId: string,
  physicianId: string,
  protocolId: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/wellness-reports/${reportId}/approve`, {
    method: "POST",
    body: { physicianId: physicianId || DEFAULT_PHYSICIAN_ID, protocolId },
  });
}

export async function rejectReport(
  reportId: string,
  notes: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/wellness-reports/${reportId}/reject`, {
    method: "POST",
    body: { notes },
  });
}

// ============================================================
// Patient & Protocol Types
// ============================================================

export interface PatientRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string | null;
  phone: string | null;
  age: number;
  gender: string;
  latest_intake_date: string;
  latest_status: string;
  protocol_name: string | null;
  report_count: number;
}

export interface ProtocolRecord {
  id: string;
  name: string;
  description: string;
  indication_criteria: string;
  contraindications: string;
  typical_dosage: string;
  is_active: boolean;
}

// ============================================================
// Patients API (aggregated from wellness reports)
// ============================================================

export async function getPatients(practiceId?: string): Promise<PatientRecord[]> {
  // Try to get patients from the reports API (since there's no dedicated patient endpoint yet)
  try {
    const reports = await getReports(practiceId);
    // Deduplicate by patient email
    const seen = new Map<string, PatientRecord>();
    for (const r of reports) {
      const email = r.patient?.email || r.patient_email || "";
      const firstName = r.patient?.first_name || r.patient_first_name || "Unknown";
      const lastName = r.patient?.last_name || r.patient_last_name || "";
      const key = email || `${firstName}_${lastName}`;
      if (!seen.has(key)) {
        seen.set(key, {
          id: r.intake_id,
          first_name: firstName,
          last_name: lastName,
          email,
          dob: r.patient?.dob || null,
          phone: r.patient?.phone || null,
          age: r.content?.patient_info?.age ?? 0,
          gender: r.content?.patient_info?.gender ?? "Not specified",
          latest_intake_date: r.created_at,
          latest_status: r.status,
          protocol_name: r.content?.suggested_protocol?.name || r.suggested_protocol_name || null,
          report_count: reports.filter((rr) => {
            const rrEmail = rr.patient?.email || rr.patient_email || "";
            const rrFn = rr.patient?.first_name || rr.patient_first_name || "";
            return rrEmail === email || (rrFn === firstName && (rr.patient?.last_name || rr.patient_last_name || "") === lastName);
          }).length,
        });
      }
    }
    return Array.from(seen.values());
  } catch {
    throw new Error("Backend unavailable");
  }
}

export async function getPatientByEmail(email: string): Promise<PatientRecord | null> {
  const patients = await getPatients();
  return patients.find((p) => p.email === email) || null;
}

// ============================================================
// Protocols API
// ============================================================

// Protocols endpoint target (may not exist yet)
export async function getProtocols(): Promise<ProtocolRecord[]> {
  try {
    return await request<ProtocolRecord[]>("/api/v1/protocols");
  } catch {
    throw new Error("Protocols endpoint not available");
  }
}

export async function getProtocolById(id: string): Promise<ProtocolRecord | null> {
  try {
    return await request<ProtocolRecord>(`/api/v1/protocols/${id}`);
  } catch {
    return null;
  }
}

// ============================================================
// Practices API
// ============================================================

export async function getPractice(practiceId?: string): Promise<Practice> {
  const pid = practiceId || DEFAULT_PRACTICE_ID;
  return request<Practice>(`/api/v1/practices/${pid}`);
}

export async function updatePractice(
  practiceId: string,
  data: Partial<{ name: string; logo_url: string; theme_config: Record<string, unknown> }>
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/practices/${practiceId}`, {
    method: "PATCH",
    body: data,
  });
}

// ============================================================
// Billing & Subscription Types
// ============================================================

export interface SubscriptionPlan {
  id: string;
  name: string; // "Basic", "Pro", "Enterprise"
  stripe_price_id: string | null;
  monthly_price: number;
  report_fee: number;
  patient_limit: number | null;
  features: Record<string, unknown> | null;
}

export interface PracticeSubscription {
  id: string;
  practice_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  status: string; // "active", "trialing", "canceled", "past_due"
  current_period_end: string | null;
  plan_name?: string;
  monthly_price?: number;
  report_fee?: number;
}

export interface BillingUsageEvent {
  id: string;
  practice_id: string;
  report_id: string;
  event_type: string;
  amount: number;
  status: string; // "pending_sync", "synced", "failed"
  created_at: string;
}

// ============================================================
// Billing API
// ============================================================

export async function getPracticeSubscription(practiceId?: string): Promise<PracticeSubscription | null> {
  try {
    const pid = practiceId || DEFAULT_PRACTICE_ID;
    // Query subscriptions table for this practice
    const subscriptions = await request<PracticeSubscription[]>(`/api/v1/billing/subscriptions?practiceId=${pid}`);
    return subscriptions.length > 0 ? subscriptions[0] : null;
  } catch {
    return null;
  }
}

export async function getBillingUsage(practiceId?: string): Promise<BillingUsageEvent[]> {
  try {
    const pid = practiceId || DEFAULT_PRACTICE_ID;
    return await request<BillingUsageEvent[]>(`/api/v1/billing/usage?practiceId=${pid}`);
  } catch {
    return [];
  }
}

// ============================================================
// Revenue Dashboard (aggregated from available data)
// ============================================================

export interface RevenueDashboardData {
  planName: string;
  monthlyPrice: number;
  reportFee: number;
  subscriptionStatus: string;
  approvedReports: number;
  totalPprRevenue: number;
  totalFlagged: number;
  flaggedCandidates: number;
  periodEnd: string | null;
}

export async function getRevenueDashboard(practiceId?: string): Promise<RevenueDashboardData> {
  const pid = practiceId || DEFAULT_PRACTICE_ID;
  const subscription = await getPracticeSubscription(pid);
  const reports = await getReports(pid);
  const usage = await getBillingUsage(pid);

  const approved = reports.filter((r) => r.status === "approved");
  const flagged = reports.filter((r) => r.content?.ai_summary?.includes("contraindication") || r.content?.ai_summary?.includes("Flagged"));
  const pprTotal = usage
    .filter((e) => e.event_type === "REPORT_APPROVAL" && e.status === "synced")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    planName: subscription?.plan_name || "Pro",
    monthlyPrice: subscription?.monthly_price || 499,
    reportFee: subscription?.report_fee || 15.0,
    subscriptionStatus: subscription?.status || "active",
    approvedReports: approved.length,
    totalPprRevenue: pprTotal || approved.length * 15.0,
    totalFlagged: flagged.length,
    flaggedCandidates: flagged.length,
    periodEnd: subscription?.current_period_end || null,
  };
}

// ============================================================
// Analytics Types & API
// ============================================================

export interface RetentionMetrics {
  rate7Day: number;
  rate30Day: number;
  rate90Day: number;
  totalPatients: number;
}

export interface RoiMetrics {
  monthlyPrice: number;
  reportFee: number;
  approvedReports: number;
  totalPprRevenue: number;
  totalRevenue: number;
  projectedMonthlyRevenue: number;
  projectedAnnualRevenue: number;
  projectedLtv: number;
  planName: string;
}

export interface ProtocolPerformance {
  name: string;
  report_count: number;
  approval_rate: number;
}

export interface MonthlyTrend {
  month: string;
  report_count: number;
}

export interface PracticeAnalytics {
  retention: RetentionMetrics;
  roi: RoiMetrics;
  protocolPerformance: ProtocolPerformance[];
  monthlyTrends: MonthlyTrend[];
}

export async function getPracticeAnalytics(practiceId?: string): Promise<PracticeAnalytics> {
  const pid = practiceId || DEFAULT_PRACTICE_ID;
  try {
    return await request<PracticeAnalytics>(`/api/v1/analytics/practice?practiceId=${pid}`);
  } catch {
    // Return mock analytics data
    return {
      retention: { rate7Day: 40, rate30Day: 65, rate90Day: 82, totalPatients: 12 },
      roi: {
        monthlyPrice: 499, reportFee: 15.0, approvedReports: 3,
        totalPprRevenue: 45, totalRevenue: 544, projectedMonthlyRevenue: 544,
        projectedAnnualRevenue: 6528, projectedLtv: 6528, planName: "Pro",
      },
      protocolPerformance: [
        { name: "GLP-1 Agonist Protocol", report_count: 3, approval_rate: 67 },
        { name: "BPC-157 Tissue Repair Protocol", report_count: 2, approval_rate: 50 },
        { name: "TB-500 Thymosin Beta-4 Protocol", report_count: 1, approval_rate: 0 },
        { name: "GHK-Cu Copper Peptide Protocol", report_count: 1, approval_rate: 100 },
      ],
      monthlyTrends: [
        { month: "2026-05", report_count: 5 },
        { month: "2026-04", report_count: 3 },
        { month: "2026-03", report_count: 4 },
        { month: "2026-02", report_count: 2 },
        { month: "2026-01", report_count: 3 },
        { month: "2025-12", report_count: 1 },
      ],
    };
  }
}
