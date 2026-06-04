"use client";

import { WellnessReport, AdverseEvent } from "@/lib/mock-data";
import Link from "next/link";

interface ReportCardProps {
  report: WellnessReport;
}

const statusConfig = {
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700" },
  review_pending: { label: "Pending Review", bg: "bg-amber-100", text: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  sent: { label: "Sent to Patient", bg: "bg-blue-100", text: "text-blue-700" },
};

const aeSeverityConfig: Record<string, { label: string; bg: string; text: string }> = {
  critical: { label: "CRITICAL", bg: "bg-red-600", text: "text-white" },
  high: { label: "HIGH", bg: "bg-orange-500", text: "text-white" },
  moderate: { label: "MODERATE", bg: "bg-amber-500", text: "text-white" },
  low: { label: "LOW", bg: "bg-gray-400", text: "text-white" },
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function hasCriticalOrHighAdverseEvents(events: AdverseEvent[]): boolean {
  return events.some((e) => e.severity === "critical" || e.severity === "high");
}

function countBySeverity(events: AdverseEvent[], severity: string): number {
  return events.filter((e) => e.severity === severity).length;
}

export default function ReportCard({ report }: ReportCardProps) {
  const status = statusConfig[report.status];
  const hasUrgentAe = hasCriticalOrHighAdverseEvents(report.adverseEvents);
  const criticalCount = countBySeverity(report.adverseEvents, "critical");
  const highCount = countBySeverity(report.adverseEvents, "high");
  const totalAe = report.adverseEvents.length;

  return (
    <Link href={`/dashboard/reports/${report.id}`}>
      <div className={`group rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:cursor-pointer ${
        hasUrgentAe
          ? "border-red-300 hover:border-red-400 ring-1 ring-red-100"
          : report.flagged
          ? "border-amber-200 hover:border-amber-300"
          : "border-gray-200 hover:border-ogi-200"
      }`}>
        {/* Urgent Banner */}
        {hasUrgentAe && (
          <div className="-mx-5 -mt-5 mb-4 rounded-t-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                URGENT{criticalCount > 0 ? ` — ${criticalCount} Critical` : ""}{highCount > 0 ? ` — ${highCount} High` : ""} Adverse Event{totalAe > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${
              hasUrgentAe
                ? "bg-red-50 text-red-700"
                : report.flagged
                ? "bg-amber-50 text-amber-700"
                : "bg-ogi-50 text-ogi-700"
            }`}>
              {report.patient.firstName[0]}
              {report.patient.lastName[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-ogi-700 transition-colors">
                {report.patient.firstName} {report.patient.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {report.patient.gender}, {report.patient.age} yrs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalAe > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {totalAe}
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>
              Suggested: <strong>{report.suggestedProtocol.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Intake: {formatDate(report.intakeDate)}</span>
          </div>

          {/* Adverse Event Badges */}
          {totalAe > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {report.adverseEvents.map((ae) => {
                const cfg = aeSeverityConfig[ae.severity] || aeSeverityConfig.low;
                return (
                  <span key={ae.id} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
                    {ae.type.replace("_", " ")}
                  </span>
                );
              })}
            </div>
          )}

          {report.flagged && !hasUrgentAe && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="truncate">{report.flaggedReason}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Confidence:</span>
            <div className="flex items-center">
              <div className="h-1.5 w-20 rounded-full bg-gray-200">
                <div
                  className={`h-1.5 rounded-full ${
                    report.suggestedProtocol.confidenceScore >= 80
                      ? "bg-clinical-success"
                      : report.suggestedProtocol.confidenceScore >= 65
                      ? "bg-clinical-warning"
                      : "bg-clinical-danger"
                  }`}
                  style={{ width: `${report.suggestedProtocol.confidenceScore}%` }}
                />
              </div>
              <span className="ml-1.5 text-xs font-medium text-gray-500">
                {report.suggestedProtocol.confidenceScore}%
              </span>
            </div>
          </div>
          <svg
            className="h-4 w-4 text-gray-300 group-hover:text-ogi-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}