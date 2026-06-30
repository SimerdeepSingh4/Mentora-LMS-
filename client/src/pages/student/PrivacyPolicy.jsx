import React from "react";
import { Shield, Clock, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#060606] text-zinc-300 pt-24 pb-20 relative overflow-hidden">
      
      {/* Background aurora and dots */}
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
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            We value your <span className="text-[#E8602E]">privacy</span>.
          </h1>
          <div className="flex items-center gap-4 text-xs text-zinc-500 font-semibold">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Updated: June 30, 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure & Encrypted</span>
          </div>
        </div>

        {/* Layout split: Index & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Index (Sidebar) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-3">Table of Contents</p>
            <nav className="flex flex-col gap-1 text-sm font-semibold">
              {[
                { label: "1. Information We Collect", target: "#collect" },
                { label: "2. How We Use Information", target: "#use" },
                { label: "3. Information Sharing", target: "#sharing" },
                { label: "4. Data Security", target: "#security" },
                { label: "5. Your Rights & Choices", target: "#rights" },
                { label: "6. Changes to this Policy", target: "#changes" },
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
            <section id="collect" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">01.</span> Information We Collect
              </h2>
              <p>
                At Mentora, we collect information that helps us provide a premium, interactive learning experience. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-white">Account Details:</strong> Your name, email, credentials, and profile details when you register.</li>
                <li><strong className="text-white">Activity Records:</strong> Course progress, leaderboard scores, badges earned, and in-app interactions.</li>
                <li><strong className="text-white">Communications:</strong> Queries sent to our built-in AI Tutor and support tickets.</li>
                <li><strong className="text-white">Technical Logs:</strong> IP address, device metadata, browser type, and cookie identifiers.</li>
              </ul>
            </section>

            <section id="use" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">02.</span> How We Use Your Information
              </h2>
              <p>
                The information collected is used to sustain, personalize, and improve our gamified education services:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Calculating leaderboard rankings and awarding Daily Streak achievements.</li>
                <li>Processing course purchases and maintaining your lifetime access records.</li>
                <li>Enabling real-time replies from the AI tutor when you require programming help.</li>
                <li>Analyzing aggregate platform performance to update curricula for industry needs.</li>
              </ul>
            </section>

            <section id="sharing" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">03.</span> Information Sharing & Disclosures
              </h2>
              <p>
                We do not sell, rent, or trade your personal data. We only share information with third parties in the following scenarios:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-white">Service Providers:</strong> Secure payment processors (e.g., Razorpay/Stripe), video hosting solutions, and database providers.</li>
                <li><strong className="text-white">Instructors:</strong> Course creators receive aggregated enrollment stats to improve content quality.</li>
                <li><strong className="text-white">Legal Obligations:</strong> When required by governing laws to prevent fraud or comply with regulatory audits.</li>
              </ul>
            </section>

            <section id="security" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">04.</span> Data Security & Retention
              </h2>
              <p>
                We deploy industry-standard technical measures (SSL/TLS encryption, secure API gateways) to shield your data against unauthorized access, alterations, or disclosures.
              </p>
              <p>
                Your account details are retained for as long as your account remains active. Activity scores and progress details are stored to maintain your permanent certificate verifications.
              </p>
            </section>

            <section id="rights" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">05.</span> Your Rights & Choices
              </h2>
              <p>
                You hold complete agency over your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>You may modify your profile records directly through the Profile tab.</li>
                <li>You can opt-out of marketing communications via email subscription toggles.</li>
                <li>You can request account deletion or data portability by filing a ticket through our Support page.</li>
              </ul>
            </section>

            <section id="changes" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#E8602E]">06.</span> Changes to this Policy
              </h2>
              <p>
                We reserve the right to revise this Privacy Policy to reflect platform additions or legal changes. Updates will be highlighted on this page with a revised "Last Updated" timestamp. We encourage users to inspect this document periodically.
              </p>
            </section>
          </main>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
