"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getReports } from "@/lib/api";
import { mockReports } from "@/lib/mock-data";
import type { WellnessReport as ApiReport } from "@/lib/api";

interface PatientDetail {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  phone: string;
  age: number;
  gender: string;
  reports: {
    id: string;
    date: string;
    status: string;
    protocol: string;
    aiSummary: string;
    notes: string;
  }[];
}

const statusBadge: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700" },
  review_pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  sent: { label: "Sent", bg: "bg-blue-100", text: "text-blue-700" },
};

function buildPatientDetail(email: string): PatientDetail | null {
  // Try API data first
  // For now, extract from mock data
  const patientReports = mockReports.filter((r) => r.patient.email === email);
  if (patientReports.length === 0) return null;

  const p = patientReports[0].patient;
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    dob: p.dob,
    phone: p.phone,
    age: p.age,
    gender: p.gender,
    reports: patientReports.map((r) => ({
      id: r.id,
      date: r.intakeDate,
      status: r.status,
      protocol: r.suggestedProtocol.name,
      aiSummary: r.aiSummary,
      notes: r.physicianNotes,
    })),
  };
}

export default function PatientDetailPage() {
  const params = useParams();
  const email = decodeURIComponent(params.id as string);
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API first, fallback to mock
    const detail = buildPatientDetail(email);
    setPatient(detail);
    setLoading(false);
  }, [email]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-ogi-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Patient Not Found</h2>
          <p className="mt-2 text-gray-500">No patient found with this email.</p>
          <Link href="/dashboard/patients" className="mt-4 inline-flex text-sm font-medium text-ogi-600 hover:text-ogi-500">
            &larr; Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/patients" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
              <p className="text-sm text-gray-500">Patient Profile &bull; {patient.reports.length} report{patient.reports.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Patient Info Card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ogi-50 text-ogi-700 font-bold text-xl">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{patient.firstName} {patient.lastName}</h2>
                <p className="text-sm text-gray-500">{patient.age} yrs / {patient.gender}</p>
              </div>
              <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Email</p>
                  <p className="mt-0.5 text-sm text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Phone</p>
                  <p className="mt-0.5 text-sm text-gray-900">{patient.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Date of Birth</p>
                  <p className="mt-0.5 text-sm text-gray-900">{patient.dob || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Wellness Report History</h2>

            {patient.reports.map((report) => {
              const badge = statusBadge[report.status] || statusBadge.draft;
              return (
                <Link key={report.id} href={`/dashboard/reports/${report.id}`}>
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-ogi-200 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ogi-50">
                          <svg className="h-5 w-5 text-ogi-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-ogi-700 transition-colors">{report.protocol}</h3>
                          <p className="text-sm text-gray-500">Intake: {report.date}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{report.aiSummary}</p>

                    {report.notes && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">Physician Notes:</p>
                        <p className="mt-0.5 text-sm text-gray-700">{report.notes}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-xs text-gray-400">View full report</span>
                      <svg className="h-4 w-4 text-gray-300 group-hover:text-ogi-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}