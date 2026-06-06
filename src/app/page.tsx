import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#0A1F44]/10 bg-deep-navy/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/ogi-logo-primary.svg" alt="Ogi" className="h-8 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Benefits
            </a>
            <a href="#ecosystem" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Ecosystem
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-ogi-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ocean-blue transition-colors"
            >
              Physician Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28 gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#1A6BFF_0%,transparent_60%)] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
              <span className="mr-2 h-2 w-2 rounded-full bg-teal-accent animate-pulse" />
              Now available for MSO-affiliated practices
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Clinical Intelligence,{" "}
              <span className="bg-gradient-to-r from-teal-accent to-white bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80 lg:text-xl">
              Transform your independent practice with Ogi — the white-labeled AI platform that
              automates patient screening, generates provider-approved wellness reports, and
              streamlines your clinical workflow.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ogi-blue shadow-md hover:bg-sky-blue transition-colors"
              >
                Access the Dashboard
              </Link>
              <a
                href="#features"
                className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-deep-navy/20 overflow-hidden backdrop-blur-sm">
              <div className="flex h-10 items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-gray-400">Ogi Clinical Intelligence Platform</span>
              </div>
              <div className="flex">
                <div className="hidden w-56 border-r border-gray-100 bg-gray-50/50 p-4 sm:block">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-ogi-500" />
                    <span className="text-sm font-semibold text-gray-900">Ogi</span>
                  </div>
                  {["Dashboard", "Patients", "Protocols", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      className={`mb-1 rounded-md px-3 py-2 text-sm ${
                        i === 0 ? "bg-ogi-50 text-ogi-700 font-medium" : "text-gray-500"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-5">
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    {["Pending", "Approved", "Flagged"].map((label) => (
                      <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="h-2 w-16 rounded bg-gray-200" />
                        <div className="mt-2 h-6 w-10 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="mb-2 flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-ogi-100" />
                      <div className="flex-1">
                        <div className="h-3 w-32 rounded bg-gray-200" />
                        <div className="mt-1 h-2 w-48 rounded bg-gray-100" />
                      </div>
                      <div className="h-5 w-16 rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-sky-blue py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-ogi-blue">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-deep-navy sm:text-4xl">
              Intelligent tools for modern practices
            </p>
            <p className="mt-4 text-lg text-brand-gray-700">
              Ogi transforms how independent physicians identify, treat, and retain patients
              seeking advanced wellness protocols.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Intelligent Intake Screening",
                description:
                  "AI-powered analysis of digital intake forms that automatically identifies candidates for peptide therapy and flags contraindications for physician review.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: "Provider-Approved Reports",
                description:
                  "AI generates comprehensive wellness reports which physicians review, edit, and digitally approve — keeping the licensed provider in the loop for full compliance.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Protocol Flagging Engine",
                description:
                  "Our clinical intelligence compares patient biomarkers and symptoms against a library of protocols (GLP-1, BPC-157, TB-500, GHK-Cu) with confidence scoring.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: "Automated Follow-up",
                description:
                  "Post-consultation sequences keep patients engaged and adherent. Automated check-ins monitor progress and surface data for the next physician review.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
              },
              {
                title: "Lead Scoring & Routing",
                description:
                  "Score and route qualified leads before they reach a telehealth consult. Physicians spend time with candidates who are genuinely ready for treatment.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: "White-Label Infrastructure",
                description:
                  "Your practice, your brand. Ogi supports custom domains, logos, and color themes so the platform feels like a natural extension of your clinic.",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_3px_rgba(10,31,68,0.08),0_1px_2px_rgba(10,31,68,0.06)] hover:shadow-[0_10px_15px_rgba(10,31,68,0.1),0_4px_6px_rgba(10,31,68,0.05)] transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-blue text-ogi-blue">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-deep-navy">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-ogi-blue">Simple workflow</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-deep-navy sm:text-4xl">
              How Ogi Works
            </p>
            <p className="mt-4 text-lg text-brand-gray-700">
              From patient intake to approved wellness report in three streamlined steps.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Patient Intake",
                description:
                  "Patients complete digital intake forms. Ogi's AI analyzes biomarkers, symptoms, and goals against a library of clinical protocols.",
                color: "gradient-primary",
              },
              {
                step: "02",
                title: "Physician Review",
                description:
                  "A detailed wellness report is generated with suggested protocols. The physician reviews, modifies, and approves — always keeping the human in the loop.",
                color: "gradient-wellness",
              },
              {
                step: "03",
                title: "Care Delivery",
                description:
                  "Approved reports are delivered to patients. Follow-up sequences are automated, and billing events are recorded seamlessly.",
                color: "bg-ogi-700",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / MSO Section */}
      <section id="benefits" className="bg-sky-blue py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-ogi-blue">For your practice</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-deep-navy sm:text-4xl">
              Built for the MSO Network
            </p>
            <p className="mt-4 text-lg text-brand-gray-700">
              Ogi is a premium infrastructure benefit for Dessaint Health MSO-affiliated practices.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                title: "Recurring Revenue",
                description:
                  "Monthly SaaS licensing + per-patient report fees create predictable, scalable income that grows with your patient volume.",
                stat: "2x",
                statLabel: "Revenue streams",
              },
              {
                title: "Clinical Efficiency",
                description:
                  "AI pre-screens every intake, saving hours of manual chart review and ensuring no candidate is missed.",
                stat: "80%",
                statLabel: "Faster screening",
              },
              {
                title: "Compliance First",
                description:
                  "Every report requires physician approval. Full audit trails, HIPAA-compliant encryption, and role-based access control.",
                stat: "100%",
                statLabel: "Physician oversight",
              },
              {
                title: "Ecosystem Synergy",
                description:
                  "Integrated with Dessaint Research Supply for fulfillment and Bear Market Bullies for research and patient acquisition.",
                stat: "3×",
                statLabel: "Ecosystem leverage",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_3px_rgba(10,31,68,0.08),0_1px_2px_rgba(10,31,68,0.06)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-deep-navy">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-brand-gray-700">{benefit.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-ogi-blue">{benefit.stat}</p>
                    <p className="text-xs text-brand-gray-500">{benefit.statLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-ogi-blue">Integrated ecosystem</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-deep-navy sm:text-4xl">
              A Closed-Loop System
            </p>
            <p className="mt-4 text-lg text-brand-gray-700">
              Ogi connects the entire patient journey — from lead generation to fulfillment.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-ogi-blue/10 bg-sky-blue p-6">
              <h3 className="font-semibold text-deep-navy">Dessaint Research Supply</h3>
              <p className="mt-2 text-sm text-brand-gray-700">
                The AI platform naturally drives demand for high-quality peptides. Future iterations will
                link protocol approval directly to supply chain logistics.
              </p>
            </div>
            <div className="rounded-xl border border-ogi-blue/10 bg-sky-blue p-6">
              <h3 className="font-semibold text-deep-navy">Bear Market Bullies</h3>
              <p className="mt-2 text-sm text-brand-gray-700">
                Anonymized market research and protocol summaries fuel the newsletter, establishing Ogi
                as a thought leader while converting readers into patients.
              </p>
            </div>
            <div className="rounded-xl border border-ogi-blue/10 bg-sky-blue p-6">
              <h3 className="font-semibold text-deep-navy">Dessaint Global Holdings</h3>
              <p className="mt-2 text-sm text-brand-gray-700">
                All revenue flows into DGH, leveraging IBC policy for platform buildout as a business
                loan — creating a self-funding banking system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-deep-navy py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your practice?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Join the Dessaint Health MSO network and get access to Ogi — the clinical intelligence
              platform that helps you deliver better care and grow your practice.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ogi-blue shadow-md hover:bg-sky-blue transition-colors"
              >
                Access the Dashboard
              </Link>
              <a
                href="mailto:info@ogi.health"
                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-navy py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <img src="/brand/ogi-logo-secondary.svg" alt="Ogi" className="h-6 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-white/60">
              &copy; {new Date().getFullYear()} Ogi. A Dessaint Global Holdings company. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}