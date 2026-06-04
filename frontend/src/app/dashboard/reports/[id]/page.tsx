"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getReportById } from "@/lib/mock-data";
import { getReportDetails, approveReport, rejectReport } from "@/lib/api";
import type { WellnessReport as ApiReport } from "@/lib/api";

// Status config
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700" },
  review_pending: { label: "Pending Review", bg: "bg-amber-100", text: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  sent: { label: "Sent to Patient", bg: "bg-blue-100", text: "text-blue-700" },
};

// Extract a usable report shape from either API or mock data
function extractReportData(report: any): any {
  if (!report) return null;

  const firstName = report.patient?.first_name || report.patientFirstName || "";
  const lastName = report.patient?.last_name || report.patientLastName || "";
  const email = report.patient?.email || report.patientEmail || "";
  const dob = report.patient?.dob || report.dob || "";
  const phone = report.patient?.phone || report.phone || "";
  const content = report.content;
  const proto = content?.suggested_protocol;

  return {
    id: report.id,
    status: report.status,
    createdAt: report.created_at || report.createdAt,
    intakeDate: report.intake_date || report.intakeDate || "",
    aiSummary: content?.ai_summary || report.aiSummary || "",
    flagged: report.flagged || false,
    flaggedReason: report.flagged_reason || report.flaggedReason || "",
    physicianNotes: report.physician_notes || report.physicianNotes || "",
    patient: {
      firstName,
      lastName,
      email,
      dob,
      phone,
      age: content?.patient_info?.age || report.patientAge || 40,
      gender: content?.patient_info?.gender || report.patientGender || "Not specified",
    },
    suggestedProtocol: {
      id: report.suggested_protocol_id || report.suggestedProtocolId || "",
      name: proto?.name || report.suggestedProtocolName || "Unknown Protocol",
      description: proto?.description || report.suggestedProtocolDescription || "",
      indications: proto?.indications || report.suggestedProtocolIndications || "",
      contraindications: proto?.contraindications || report.suggestedProtocolContraindications || "",
      typicalDosage: proto?.typical_dosage || report.suggestedProtocolTypicalDosage || "",
      confidenceScore: proto?.confidence_score ?? report.suggestedProtocolConfidence ?? 0,
    },
    approvedProtocolId: report.approved_protocol_id || report.approvedProtocolId || null,
    adverseEvents: report.adverseEvents || [],
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadReport() {
      const id = params.id as string;
      try {
        const data = await getReportDetails(id);
        setReportData(data);
        setApiAvailable(true);
        setPhysicianNotes(data.physician_notes || "");
      } catch {
        // Backend not available - use mock data
        const mock = getReportById(id);
        setReportData(mock);
        setApiAvailable(false);
        if (mock) setPhysicianNotes(mock.physicianNotes || "");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-ogi-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  const report = extractReportData(reportData);

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Report Not Found</h2>
          <p className="mt-2 text-gray-500">The report you are looking for does not exist.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center text-sm font-medium text-ogi-600 hover:text-ogi-500"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[report.status] || statusConfig.draft;

  const handleApprove = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      if (apiAvailable) {
        await approveReport(report.id, "physician-1", report.suggestedProtocol.id);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setActionMessage({
        type: "success",
        text: "Report approved successfully. A billing event for $15.00 has been recorded.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to approve report. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      if (apiAvailable) {
        await rejectReport(report.id, physicianNotes || "Report rejected by physician");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setActionMessage({
        type: "success",
        text: "Report has been rejected. The referring clinician will be notified.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to reject report. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {report.patient.firstName} {report.patient.lastName}
              </h1>
              <p className="text-sm text-gray-500">Wellness Report Review</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(report.status === "draft" || report.status === "review_pending") && (
              <>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-clinical-success px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Approve Report
                </button>
              </>
            )}
            {report.status === "approved" && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                Approved
              </span>
            )}
            {report.status === "rejected" && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Rejected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Action Message */}
      {actionMessage && (
        <div
          className={`mx-8 mt-4 rounded-lg p-4 ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p className={`text-sm font-medium ${actionMessage.type === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {actionMessage.text}
          </p>
        </div>
      )}

      {/* API Status Indicator */}
            {!apiAvailable && (
              <div className="mx-8 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-700">
                  Backend API is offline. Using mock data for display. Actions will be simulated.
                </p>
              </div>
            )}

            {/* Adverse Event Alert Banners */}
            {report.adverseEvents && report.adverseEvents.length > 0 && (
              <div className="mx-8 mt-4 space-y-3">
                {report.adverseEvents.map((ae: any) => {
                  const isCritical = ae.severity === "critical";
                  const isHigh = ae.severity === "high";
                  const isResolved = ae.resolvedAt;
                  return (
                    <div
                      key={ae.id}
                      className={`rounded-lg border p-4 ${
                        isResolved
                          ? "border-emerald-200 bg-emerald-50"
                          : isCritical
                          ? "border-red-300 bg-red-50"
                          : isHigh
                          ? "border-orange-300 bg-orange-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-600"
                            : isCritical
                            ? "bg-red-100 text-red-600"
                            : isHigh
                            ? "bg-orange-100 text-orange-600"
                            : "bg-amber-100 text-amber-600"
                        }`}>
                          {isResolved ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${
                              isResolved ? "text-emerald-800" : isCritical ? "text-red-800" : isHigh ? "text-orange-800" : "text-amber-800"
                            }`}>
                              {isResolved ? "Resolved: " : ""}Adverse Event Detected
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                              isResolved
                                ? "bg-emerald-200 text-emerald-800"
                                : isCritical
                                ? "bg-red-200 text-red-800"
                                : isHigh
                                ? "bg-orange-200 text-orange-800"
                                : "bg-amber-200 text-amber-800"
                            }`}>
                              {isResolved ? "Resolved" : ae.severity}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-700">
                              {ae.type.replace("_", " ")}
                            </span>
                          </div>
                          <p className={`mt-1 text-sm ${
                            isResolved ? "text-emerald-700" : isCritical ? "text-red-700" : isHigh ? "text-orange-700" : "text-amber-700"
                          }`}>
                            {ae.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>Detected: {new Date(ae.detectedAt).toLocaleDateString()}</span>
                            {ae.resolvedAt && (
                              <span>Resolved: {new Date(ae.resolvedAt).toLocaleDateString()} by {ae.resolvedBy}</span>
                            )}
                            {ae.notes && <span className="italic">{ae.notes}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Full Name</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {report.patient.firstName} {report.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Date of Birth</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{report.patient.dob || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Age / Gender</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {report.patient.age} yrs / {report.patient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Email</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{report.patient.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Phone</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{report.patient.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Intake Date</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{report.intakeDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-ogi-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">AI Analysis Summary</h2>
                  <span className="ml-auto inline-flex items-center rounded-full bg-ogi-50 px-2.5 py-0.5 text-xs font-medium text-ogi-700">
                    Confidence: {report.suggestedProtocol.confidenceScore}%
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-700">{report.aiSummary}</p>
                {report.flagged && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-clinical-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-red-800">Contraindication Flagged</p>
                        <p className="text-sm text-red-600">{report.flaggedReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Protocol Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Suggested Protocol</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{report.suggestedProtocol.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{report.suggestedProtocol.description}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Indications</p>
                    <p className="mt-1 text-sm text-gray-700">{report.suggestedProtocol.indications}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Contraindications</p>
                    <p className="mt-1 text-sm text-gray-700">{report.suggestedProtocol.contraindications}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Typical Dosage</p>
                    <p className="mt-1 text-sm text-gray-700">{report.suggestedProtocol.typicalDosage}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Physician Notes */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Physician Notes</h2>
              </div>
              <div className="p-6">
                <textarea
                  placeholder="Add your clinical notes, adjustments to the protocol, or special instructions..."
                  value={physicianNotes}
                  onChange={(e) => setPhysicianNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-ogi-400 focus:outline-none focus:ring-2 focus:ring-ogi-50 resize-none"
                />
                <p className="mt-2 text-xs text-gray-400">
                  These notes will be included in the final wellness report sent to the patient.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Report Status</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Protocol Match</span>
                  <span className="text-sm font-medium text-gray-900">{report.suggestedProtocol.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-5 space-y-3">
                <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Patient Data
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Patient Summary
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Request Lab Work
                </button>
              </div>
            </div>

            {/* Billing Info Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Billing</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">PPR Fee</span>
                  <span className="text-sm font-medium text-gray-900">$15.00</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Per-Patient Report fee will be billed upon approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}