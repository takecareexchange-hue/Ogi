"use client";

import { useState, useEffect } from "react";
import { getProtocols } from "@/lib/api";
import { mockReports } from "@/lib/mock-data";
import type { Protocol } from "@/lib/mock-data";
import type { ProtocolRecord } from "@/lib/api";

// Extract unique protocols from mock data
function getMockProtocols(): Protocol[] {
  const seen = new Map<string, Protocol>();
  for (const r of mockReports) {
    const p = r.suggestedProtocol;
    if (!seen.has(p.id)) seen.set(p.id, p);
  }
  for (const r of mockReports) {
    if (r.approvedProtocol && !seen.has(r.approvedProtocol.id)) {
      seen.set(r.approvedProtocol.id, r.approvedProtocol);
    }
  }
  return Array.from(seen.values());
}

function adaptProtocol(api: ProtocolRecord): Protocol {
  return {
    id: api.id,
    name: api.name,
    description: api.description || "",
    indications: api.indication_criteria || "",
    contraindications: api.contraindications || "",
    typicalDosage: api.typical_dosage || "",
    confidenceScore: 75,
  };
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const apiData = await getProtocols();
        setProtocols(apiData.map(adaptProtocol));
        setApiAvailable(true);
      } catch {
        setProtocols(getMockProtocols());
        setApiAvailable(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = protocols.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.indications.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-brand-gray-300 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-deep-navy">Protocol Library</h1>
            <p className="mt-0.5 text-sm text-brand-gray-700">
              {loading ? "Loading..." : `${protocols.length} wellness protocols available`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
              loading ? "bg-gray-100 text-gray-500" :
              apiAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                loading ? "bg-gray-400" : apiAvailable ? "bg-emerald-500" : "bg-amber-500"
              } ${loading ? "" : "animate-pulse"}`} />
              {loading ? "Connecting..." : apiAvailable ? "Live Data" : "Mock Data"}
            </span>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-lg border border-brand-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-brand-gray-900 placeholder-brand-gray-500 focus:border-ogi-blue focus:outline-none focus:ring-[3px] focus:ring-ogi-blue/15"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-brand-gray-300 bg-white p-4 shadow-[0_1px_3px_rgba(10,31,68,0.08),0_1px_2px_rgba(10,31,68,0.06)]">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Total Protocols</p>
            <p className="mt-1.5 text-2xl font-bold text-deep-navy">{protocols.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Active</p>
            <p className="mt-1.5 text-2xl font-bold text-emerald-900">{protocols.length}</p>
          </div>
          <div className="rounded-xl border border-ogi-blue/10 bg-sky-blue p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-ogi-blue">Avg. Match Rate</p>
            <p className="mt-1.5 text-2xl font-bold text-deep-navy">
              {protocols.length > 0
                ? Math.round(protocols.reduce((sum, p) => sum + p.confidenceScore, 0) / protocols.length)
                : 0}%
            </p>
          </div>
          <div className="rounded-xl border border-brand-gray-300 bg-white p-4 shadow-[0_1px_3px_rgba(10,31,68,0.08),0_1px_2px_rgba(10,31,68,0.06)]">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Reports Generated</p>
            <p className="mt-1.5 text-2xl font-bold text-deep-navy">{mockReports.length}</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-ogi-blue" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-sm text-brand-gray-500">Loading protocols...</span>
          </div>
        )}

        {/* Protocols */}
        {!loading && (
          <div className="space-y-4">
            {filtered.map((protocol) => {
              const isExpanded = expandedId === protocol.id;
              const reportCount = mockReports.filter((r) => r.suggestedProtocol.id === protocol.id).length;

              return (
                <div key={protocol.id} className="rounded-xl border border-brand-gray-300 bg-white shadow-[0_1px_3px_rgba(10,31,68,0.08),0_1px_2px_rgba(10,31,68,0.06)] overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : protocol.id)}
                    className="w-full flex items-start justify-between p-6 text-left hover:bg-brand-gray-100/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ogi-blue to-ocean-blue text-white font-bold text-sm shadow-sm">
                        {protocol.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-deep-navy">{protocol.name}</h3>
                        <p className="mt-1 text-sm text-brand-gray-700 max-w-2xl">{protocol.description}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="inline-flex items-center rounded-full bg-sky-blue px-2.5 py-0.5 text-xs font-medium text-ogi-blue">
                            Match: {protocol.confidenceScore}%
                          </span>
                          <span className="inline-flex items-center rounded-full bg-brand-gray-100 px-2.5 py-0.5 text-xs font-medium text-brand-gray-700">
                            {reportCount} report{reportCount !== 1 ? "s" : ""}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg className={`h-5 w-5 text-brand-gray-500 transition-transform mt-2 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-brand-gray-300 px-6 py-5 bg-brand-gray-100/50">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg border border-brand-gray-300 bg-white p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-deep-navy">Indications</h4>
                          </div>
                          <p className="text-sm text-brand-gray-700 leading-relaxed">{protocol.indications}</p>
                        </div>
                        <div className="rounded-lg border border-brand-gray-300 bg-white p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-clinical-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-deep-navy">Contraindications</h4>
                          </div>
                          <p className="text-sm text-brand-gray-700 leading-relaxed">{protocol.contraindications}</p>
                        </div>
                        <div className="rounded-lg border border-brand-gray-300 bg-white p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-clinical-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-deep-navy">Typical Dosage</h4>
                          </div>
                          <p className="text-sm text-brand-gray-700 leading-relaxed">{protocol.typicalDosage}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-deep-navy mb-3">Recent Reports Using This Protocol</h4>
                        <div className="space-y-2">
                          {mockReports.filter((r) => r.suggestedProtocol.id === protocol.id).slice(0, 3).map((r) => (
                            <div key={r.id} className="flex items-center justify-between rounded-lg border border-brand-gray-300 bg-white p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray-100 text-xs font-semibold text-brand-gray-700">
                                  {r.patient.firstName[0]}{r.patient.lastName[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-deep-navy">{r.patient.firstName} {r.patient.lastName}</p>
                                  <p className="text-xs text-brand-gray-500">{r.intakeDate}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                r.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                r.status === "rejected" ? "bg-red-100 text-red-700" :
                                r.status === "draft" ? "bg-brand-gray-100 text-brand-gray-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {r.status.replace("_", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="h-12 w-12 text-brand-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-sm font-semibold text-deep-navy">No protocols found</h3>
                <p className="mt-1 text-sm text-brand-gray-500">No protocols match your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}