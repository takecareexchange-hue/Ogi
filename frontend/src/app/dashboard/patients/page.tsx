"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPatients } from "@/lib/api";
import { mockReports } from "@/lib/mock-data";
import type { PatientRecord } from "@/lib/api";

// Use mock patients as fallback when API is unavailable
function getMockPatients(): PatientRecord[] {
  const seen = new Map<string, PatientRecord>();
  for (const r of mockReports) {
    const key = r.patient.email;
    if (!seen.has(key)) {
      seen.set(key, {
        id: r.patient.id,
        first_name: r.patient.firstName,
        last_name: r.patient.lastName,
        email: r.patient.email,
        dob: r.patient.dob,
        phone: r.patient.phone,
        age: r.patient.age,
        gender: r.patient.gender,
        latest_intake_date: r.intakeDate,
        latest_status: r.status,
        protocol_name: r.suggestedProtocol.name,
        report_count: mockReports.filter((rr) => rr.patient.email === r.patient.email).length,
      });
    }
  }
  return Array.from(seen.values());
}

const statusBadge: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700" },
  review_pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  sent: { label: "Sent", bg: "bg-blue-100", text: "text-blue-700" },
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [mockData, setMockData] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setMockData(getMockPatients());
    async function load() {
      try {
        const data = await getPatients();
        setPatients(data);
        setApiAvailable(true);
      } catch {
        setApiAvailable(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayPatients = apiAvailable ? patients : mockData;

  const filtered = displayPatients.filter((p) => {
    const nameMatch = `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "all" || p.latest_status === statusFilter;
    return nameMatch && statusMatch;
  });

  const statuses = ["all", ...new Set(displayPatients.map((p) => p.latest_status))];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {loading ? "Loading..." : `${displayPatients.length} patients in your practice`}
            </p>
          </div>
          <span className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
            loading ? "bg-gray-100 text-gray-500" :
            apiAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              loading ? "bg-gray-400" : apiAvailable ? "bg-emerald-500" : "bg-amber-500"
            } ${loading ? "" : "animate-pulse"}`} />
            {loading ? "Loading..." : apiAvailable ? "Live Data" : "Mock Data"}
          </span>
        </div>
      </header>

      <div className="p-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? "bg-ogi-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-ogi-400 focus:outline-none focus:ring-2 focus:ring-ogi-50"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-ogi-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Loading patients...</span>
          </div>
        )}

        {/* Patients Table */}
        {!loading && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Age / Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Protocol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reports</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const badge = statusBadge[p.latest_status] || statusBadge.draft;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ogi-50 text-ogi-700 font-semibold text-sm">
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                            <p className="text-xs text-gray-400">ID: {p.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {p.age} yrs / {p.gender}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        <p>{p.email}</p>
                        <p className="text-xs text-gray-400">{p.phone || "—"}</p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {p.protocol_name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-ogi-50 text-xs font-medium text-ogi-700">
                          {p.report_count}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/patients/${encodeURIComponent(p.email)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                      No patients found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}