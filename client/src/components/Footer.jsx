import LogoDark from "../assets/logo_dark.png";
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Flame, Github, Twitter, Linkedin, Youtube, Mail, ArrowRight, BookOpen, Compass, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

/* ─── Physics-Based Magnetic Component ─── */
const Magnetic = ({ children }) => {
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
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Welcome aboard! You are now subscribed to Mentora News.");
    setEmail("");
  };

  return (
    <footer className="sticky bottom-0 z-0 bg-[#070707] text-zinc-300 w-full overflow-hidden border-t border-white/[0.04]">
      
      {/* ─── Background FX ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Shifting Theme-Adaptive Aurora Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8602E]/[0.05] blur-[150px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[120px]" />
        
        {/* Dynamic Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Diagonal Scrolling Marquee */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] rotate-[-4deg] border-y border-white/[0.03] bg-[#0c0c0c]/80 backdrop-blur-sm py-4 overflow-hidden opacity-[0.12]">
          <div className="flex animate-marquee gap-16 whitespace-nowrap text-3xl font-black uppercase tracking-wider text-white">
            {[...Array(4)].map((_, idx) => (
              <React.Fragment key={idx}>
                <span>India's Most Interactive Platform</span>
                <span className="text-[#E8602E]">★</span>
                <span>Learn by Doing</span>
                <span className="text-[#E8602E]">★</span>
                <span>Compete on Leaderboards</span>
                <span className="text-[#E8602E]">★</span>
                <span>Stuck? Ask AI Tutor</span>
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

      {/* ─── Main Content Container ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={LogoDark} alt="Mentora Logo" className="h-10 object-contain" />
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-[260px]">
              Industry-designed expert courses, live leaderboards, and real-time AI mentoring. Learn skills that land dream jobs.
            </p>
            {/* Social pills */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <Github className="w-4 h-4" />, link: "https://github.com" },
                { icon: <Twitter className="w-4 h-4" />, link: "https://twitter.com" },
                { icon: <Linkedin className="w-4 h-4" />, link: "https://linkedin.com" },
                { icon: <Youtube className="w-4 h-4" />, link: "https://youtube.com" },
              ].map((s, idx) => (
                <a
                  key={idx}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-zinc-500 hover:text-white hover:border-[#E8602E]/40 hover:bg-[#E8602E]/5 transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8602E]">Explore</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              {[
                { label: "Web Development", path: "/courses?query=Web" },
                { label: "AI & Machine Learning", path: "/courses?query=AI" },
                { label: "DevOps & Cloud", path: "/courses?query=DevOps" },
                { label: "UI/UX Design", path: "/courses?query=UI" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="hover:text-white transition-colors flex items-center group gap-1">
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Platform</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              {[
                { label: "Leaderboard", path: "/leaderboard" },
                { label: "My Learning", path: "/my-learning" },
                { label: "Profile Settings", path: "/profile" },
                { label: "Apply for Instructor", path: "/become-instructor" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="hover:text-white transition-colors flex items-center group gap-1">
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Magnetic Button */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Stay Updated</h4>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Subscribe to get notified about course drops, updates, and events.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#E8602E]/30 focus:ring-1 focus:ring-[#E8602E]/30 transition-all"
                />
              </div>
              <Magnetic>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E8602E] text-white font-bold text-xs rounded-xl hover:bg-[#d4561f] shadow-lg shadow-[#E8602E]/20 transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Magnetic>
            </form>
          </div>

        </div>

        {/* ─── Bottom Footer Bar ─── */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-semibold">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#E8602E] animate-pulse" />
            <span>© {new Date().getFullYear()} Mentora, Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
