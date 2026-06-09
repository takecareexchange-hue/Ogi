"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { mockReports } from "@/lib/mock-data";
import type { AdverseEvent } from "@/lib/mock-data";

// Collect all adverse events from all reports
function getAllAdverseEvents(): { event: AdverseEvent; patientName: string; patientInitials: string; reportId: string }[] {
  const result: { event: AdverseEvent; patientName: string; patientInitials: string; reportId: string }[] = [];
  for (const r of mockReports) {
    for (const ae of r.adverseEvents) {
      result.push({
        event: ae,
        patientName: `${r.patient.firstName} ${r.patient.lastName}`,
        patientInitials: `${r.patient.firstName[0]}${r.patient.lastName[0]}`,
        reportId: r.id,
      });
    }
  }
  return result;
}

const severityConfig = {
  critical: { label: "Critical", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  high: { label: "High", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  moderate: { label: "Moderate", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  low: { label: "Low", bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
};

const typeConfig: Record<string, { label: string; icon: ReactNode }> = {
  contraindication: {
    label: "Contraindication",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  medication_interaction: {
    label: "Medication Interaction",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  lab_abnormality: {
    label: "Lab Abnormality",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  patient_reaction: {
    label: "Patient Reaction",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  dosage_concern: {
    label: "Dosage Concern",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function AdverseEventsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [resolveFilter, setResolveFilter] = useState<string>("all");

  const allEvents = getAllAdverseEvents();

  const filtered = allEvents.filter((item) => {
    const sevMatch = severityFilter === "all" || item.event.severity === severityFilter;
    const resMatch =
      resolveFilter === "all" ||
      (resolveFilter === "unresolved" && item.event.resolvedAt === null) ||
      (resolveFilter === "resolved" && item.event.resolvedAt !== null);
    return sevMatch && resMatch;
  });

  const criticalCount = allEvents.filter((e) => e.event.severity === "critical").length;
  const unresolvedCount = allEvents.filter((e) => e.event.resolvedAt === null).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-brand-gray-300 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-deep-navy">Adverse Event Audit</h1>
            <p className="mt-0.5 text-sm text-brand-gray-700">
              {allEvents.length} total events &bull; {criticalCount} critical &bull; {unresolvedCount} unresolved
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Active Monitoring
            </span>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-brand-gray-300 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Total Events</p>
            <p className="mt-1.5 text-2xl font-bold text-deep-navy">{allEvents.length}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-red-700">Critical</p>
            <p className="mt-1.5 text-2xl font-bold text-red-900">{criticalCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Unresolved</p>
            <p className="mt-1.5 text-2xl font-bold text-amber-900">{unresolvedCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Resolved</p>
            <p className="mt-1.5 text-2xl font-bold text-emerald-900">{allEvents.length - unresolvedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Severity:</span>
          {["all", "critical", "high", "moderate", "low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                severityFilter === s
                  ? "bg-ogi-blue text-white shadow-sm"
                  : "bg-white text-brand-gray-700 border border-brand-gray-300 hover:bg-brand-gray-100"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
          <span className="ml-4 text-xs font-medium uppercase tracking-wider text-brand-gray-500">Status:</span>
          {["all", "unresolved", "resolved"].map((r) => (
            <button
              key={r}
              onClick={() => setResolveFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                resolveFilter === r
                  ? "bg-ogi-blue text-white shadow-sm"
                  : "bg-white text-brand-gray-700 border border-brand-gray-300 hover:bg-brand-gray-100"
              }`}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const sev = severityConfig[item.event.severity];
            const type = typeConfig[item.event.type] || typeConfig.contraindication;

            return (
              <Link key={item.event.id} href={`/dashboard/reports/${item.reportId}`}>
                <div className="group rounded-xl border border-brand-gray-300 bg-white shadow-sm hover:shadow-md hover:border-red-200 transition-all p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Severity Indicator */}
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                        item.event.severity === "critical" ? "bg-red-50 text-red-600" :
                        item.event.severity === "high" ? "bg-orange-50 text-orange-600" :
                        item.event.severity === "moderate" ? "bg-amber-50 text-amber-600" :
                        "bg-gray-50 text-gray-600"
                      }`}>
                        {type.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-deep-navy group-hover:text-ogi-blue transition-colors">
                            {item.patientName}
                          </h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sev.bg} ${sev.text}`}>
                            <span className={`mr-1 h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                            {sev.label}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-sky-blue px-2 py-0.5 text-xs font-medium text-ogi-blue">
                            {type.label}
                          </span>
                          {item.event.resolvedAt ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Resolved
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Unresolved
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-brand-gray-700">{item.event.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-brand-gray-500">
                          <span>Detected: {new Date(item.event.detectedAt).toLocaleDateString()}</span>
                          {item.event.resolvedAt && (
                            <span>Resolved: {new Date(item.event.resolvedAt).toLocaleDateString()} by {item.event.resolvedBy}</span>
                          )}
                          {item.event.notes && <span className="truncate max-w-xs">{item.event.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-brand-gray-300 group-hover:text-ogi-blue transition-colors flex-shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="h-12 w-12 text-brand-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-deep-navy">No events found</h3>
              <p className="mt-1 text-sm text-brand-gray-500">No adverse events match your current filters.</p>
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            Adverse event monitoring is active. Events are detected during AI-powered intake analysis and flagged for physician review. All data is HIPAA-compliant.
          </p>
        </div>
      </div>
    </div>
  );
}