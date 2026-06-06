"use client";

import { useState, useEffect } from "react";
import { mockReports, dashboardStats, ReportStatus } from "@/lib/mock-data";
import { getReports } from "@/lib/api";
import type { WellnessReport as ApiReport } from "@/lib/api";
import ReportCard from "@/components/ReportCard";

const statusFilters: { label: string; value: ReportStatus | "all" }[] = [
  { label: "All Reports", value: "all" },
  { label: "Drafts", value: "draft" },
  { label: "Pending Review", value: "review_pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// Convert API report format to component-compatible format
function adaptReport(r: ApiReport) {
  const firstName = r.patient?.first_name || r.patient_first_name || "Unknown";
  const lastName = r.patient?.last_name || r.patient_last_name || "Patient";
  const email = r.patient?.email || r.patient_email || "";
  const age = r.content?.patient_info?.age ?? 40;
  const gender = r.content?.patient_info?.gender ?? "Not specified";
  const proto = r.content?.suggested_protocol;

  return {
    id: r.id,
    patient: {
      id: r.intake_id,
      firstName,
      lastName,
      email,
      dob: r.patient?.dob || "",
      age,
      gender,
      phone: r.patient?.phone || "",
    },
    intakeDate: r.created_at?.split("T")[0] || "Unknown",
    aiSummary: r.content?.ai_summary || "AI analysis pending...",
    status: r.status as ReportStatus,
    suggestedProtocol: {
      id: r.suggested_protocol_id,
      name: proto?.name || r.suggested_protocol_name || "Unknown Protocol",
      description: proto?.description || "",
      indications: proto?.indications || "",
      contraindications: proto?.contraindications || "",
      typicalDosage: proto?.typical_dosage || "",
      confidenceScore: proto?.confidence_score ?? 75,
    },
    approvedProtocol: null,
    physicianNotes: r.physician_notes || "",
    createdAt: r.created_at,
    flagged: false,
    flaggedReason: "",
    adverseEvents: [],
  };
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<ReportStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiReports, setApiReports] = useState<ApiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports();
        setApiReports(data);
        setApiAvailable(true);
      } catch {
        // Backend not available, using mock data
        setApiAvailable(false);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Use API reports if available, otherwise use mock data
  const reports = apiAvailable
    ? apiReports.map(adaptReport)
    : mockReports;

  const filteredReports = (activeFilter === "all"
    ? reports
    : reports.filter((r) => r.status === activeFilter)
  ).filter(
    (r) =>
      `${r.patient.firstName} ${r.patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      r.suggestedProtocol.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const draftReports = reports.filter((r) => r.status === "draft");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Physician Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Review and manage AI-generated wellness reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
              loading ? "bg-gray-100 text-gray-500" :
              apiAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                loading ? "bg-gray-400" :
                apiAvailable ? "bg-emerald-500" : "bg-amber-500"
              } ${loading ? "" : "animate-pulse"}`} />
              {loading ? "Connecting..." : apiAvailable ? "API Online" : "Offline (Mock Data)"}
            </span>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Reports</p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">{dashboardStats.totalReports}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Pending Review</p>
            <p className="mt-1.5 text-2xl font-bold text-amber-900">{dashboardStats.pendingReview}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Approved Today</p>
            <p className="mt-1.5 text-2xl font-bold text-emerald-900">{dashboardStats.approvedToday}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">Flagged</p>
            <p className="mt-1.5 text-2xl font-bold text-red-900">{dashboardStats.flaggedReports}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active Patients</p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">{dashboardStats.activePatients}</p>
          </div>
        </div>

        {/* Drafts Alert */}
        {draftReports.length > 0 && (
          <div className="mb-6 rounded-xl border border-ogi-200 bg-ogi-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ogi-100">
                <svg className="h-4 w-4 text-ogi-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-ogi-800">
                  You have <strong>{draftReports.length}</strong> draft report{draftReports.length > 1 ? "s" : ""}{" "}
                  awaiting your review
                </p>
                <p className="text-xs text-ogi-600 mt-0.5">
                  Review and approve reports to continue providing care to your patients.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === filter.value
                    ? "bg-ogi-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search patients or protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-ogi-400 focus:outline-none focus:ring-2 focus:ring-ogi-50"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-ogi-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Loading reports...</span>
          </div>
        )}

        {/* Reports Grid */}
        {!loading && filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No reports match your current filter or search criteria.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}