import React from "react";
import { BookOpen, Clock, AlertTriangle, Scale, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#060606] text-zinc-300 pt-24 pb-20 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E8602E]/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#E8602E] hover:underline mb-8 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="border-b border-white/[0.06] pb-10 mb-12">
          <div className="flex items-center gap-2.5 px-3 py-1.5 mb-4 rounded-full text-xs font-bold text-[#E8602E] border border-[#E8602E]/20 bg-[#E8602E]/5 w-fit">
            <Scale className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Terms & <span className="text-[#E8602E]">Conditions</span>.
          </h1>
          <div className="flex items-center gap-4 text-xs text-zinc-500 font-semibold">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Updated: June 30, 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Legally Binding</span>
          </div>
        </div>

        {/* Layout split: Index & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Index (Sidebar) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-3">Table of Contents</p>
            <nav className="flex flex-col gap-1 text-sm font-semibold">
              {[
                { label: "1. Acceptance of Terms", target: "#acceptance" },
                { label: "2. User Accounts & Security", target: "#accounts" },
                { label: "3. Interactive & AI Rules", target: "#conduct" },
                { label: "4. Payments & Refunds", target: "#payments" },
                { label: "5. Intellectual Property", target: "#ip" },
                { label: "6. Limitation of Liability", target: "#liability" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.target}
                  className="px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-8 space-y-12 text-sm leading-relaxed text-zinc-400">
            <section id="acceptance" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">01.</span> Acceptance of Terms
              </h2>
              <p>
                Welcome to Mentora (operated by Mentora, Inc.). By creating an account or accessing our online courses, code environments, leaderboards, and AI support modules, you agree to be bound by these Terms of Service. If you do not consent to all conditions specified herein, you must immediately cease platform access.
              </p>
            </section>

            <section id="accounts" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">02.</span> User Accounts & Credentials
              </h2>
              <p>
                To utilize certain aspects of the platform (e.g. course progress saving, XP rewards, leaderboard rankings), you must establish an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Provide accurate, current, and complete details during registration.</li>
                <li>Safeguard your authentication credentials and accept liability for all actions occurring under your account.</li>
                <li>Notify platform support immediately of any suspected security breaches or unauthorized account accesses.</li>
              </ul>
            </section>

            <section id="conduct" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">03.</span> User Conduct & AI Guidelines
              </h2>
              <p>
                Mentora thrives on dynamic community interaction and gamified milestones. You agree not to engage in forbidden activities:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Attempting to manipulate XP scores, streaks, or leaderboard positioning via automation scripts or exploits.</li>
                <li>Submitting malicious payloads, SQL injections, or scripts in the coding inputs or AI Tutor chat windows.</li>
                <li>Harassing other learners or posting abusive content in comment threads and peer evaluations.</li>
              </ul>
              <p>
                Violating community rules will result in immediate streak resets, leaderboard banishment, or permanent account suspensions.
              </p>
            </section>

            <section id="payments" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">04.</span> Purchases, Pricing & Refunds
              </h2>
              <p>
                Mentora offers both free educational paths and paid premium courses. All purchases are processed securely via encrypted third-party payment gateways.
              </p>
              <p>
                Our premium courses feature lifetime access. Unless specified otherwise, payments are final. Refund requests may be analyzed on a case-by-case basis (e.g. course access failure) within 7 days of checkout, provided course completion progress remains under 10%.
              </p>
            </section>

            <section id="ip" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">05.</span> Intellectual Property
              </h2>
              <p>
                All platform contents—including video lectures, written guides, animations, graphics, code templates, and logo designs—are the exclusive intellectual property of Mentora, Inc. and its contracted educators.
              </p>
              <p>
                Purchasing a course grants you a limited, non-exclusive, non-transferable personal license to view the materials. You are strictly forbidden from distributing, recording, or reproducing Mentora materials for commercial purposes.
              </p>
            </section>

            <section id="liability" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">06.</span> Limitation of Liability
              </h2>
              <p>
                Mentora's services are rendered on an "as is" and "as available" basis without any express or implied warranties. We make no guarantees that:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>The platform will remain uninterrupted, error-free, or secure at all times.</li>
                <li>The curriculum will assure job placement or specific career promotions.</li>
              </ul>
              <p>
                To the maximum extent permitted by governing laws, Mentora, Inc. shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the platform.
              </p>
            </section>
          </main>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
