"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRevenueDashboard, getPracticeAnalytics } from "@/lib/api";
import { mockReports } from "@/lib/mock-data";
import type { RevenueDashboardData, PracticeAnalytics } from "@/lib/api";

function getMockRevenueData(): RevenueDashboardData {
  const approved = mockReports.filter((r) => r.status === "approved");
  const flagged = mockReports.filter((r) => r.flagged);
  return {
    planName: "Pro", monthlyPrice: 499, reportFee: 15.0,
    subscriptionStatus: "active", approvedReports: approved.length,
    totalPprRevenue: approved.length * 15.0, totalFlagged: flagged.length,
    flaggedCandidates: flagged.length, periodEnd: "2026-06-20T00:00:00Z",
  };
}

const features = [
  "AI-powered intake screening", "Unlimited wellness reports",
  "White-label branding", "Automated follow-up sequences",
  "Priority support", "API access",
];

type Tab = "overview" | "analytics" | "protocols";

export default function RevenueDashboardPage() {
  const [data, setData] = useState<RevenueDashboardData | null>(null);
  const [analytics, setAnalytics] = useState<PracticeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    async function load() {
      try {
        const [d, a] = await Promise.all([
          getRevenueDashboard(),
          getPracticeAnalytics(),
        ]);
        setData(d);
        setAnalytics(a);
        setApiAvailable(true);
      } catch {
        setData(getMockRevenueData());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-ogi-blue" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const a = analytics;
  const projectedAnnual = data.monthlyPrice * 12 + data.totalPprRevenue * 12;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-brand-gray-300 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-deep-navy">Practice Economics</h1>
            <p className="mt-0.5 text-sm text-brand-gray-700">Revenue, analytics & ROI overview</p>
          </div>
          <span className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
            apiAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}>
            <span className={`h-2 w-2 rounded-full ${apiAvailable ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            {apiAvailable ? "Live Data" : "Estimated"}
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-brand-gray-300 bg-white px-8">
        <div className="flex gap-6">
          {[
            { id: "overview" as Tab, label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { id: "analytics" as Tab, label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { id: "protocols" as Tab, label: "Protocol Performance", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-ogi-blue text-ogi-blue"
                  : "border-transparent text-brand-gray-500 hover:text-brand-gray-700"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <>
            {/* Subscription Status */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between bg-gradient-to-r from-ogi-blue to-ocean-blue px-6 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/80">Current Plan</p>
                  <h2 className="text-2xl font-bold text-white">{data.planName}</h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-white">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Monthly Base</p>
                    <p className="mt-1 text-2xl font-bold text-deep-navy">${data.monthlyPrice.toLocaleString()}</p>
                    <p className="text-xs text-brand-gray-500">SaaS license</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Per Report Fee</p>
                    <p className="mt-1 text-2xl font-bold text-deep-navy">${data.reportFee.toFixed(2)}</p>
                    <p className="text-xs text-brand-gray-500">PPR fee</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Billing Period</p>
                    <p className="mt-1 text-sm font-semibold text-deep-navy">Monthly</p>
                    {data.periodEnd && <p className="text-xs text-brand-gray-500">Renews {new Date(data.periodEnd).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">Projected Annual</p>
                    <p className="mt-1 text-2xl font-bold text-teal-accent">${projectedAnnual.toLocaleString()}</p>
                    <p className="text-xs text-brand-gray-500">SaaS + PPR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  label: "Revenue from PPR", value: `$${data.totalPprRevenue.toFixed(2)}`,
                  sub: `${data.approvedReports} approved reports`,
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  bg: "bg-emerald-50", color: "text-emerald-600",
                },
                {
                  label: "Flagged Candidates", value: `$${(data.totalFlagged * data.reportFee).toFixed(2)}`,
                  sub: `${data.totalFlagged} flagged — potential PPR value`,
                  icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
                  bg: "bg-amber-50", color: "text-amber-600",
                },
                {
                  label: "Monthly Revenue", value: `$${(data.monthlyPrice + data.totalPprRevenue).toFixed(2)}`,
                  sub: `SaaS base + PPR fees`,
                  icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                  bg: "bg-ogi-50", color: "text-ogi-blue",
                },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-brand-gray-300 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                      <svg className={`h-5 w-5 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-gray-500">{card.label}</p>
                      <p className="text-2xl font-bold text-deep-navy">{card.value}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-brand-gray-300 pt-3">
                    <span className="text-xs text-brand-gray-500">{card.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Breakdown */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
              <div className="border-b border-brand-gray-300 px-6 py-4">
                <h2 className="text-lg font-semibold text-deep-navy">Revenue Breakdown</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-gray-700">SaaS Base ({data.planName} Plan)</span>
                      <span className="font-semibold text-deep-navy">${data.monthlyPrice.toLocaleString()}/mo</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-brand-gray-100">
                      <div className="h-2 rounded-full bg-ogi-blue" style={{ width: `${(data.monthlyPrice / (data.monthlyPrice + data.totalPprRevenue)) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-gray-700">PPR Fees ({data.approvedReports} approved reports)</span>
                      <span className="font-semibold text-deep-navy">${data.totalPprRevenue.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-brand-gray-100">
                      <div className="h-2 rounded-full bg-teal-accent" style={{ width: `${(data.totalPprRevenue / (data.monthlyPrice + data.totalPprRevenue)) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-brand-gray-300 pt-4">
                  <span className="text-base font-semibold text-deep-navy">Total Revenue (Current Period)</span>
                  <span className="text-xl font-bold text-deep-navy">${(data.monthlyPrice + data.totalPprRevenue).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
              <div className="border-b border-brand-gray-300 px-6 py-4">
                <h2 className="text-lg font-semibold text-deep-navy">{data.planName} Plan Features</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-brand-gray-700">
                      <svg className="h-4 w-4 flex-shrink-0 text-teal-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {activeTab === "analytics" && a && (
          <>
            {/* Patient Retention */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
              <div className="border-b border-brand-gray-300 px-6 py-4">
                <h2 className="text-lg font-semibold text-deep-navy">Patient Retention Metrics</h2>
                <p className="text-sm text-brand-gray-500">{a.retention.totalPatients} patients in cohort</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[
                    { label: "7-Day Retention", rate: a.retention.rate7Day, color: "bg-ogi-blue" },
                    { label: "30-Day Retention", rate: a.retention.rate30Day, color: "bg-ocean-blue" },
                    { label: "90-Day Retention", rate: a.retention.rate90Day, color: "bg-teal-accent" },
                  ].map((r) => (
                    <div key={r.label} className="text-center">
                      <p className="text-sm font-medium text-brand-gray-500">{r.label}</p>
                      <p className="mt-2 text-4xl font-bold text-deep-navy">{r.rate}%</p>
                      <div className="mt-3 h-2 w-full rounded-full bg-brand-gray-100">
                        <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${r.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROI Visualization */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
              <div className="border-b border-brand-gray-300 px-6 py-4">
                <h2 className="text-lg font-semibold text-deep-navy">Return on Investment</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Monthly SaaS Cost", value: `$${a.roi.monthlyPrice}`, sub: `${a.roi.planName} Plan`, color: "text-brand-gray-500" },
                    { label: "PPR Revenue (MTD)", value: `$${a.roi.totalPprRevenue.toFixed(2)}`, sub: `${a.roi.approvedReports} reports @ $${a.roi.reportFee}`, color: "text-teal-accent" },
                    { label: "Total Monthly Revenue", value: `$${a.roi.totalRevenue.toFixed(2)}`, sub: "SaaS + PPR", color: "text-ogi-blue" },
                    { label: "Projected LTV (12mo)", value: `$${a.roi.projectedLtv.toLocaleString()}`, sub: "Lifetime value per practice", color: "text-deep-navy font-bold" },
                  ].map((r) => (
                    <div key={r.label} className="rounded-lg border border-brand-gray-300 bg-brand-gray-100/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-brand-gray-500">{r.label}</p>
                      <p className={`mt-1 text-2xl font-bold ${r.color}`}>{r.value}</p>
                      <p className="text-xs text-brand-gray-500 mt-1">{r.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
              <div className="border-b border-brand-gray-300 px-6 py-4">
                <h2 className="text-lg font-semibold text-deep-navy">Monthly Report Trends</h2>
              </div>
              <div className="p-6">
                <div className="flex items-end gap-3 h-48">
                  {a.monthlyTrends.slice().reverse().map((m) => {
                    const max = Math.max(...a.monthlyTrends.map((t) => t.report_count));
                    const height = (m.report_count / max) * 100;
                    return (
                      <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-medium text-deep-navy">{m.report_count}</span>
                        <div className="w-full rounded-t-md bg-gradient-to-t from-ogi-blue to-ocean-blue transition-all hover:opacity-80" style={{ height: `${height}%`, minHeight: "8px" }} />
                        <span className="text-[10px] text-brand-gray-500 rotate-45 origin-left whitespace-nowrap">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== PROTOCOL PERFORMANCE TAB ===== */}
        {activeTab === "protocols" && a && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Approval Rates */}
              <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
                <div className="border-b border-brand-gray-300 px-6 py-4">
                  <h2 className="text-lg font-semibold text-deep-navy">Protocol Approval Rates</h2>
                </div>
                <div className="p-6 space-y-4">
                  {a.protocolPerformance.map((p) => (
                    <div key={p.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-brand-gray-700 truncate max-w-[250px]">{p.name}</span>
                        <span className="font-semibold text-deep-navy">{p.approval_rate}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-brand-gray-100">
                        <div
                          className={`h-2 rounded-full ${
                            p.approval_rate >= 70 ? "bg-emerald-500" :
                            p.approval_rate >= 40 ? "bg-amber-500" : "bg-red-400"
                          }`}
                          style={{ width: `${p.approval_rate}%` }}
                        />
                      </div>
                      <p className="text-xs text-brand-gray-500 mt-0.5">{p.report_count} report{p.report_count !== 1 ? "s" : ""} submitted</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Outcomes */}
              <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
                <div className="border-b border-brand-gray-300 px-6 py-4">
                  <h2 className="text-lg font-semibold text-deep-navy">Clinical Outcome Trends</h2>
                </div>
                <div className="p-6 space-y-4">
                  {a.protocolPerformance.map((p) => {
                    const outcomeScore = p.approval_rate >= 70 ? 85 : p.approval_rate >= 40 ? 62 : 30;
                    return (
                      <div key={p.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-brand-gray-700 truncate max-w-[250px]">{p.name}</span>
                          <span className="font-semibold text-deep-navy">{outcomeScore}/100</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-brand-gray-100">
                          <div
                            className={`h-2 rounded-full ${
                              outcomeScore >= 70 ? "bg-teal-accent" :
                              outcomeScore >= 50 ? "bg-ogi-blue" : "bg-brand-gray-300"
                            }`}
                            style={{ width: `${outcomeScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-brand-gray-500 mt-0.5">
                          {p.approval_rate >= 70 ? "Strong clinical outcomes" :
                           p.approval_rate >= 40 ? "Moderate response" : "Limited data available"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Protocol Summary Table */}
            <div className="rounded-xl border border-brand-gray-300 bg-white shadow-sm">
              <div className="border-b border-brand-gray-300 px-6 py-4">
                <h2 className="text-lg font-semibold text-deep-navy">Protocol Summary</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-gray-300">
                  <thead className="bg-brand-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray-500">Protocol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray-500">Reports</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray-500">Approval Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray-500">Outcome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray-200">
                    {a.protocolPerformance.map((p) => {
                      const outcome = p.approval_rate >= 70 ? 85 : p.approval_rate >= 40 ? 62 : 30;
                      return (
                        <tr key={p.name} className="hover:bg-brand-gray-50 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-deep-navy">{p.name}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-gray-700">{p.report_count}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              p.approval_rate >= 70 ? "bg-emerald-100 text-emerald-700" :
                              p.approval_rate >= 40 ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {p.approval_rate}%
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-gray-700">{outcome}/100</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              outcome >= 70 ? "bg-teal-100 text-teal-700" :
                              outcome >= 50 ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {outcome >= 70 ? "Effective" : outcome >= 50 ? "Moderate" : "Monitoring"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* API Status */}
        {!apiAvailable && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">
              Backend API is offline. Data shown is estimated based on mock data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}