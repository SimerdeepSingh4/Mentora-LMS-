import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
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
      className="inline-block w-full sm:w-auto"
    >
      {children}
    </motion.div>
  );
};

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      toast.error("Please write a message of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Support ticket created! We'll reply within 24 hours.");
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#060606] text-zinc-300 pt-24 pb-20 relative overflow-hidden">
      
      {/* Background aurora decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#E8602E]/[0.03] blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#E8602E] hover:underline mb-8 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="border-b border-white/[0.06] pb-10 mb-12">
          <div className="flex items-center gap-2.5 px-3 py-1.5 mb-4 rounded-full text-xs font-bold text-[#E8602E] border border-[#E8602E]/20 bg-[#E8602E]/5 w-fit">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Support</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            How can we <span className="text-[#E8602E]">help</span> you?
          </h1>
          <p className="text-sm text-zinc-500 font-semibold max-w-xl leading-relaxed">
            Have a question about a course, leaderboard ranks, or billing? Submit a ticket and our team will get back to you shortly.
          </p>
        </div>

        {/* Layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Channels */}
            <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Direct Support</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#E8602E]/10 flex items-center justify-center border border-[#E8602E]/15 text-[#E8602E] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Email Us</h4>
                  <p className="text-sm font-semibold text-white">support@mentora.com</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Average reply time: 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#E8602E]/10 flex items-center justify-center border border-[#E8602E]/15 text-[#E8602E] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Call Us</h4>
                  <p className="text-sm font-semibold text-white">+91 (800) 123-4567</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Mon–Fri, 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#E8602E]/10 flex items-center justify-center border border-[#E8602E]/15 text-[#E8602E] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Headquarters</h4>
                  <p className="text-sm font-semibold text-white">Mentora HQ, Silicon Valley Phase II</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Indiranagar, Bangalore, Karnataka, India</p>
                </div>
              </div>
            </div>

            {/* Support Hours Alert Card */}
            <div className="bg-[#0c0c0c]/40 border border-white/[0.04] rounded-2xl p-5 flex gap-4 items-center">
              <Clock className="w-8 h-8 text-[#E8602E]/40 shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Support Operations</p>
                <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">
                  Our AI Tutor is online 24/7 inside the courses. Human support requests are processed Monday through Saturday.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 text-center shadow-2xl space-y-6 py-16"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-500 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Ticket Submitted Successfully</h3>
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. We have logged your request. A confirmation email with your ticket number has been sent.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-white font-bold text-xs rounded-xl transition-all"
                >
                  Create another ticket
                </button>
              </motion.div>
            ) : (
              <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
                <h3 className="text-lg font-bold text-white">Submit a Support Ticket</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Arjun Sharma"
                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-[#E8602E]/30 focus:ring-1 focus:ring-[#E8602E]/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="arjun@example.com"
                        className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-[#E8602E]/30 focus:ring-1 focus:ring-[#E8602E]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Subject Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Topic / Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#0e0e0e] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-[#E8602E]/30 focus:ring-1 focus:ring-[#E8602E]/30 transition-all"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Billing & Purchases">Billing & Purchases</option>
                      <option value="Course Access Issues">Course Access Issues</option>
                      <option value="Leaderboard & Streak Bugs">Leaderboard & Streak Bugs</option>
                      <option value="AI Tutor Issues">AI Tutor Issues</option>
                    </select>
                  </div>

                  {/* Row 3: Message Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Detailed Description</label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please write down details about your problem..."
                      className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-[#E8602E]/30 focus:ring-1 focus:ring-[#E8602E]/30 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button (Magnetic) */}
                  <div className="pt-2">
                    <Magnetic>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 bg-[#E8602E] text-white font-bold text-xs rounded-xl hover:bg-[#d4561f] shadow-lg shadow-[#E8602E]/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Logging Ticket...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Request</span>
                          </>
                        )}
                      </button>
                    </Magnetic>
                  </div>

                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
