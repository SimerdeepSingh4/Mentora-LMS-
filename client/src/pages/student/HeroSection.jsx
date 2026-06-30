import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Search, Video, Bot, Trophy, Users, BookOpen, TrendingUp,
  Star, ArrowRight, CheckCircle, Zap, Shield, Clock,
  Play, ChevronRight, Sparkles, Code, Palette, BarChart,
  Globe, GraduationCap, Award, Flame, Lock, Cpu, Terminal
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlowCard";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import Lottie from "lottie-react";

/* ─── Physics-Based Magnetic Component ─── */
const Magnetic = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 120, damping: 12, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 120, damping: 12, mass: 0.1 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    if (isHovered) {
      x.set(distanceX * 0.35);
      y.set(distanceY * 0.35);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated counter & Intersection Hooks ─── */
const useIntersection = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (isIntersecting) return;
    if (typeof window === "undefined" || !window.IntersectionObserver) {
      setIsIntersecting(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setIsIntersecting(true);
    }, { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [isIntersecting, threshold]);
  return [ref, isIntersecting];
};

const useCounter = (target, trigger, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) {
        setCount(target);
        clearInterval(t);
      } else {
        setCount(Math.floor(v));
      }
    }, 16);
    return () => clearInterval(t);
  }, [trigger, target, duration]);
  return count;
};

/* ─── Data ─── */
const COMPANIES = ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Uber", "Airbnb", "Stripe", "Atlassian", "Razorpay"];

const CATEGORIES = [
  { icon: <Code className="w-5 h-5" />, label: "Web Dev",       color: "#3b82f6" },
  { icon: <BarChart className="w-5 h-5" />, label: "Data Science", color: "#22c55e" },
  { icon: <Cpu className="w-5 h-5" />, label: "AI & ML",        color: "#a855f7" },
  { icon: <Palette className="w-5 h-5" />, label: "UI/UX",       color: "#ec4899" },
  { icon: <Globe className="w-5 h-5" />, label: "DevOps",        color: "#f97316" },
  { icon: <Shield className="w-5 h-5" />, label: "Security",     color: "#ef4444" },
];

const STEPS = [
  { n: "01", icon: <Search className="w-5 h-5" />, title: "Discover",   desc: "Browse 20+ industry-designed courses across every tech domain." },
  { n: "02", icon: <Play className="w-5 h-5" />,   title: "Learn",      desc: "HD video, lifetime access. Pause and resume on any device." },
  { n: "03", icon: <Bot className="w-5 h-5" />,    title: "Ask AI",     desc: "Stuck? Get instant answers from our in-course AI tutor." },
  { n: "04", icon: <Trophy className="w-5 h-5" />, title: "Get Hired",  desc: "Earn XP, certificates, and climb the leaderboard." },
];

const FEATURES = [
  { icon: <Terminal className="w-6 h-6" />,     title: "Automated Sandbox Coding", desc: "Write, run and debug code in real-time right next to your video chapters — no tools configuration needed.", tag: "Interactive" },
  { icon: <Bot className="w-6 h-6" />,          title: "AI-Powered Tutor",     desc: "Real-time in-course AI that answers your exact question instantly.", tag: "24/7" },
  { icon: <Trophy className="w-6 h-6" />,       title: "Gamified XP System",   desc: "Earn XP, unlock badges and compete on a live global leaderboard.", tag: "Motivating" },
  { icon: <GraduationCap className="w-6 h-6" />,title: "Expert Instructors",   desc: "Real working professionals — not educators — teach every course.", tag: "Industry" },
  { icon: <Award className="w-6 h-6" />,        title: "Certificates",         desc: "Shareable completion certificates built for LinkedIn and recruiters.", tag: "Verifiable" },
  { icon: <Lock className="w-6 h-6" />,         title: "Structured Quizzes",   desc: "Module-end quizzes that test real understanding, not rote memory.", tag: "Effective" },
];

const TESTIMONIALS = [
  { name: "Arjun Sharma",  role: "Frontend Dev @ Razorpay",  text: "The AI tutor alone is worth it. Got unstuck in minutes instead of hours of googling.", avatar: "A", color: "#3b82f6" },
  { name: "Priya Nair",    role: "Data Analyst @ Flipkart",  text: "The gamified XP system kept me going. Finished 3 courses in under a month!", avatar: "P", color: "#a855f7" },
  { name: "Karan Mehta",   role: "Full-Stack Dev @ Startup", text: "Best structured curriculum at this price. The quizzes actually test real understanding.", avatar: "K", color: "#E8602E" },
];

/* ─── Component ─── */
const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const lottieRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/education.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading lottie animation:", err));
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.5); // Half speed for a gentler, more premium look
    }
  }, [animationData]);

  const [statsRef, statsVisible] = useIntersection(0.1);
  const activeStudentsCount = useCounter(500,  statsVisible, 2000);
  const expertCoursesCount = useCounter(20,   statsVisible, 1500);
  const completionRateCount = useCounter(95,   statsVisible, 1800);
  const hoursOfContentCount = useCounter(1200, statsVisible, 2200);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/courses?query=${query}`); setQuery(""); }
  };

  return (
    <div className="relative bg-[#060606] overflow-hidden">

      {/* ═══════════════════════════════════════════════
          HERO  —  cinematic split
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-center">

        {/* Background: mesh + noise */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Mesh gradients */}
          <div className="absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full bg-[#E8602E]/[0.07] blur-[180px] animate-glow" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#E8602E]/[0.04] blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[120px]" />

          {/* Fine dot grid */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />

          {/* Subtle horizontal line at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8602E]/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* ── Left ── */}
            <div>
              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-bold tracking-wide text-[#E8602E] border border-[#E8602E]/25 bg-[#E8602E]/8 animate-fade-up"
                style={{ animationDelay: "100ms" }}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>India's Most Interactive Coding Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-[56px] md:text-[70px] lg:text-[76px] font-black leading-[0.95] tracking-tight text-white mb-6">
                <span className="block">
                  {Array.from("Build Skills.").map((char, index) => (
                    <span
                      key={index}
                      className="inline-block animate-fade-up"
                      style={{ animationDelay: `${150 + index * 20}ms`, animationFillMode: "both" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                <span className="block">
                  {Array.from("Land Dream").map((char, index) => (
                    <span
                      key={index}
                      className="inline-block animate-fade-up"
                      style={{ animationDelay: `${150 + (12 + index) * 20}ms`, animationFillMode: "both" }}
                    >
                      <span
                        className="text-shimmer inline-block"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    </span>
                  ))}
                </span>
                <span className="block">
                  {Array.from("Jobs.").map((char, index) => (
                    <span
                      key={index}
                      className="inline-block animate-fade-up"
                      style={{ animationDelay: `${150 + (22 + index) * 20}ms`, animationFillMode: "both" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
              </h1>

              <p
                className="text-[#888] text-lg leading-relaxed mb-8 max-w-[460px] animate-fade-up"
                style={{ animationDelay: "750ms" }}
              >
                Expert courses, a built-in AI tutor, gamified XP, and live leaderboards — everything you need to go from zero to job-ready.
              </p>

              {/* Search */}
              <form
                onSubmit={onSearch}
                className="flex items-center max-w-[460px] bg-[#0f0f0f] border border-[#222] rounded-2xl overflow-hidden focus-within:border-[#E8602E]/40 transition-colors mb-4 shadow-2xl shadow-black/40 animate-fade-up"
                style={{ animationDelay: "850ms" }}
              >
                <Search className="ml-4 text-[#444] w-4 h-4 shrink-0" />
                <Input
                  type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses, topics…"
                  className="flex-grow px-4 py-3 bg-transparent border-none focus-visible:ring-0 text-white placeholder-[#555] text-sm"
                />
                <Button type="submit" className="m-1.5 px-5 py-2.5 text-white bg-[#E8602E] rounded-xl hover:bg-[#d4561f] font-bold text-sm shrink-0 shadow-lg shadow-[#E8602E]/20 transition-all hover:scale-[1.02]">
                  Search
                </Button>
              </form>

              {/* Tags */}
              <div
                className="flex flex-wrap gap-2 mb-10 animate-fade-up"
                style={{ animationDelay: "950ms" }}
              >
                {["Python", "React", "ML", "DevOps", "UI/UX"].map((t) => (
                  <button key={t} onClick={() => navigate(`/courses?query=${t}`)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#555] hover:border-[#E8602E]/40 hover:text-[#E8602E] transition-all duration-200">
                    {t}
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div
                className="flex items-center gap-4 flex-wrap animate-fade-up"
                style={{ animationDelay: "1050ms" }}
              >
                <Magnetic>
                  <Button onClick={() => navigate("/courses")}
                    className="group px-8 py-3.5 h-auto bg-[#E8602E] text-white rounded-xl hover:bg-[#d4561f] font-bold text-sm shadow-lg shadow-[#E8602E]/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#E8602E]/30">
                    Explore Courses
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Magnetic>
              </div>
            </div>

            {/* ── Right: Lottie Focal + Glass Float Stack ── */}
            <div className="relative hidden lg:flex items-center justify-center h-[520px]">
              
              {/* Central Lottie Animation */}
              <div className="w-[420px] h-[420px] z-10 select-none pointer-events-none drop-shadow-[0_0_50px_rgba(232,96,46,0.12)]">
                {animationData && <Lottie lottieRef={lottieRef} animationData={animationData} loop={true} />}
              </div>

              {/* Floating XP card */}
              <div
                className="absolute z-20 right-[4%] top-[12%] w-[170px] animate-fade-up"
                style={{ animationDelay: "450ms" }}
              >
                <GlowCard className="animate-float-delay rounded-2xl w-full">
                  <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-4 shadow-2xl shadow-black/60">
                    <p className="text-[10px] text-[#555] uppercase tracking-wider font-semibold mb-2">XP Earned Today</p>
                    <p className="text-3xl font-black text-[#E8602E]">+250</p>
                    <p className="text-[11px] text-[#555] font-semibold">Experience Points</p>
                    <div className="mt-3 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i < 3 ? "bg-[#E8602E]" : "bg-[#222]"}`} />
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Floating Streak badge */}
              <div
                className="absolute z-20 left-[2%] bottom-[16%] animate-fade-up"
                style={{ animationDelay: "600ms" }}
              >
                <GlowCard className="animate-float-slow rounded-2xl w-full">
                  <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-3.5 shadow-2xl shadow-black/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8602E]/10 flex items-center justify-center border border-[#E8602E]/15">
                      <Flame className="w-5 h-5 text-[#E8602E]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#555] font-semibold uppercase tracking-wider">Daily Streak</p>
                      <p className="text-base font-black text-white">🔥 14 Days</p>
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Floating Leaderboard card */}
              <div
                className="absolute z-20 right-[2%] bottom-[10%] w-[180px] animate-fade-up"
                style={{ animationDelay: "750ms" }}
              >
                <GlowCard className="animate-float rounded-2xl w-full">
                  <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-4 shadow-2xl shadow-black/60">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-[11px] font-bold text-white">Leaderboard</span>
                    </div>
                    {[["Arjun S.", 4200], ["You", 3750], ["Priya N.", 3100]].map(([name, xp], i) => (
                      <div key={i} className={`flex items-center justify-between py-1.5 ${i === 1 ? "text-[#E8602E]" : "text-[#666]"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black w-3">{i + 1}</span>
                          <span className="text-[11px] font-semibold">{name}</span>
                        </div>
                        <span className="text-[10px] font-bold">{xp.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </div>

              {/* Ambient glow behind elements */}
              <div className="absolute inset-0 bg-[#E8602E]/4 rounded-full blur-[110px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MARQUEE — social proof
      ═══════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.05] bg-[#090909] py-5 overflow-hidden">
        <p className="text-center text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase mb-4">Our graduates work at</p>
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee gap-14 whitespace-nowrap">
            {[...COMPANIES, ...COMPANIES].map((c, i) => (
              <span key={i} className="text-zinc-400 font-black text-xl tracking-tight select-none hover:text-[#E8602E] transition-colors duration-300">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS — 4-col bold numbers
      ═══════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-24 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
            {[
              { v: `${activeStudentsCount}+`,  label: "Active Students",   icon: <Users className="w-5 h-5" />,      sub: "and growing" },
              { v: `${expertCoursesCount}+`,  label: "Expert Courses",    icon: <BookOpen className="w-5 h-5" />,   sub: "6 domains" },
              { v: `${completionRateCount}%`,  label: "Completion Rate",   icon: <TrendingUp className="w-5 h-5" />, sub: "industry best" },
              { v: `${hoursOfContentCount}+`,  label: "Hours of Content",  icon: <Clock className="w-5 h-5" />,      sub: "HD video" },
            ].map(({ v, label, icon, sub }, i) => (
              <div key={i} className="group p-8 bg-[#080808] hover:bg-[#0c0c0c] transition-colors text-center flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-[#E8602E]/8 text-[#E8602E] rounded-xl mb-4 group-hover:bg-[#E8602E]/15 transition-colors border border-[#E8602E]/10">
                  {icon}
                </div>
                <div className="text-4xl font-black text-white tabular-nums mb-1">{v}</div>
                <div className="text-sm font-bold text-[#ccc] mb-0.5">{label}</div>
                <div className="text-xs text-[#444]">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — numbered steps
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#E8602E]/20 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full text-xs font-bold text-[#E8602E] border border-[#E8602E]/20 bg-[#E8602E]/5">
              <Zap className="w-3.5 h-3.5" /> Four Simple Steps
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How <span className="text-[#E8602E]">Mentora</span> Works
            </h2>
            <p className="text-[#555] max-w-sm mx-auto text-sm leading-relaxed">
              From complete beginner to job-ready in four clear steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {/* Connector lines */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px z-0">
              <div className="h-full bg-gradient-to-r from-[#E8602E]/40 via-[#E8602E]/20 to-[#E8602E]/40"
                style={{ backgroundImage: "repeating-linear-gradient(90deg,#E8602E33 0,#E8602E33 4px,transparent 4px,transparent 12px)" }} />
            </div>

            {STEPS.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border border-[#E8602E]/20" />
                  {/* Inner circle */}
                  <div className="w-14 h-14 rounded-full bg-[#0f0f0f] border border-[#E8602E]/30 flex items-center justify-center text-[#E8602E] shadow-lg shadow-[#E8602E]/10">
                    {step.icon}
                  </div>
                  {/* Step number */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8602E] rounded-full text-[9px] font-black text-white flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CATEGORIES — coloured pill grid
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[10px] text-[#E8602E] font-bold tracking-[0.25em] uppercase mb-3">Explore</p>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Browse by Category
              </h2>
            </div>
            <button onClick={() => navigate("/courses")}
              className="flex items-center gap-1.5 text-sm font-bold text-[#E8602E] hover:underline underline-offset-2 shrink-0">
              All Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Magnetic key={i} className="w-full">
                <button onClick={() => navigate(`/courses?query=${cat.label}`)}
                  className="group relative flex flex-col items-center gap-3 p-6 w-full rounded-2xl bg-[#0c0c0c] border border-white/[0.06] hover:border-[#E8602E]/20 hover:border-white/[0.12] transition-all duration-300 hover:shadow-lg overflow-hidden"
                  style={{ "--cat-color": cat.color }}>
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${cat.color}15, transparent 70%)` }} />
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <span className="relative text-xs font-bold text-[#888] group-hover:text-white transition-colors leading-tight text-center">{cat.label}</span>
                </button>
              </Magnetic>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES — bento grid
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        {/* Giant masked typography */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.04] tracking-tighter select-none pointer-events-none z-0 leading-none whitespace-nowrap">
          WHY US
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[10px] text-[#E8602E] font-bold tracking-[0.25em] uppercase mb-4">Platform</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why Students Choose{" "}
              <span className="text-[#E8602E]">Mentora</span>
            </h2>
            <p className="text-[#555] max-w-sm mx-auto text-sm">
              We've reimagined online learning from the ground up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              // Custom column spans for symmetric bento layout
              let colSpan = "md:col-span-1 lg:col-span-1";
              if (i === 1 || i === 2 || i === 4) {
                colSpan = "md:col-span-2 lg:col-span-2";
              }
              
              return (
                <div key={i}
                  className={`group relative p-7 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] hover:border-[#E8602E]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#E8602E]/5 overflow-hidden flex flex-col justify-between ${colSpan}`}>
                  
                  <div>
                    {/* Background glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E8602E]/0 to-[#E8602E]/0 group-hover:from-[#E8602E]/3 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

                    <div className="relative flex items-start justify-between mb-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#E8602E]/8 text-[#E8602E] rounded-xl border border-[#E8602E]/10 group-hover:bg-[#E8602E]/15 transition-colors">
                        {f.icon}
                      </div>
                      <span className="text-[10px] font-bold text-[#E8602E] bg-[#E8602E]/8 border border-[#E8602E]/15 px-2.5 py-1 rounded-full">{f.tag}</span>
                    </div>
                    
                    <h3 className="relative text-base font-black text-white mb-2">{f.title}</h3>
                    <p className="relative text-sm text-[#555] leading-relaxed max-w-xl">{f.desc}</p>
                  </div>

                  {/* Render Mock UIs for visual excellence */}
                  {i === 0 && (
                    <div className="mt-5 p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-[10px] font-mono space-y-1.5 max-w-[280px] self-start w-full">
                      <div className="flex items-center gap-1.5 text-zinc-600 border-b border-white/[0.03] pb-1 mb-1 justify-between select-none">
                        <span className="flex items-center gap-1">💻 sandbox.js</span>
                        <span className="text-[#E8602E] font-bold text-[8px] uppercase">Running</span>
                      </div>
                      <div className="text-zinc-500">
                        <span className="text-[#E8602E]">const</span> sum = <span className="text-yellow-400">5</span> + <span className="text-yellow-400">10</span>;
                      </div>
                      <div className="text-zinc-500">
                        console.<span className="text-blue-400">log</span>(<span className="text-green-400">"Sum:"</span>, sum);
                      </div>
                      <div className="text-zinc-400 border-t border-dashed border-white/[0.03] pt-1.5 pl-1.5 flex gap-1 select-none">
                        <span className="text-zinc-600">&gt;</span> <span className="text-green-400 font-bold">Sum: 15</span>
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="mt-5 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-[11px] font-medium space-y-2 max-w-[320px] self-start">
                      <div className="flex gap-2 text-zinc-500">
                        <span className="text-[#E8602E] font-black">User:</span> How to center a div?
                      </div>
                      <div className="flex gap-2 text-zinc-300 pl-2 border-l border-[#E8602E]/30">
                        <span className="text-[#E8602E] font-black">AI:</span> Use <code className="bg-[#111] px-1.5 py-0.5 rounded text-white text-[10px]">display: flex; justify-content: center;</code>
                      </div>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="mt-5 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-[11px] font-medium max-w-[320px] flex items-center justify-between gap-6 self-start w-full">
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 gap-12">
                          <span>LEVEL 12</span>
                          <span className="text-[#E8602E] animate-pulse">3,750 XP</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden border border-white/[0.03]">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-[#E8602E] to-orange-400 rounded-full" 
                            initial={{ width: "20%" }}
                            whileInView={{ width: "75%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                          />
                        </div>
                      </div>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {["🥇", "⭐", "🔥"].map((emoji, idx) => (
                          <div key={idx} className="w-6 h-6 rounded-full bg-[#111] border border-white/[0.08] flex items-center justify-center text-xs">
                            {emoji}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {i === 3 && (
                    <div className="mt-5 flex items-center gap-2 opacity-[0.25] group-hover:opacity-[0.5] transition-opacity duration-300 flex-wrap">
                      {["Google", "Meta", "Netflix"].map((co) => (
                        <span key={co} className="text-[9px] font-black uppercase tracking-wider text-white border border-white/[0.08] px-2 py-0.5 rounded">
                          {co}
                        </span>
                      ))}
                    </div>
                  )}

                  {i === 4 && (
                    <div className="mt-5 p-3.5 bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between gap-4 max-w-[320px] shadow-lg relative overflow-hidden self-start">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#E8602E]/[0.05] rounded-full blur-md" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">Verified Certificate</p>
                        <p className="text-xs font-black text-white">Full-Stack Web Development</p>
                        <p className="text-[9px] text-[#E8602E] font-semibold">Credential ID: MENT-8924A</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#E8602E]/30 flex items-center justify-center text-[#E8602E] shrink-0 font-black text-[10px] bg-[#E8602E]/5">
                        ★
                      </div>
                    </div>
                  )}

                  {i === 5 && (
                    <div className="mt-5 space-y-1.5 max-w-[200px] text-[9px] font-semibold text-zinc-600">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg border border-[#E8602E]/20 bg-[#E8602E]/5">
                        <div className="w-3 h-3 rounded-full border border-[#E8602E] flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#E8602E]" />
                        </div>
                        <span className="text-[#E8602E]">Option A (Correct)</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg border border-white/[0.03] opacity-60">
                        <div className="w-3 h-3 rounded-full border border-zinc-700 shrink-0" />
                        <span>Option B</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — Stagger Slider
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-[#060606] relative overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#E8602E]/[0.02] blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full text-xs font-bold text-[#E8602E] border border-[#E8602E]/20 bg-[#E8602E]/5">
              <Star className="w-3.5 h-3.5 fill-current" /> 5-Star Reviews
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Loved by <span className="text-[#E8602E]">Learners</span>
            </h2>
          </div>

          <StaggerTestimonials />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — full-width cinematic
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[#080808]">
        {/* Decorative border top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8602E]/30 to-transparent" />

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8602E]/[0.05] blur-[150px] animate-pulse" style={{ animationDuration: '8000ms' }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[120px]" />
          
          {/* Dynamic Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Diagonal Scrolling Marquee */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] rotate-[-3deg] border-y border-white/[0.02] bg-[#0b0b0b]/60 py-3 overflow-hidden opacity-[0.08] pointer-events-none">
            <div className="flex animate-marquee gap-14 whitespace-nowrap text-2xl font-black uppercase tracking-wider text-white">
              {[...Array(4)].map((_, idx) => (
                <React.Fragment key={idx}>
                  <span>Level Up Your Code</span>
                  <span className="text-[#E8602E]">★</span>
                  <span>Get Certificates</span>
                  <span className="text-[#E8602E]">★</span>
                  <span>Land Dream Jobs</span>
                  <span className="text-[#E8602E]">★</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Giant Masked Typography */}
          <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 text-[26vw] font-black text-white/[0.015] tracking-tighter select-none pointer-events-none z-0 leading-none">
            MENTORA
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-bold text-[#E8602E] border border-[#E8602E]/20 bg-[#E8602E]/5">
            <Sparkles className="w-3.5 h-3.5" /> Start Today — It's Free
          </div>

          <h2 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Your Career<br />
            <span className="text-[#E8602E]">Starts Here.</span>
          </h2>

          <p className="text-[#555] text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Join 500+ students already building real skills. No credit card required. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Magnetic>
              <Button onClick={() => navigate("/login?tab=signup")}
                className="group px-10 py-4 h-auto bg-[#E8602E] text-white rounded-xl hover:bg-[#d4561f] font-black text-base shadow-2xl shadow-[#E8602E]/30 transition-all hover:scale-[1.02] hover:shadow-[#E8602E]/40 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Magnetic>
            <Magnetic>
              <Button onClick={() => navigate("/courses")} variant="ghost"
                className="px-10 py-4 h-auto border border-white/[0.08] bg-white/[0.03] text-[#888] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] rounded-xl font-bold text-base transition-all w-full sm:w-auto">
                Browse Courses
              </Button>
            </Magnetic>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {["No credit card", "Cancel anytime", "Instant access"].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-[#444] font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-[#E8602E]/60" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HeroSection;
