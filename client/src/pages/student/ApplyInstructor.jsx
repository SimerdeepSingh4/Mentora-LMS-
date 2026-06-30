import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AlertCircle, BookOpen, GraduationCap, Upload, CheckCircle2, ArrowLeft, ArrowRight, ChevronRight, Sparkles, Terminal, FileText, Heart } from "lucide-react";
import { useCreateInstructorApplicationMutation } from "@/features/api/instructorApplicationApi";

const ApplyInstructor = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [createInstructorApplication, { isLoading }] = useCreateInstructorApplicationMutation();

    const [form, setForm] = useState({
        phone: "",
        aadhaar: "",
        experience: "",
        qualification: "",
        expertise: "",
        reason: "",
        resumeUrl: null
    });

    const [errors, setErrors] = useState({});
    const [fileSelected, setFileSelected] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [step, setStep] = useState(1); // 1: Form, 2: Review, 3: Success

    // Pre-fill user data if available
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || ""
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handlePhoneChange = (value) => {
        setForm(prev => ({ ...prev, phone: value }));
        if (value.length < 10) {
            setErrors(prev => ({ ...prev, phone: "Phone number must be at least 10 digits" }));
        } else {
            setErrors(prev => ({ ...prev, phone: "" }));
        }
    };

    const handleAadhaarChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
        value = value.slice(0, 12);

        // Format as XXXX-XXXX-XXXX
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1-");

        setForm(prev => ({ ...prev, aadhaar: formattedValue }));

        if (value.length !== 12) {
            setErrors(prev => ({ ...prev, aadhaar: "Aadhaar number must be exactly 12 digits" }));
        } else {
            setErrors(prev => ({ ...prev, aadhaar: "" }));
        }
    };

    const validateField = (name, value) => {
        let errorMsg = "";

        switch (name) {
            case "experience":
                if (!/^\d+$/.test(value) || parseInt(value) < 0 || parseInt(value) > 50) {
                    errorMsg = "Experience must be a valid number between 0 and 50";
                }
                break;
            case "qualification":
                if (value.length < 3) {
                    errorMsg = "Enter a valid qualification";
                }
                break;
            case "expertise":
                if (value.length < 3) {
                    errorMsg = "Enter a valid area of expertise";
                }
                break;
            case "reason":
                if (value.length < 50) {
                    errorMsg = "Please provide a detailed reason (at least 50 characters)";
                }
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleFileUpload = async (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file && file.size > maxSize) {
            toast.error("File size should be less than 5MB!");
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file format. Only PDF, DOC, and DOCX are allowed.");
            return;
        }

        setFileUploading(true);
        setFileSelected(true);

        try {
            // Supabase upload fallback to Cloudinary via server
            try {
                const { uploadFileToSupabase } = await import('@/utils/directSupabase');
                const resumeUrl = await uploadFileToSupabase(file, 'resumes');
                setForm(prev => ({ ...prev, resumeUrl }));
                toast.success("Resume uploaded successfully!");
                return;
            } catch (supabaseError) {
                console.warn("Supabase upload failed, falling back to server upload:", supabaseError);
            }

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://localhost:8080/api/v1/media/upload-material", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                let resumeUrl = data.data.secure_url;
                if (file.type === "application/pdf" && resumeUrl.includes('fl_attachment:attachment')) {
                    resumeUrl = resumeUrl.replace('/upload/fl_attachment:attachment/', '/upload/');
                }
                setForm(prev => ({ ...prev, resumeUrl }));
                toast.success("Resume uploaded successfully!");
            } else {
                throw new Error(data.message || "Failed to upload resume");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload resume. Please try again.");
        } finally {
            setFileUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    };

    const validateForm = () => {
        const hasErrors = Object.values(errors).some(error => error !== "");
        const requiredFields = ["phone", "aadhaar", "experience", "qualification", "expertise", "reason"];
        const missingFields = requiredFields.filter(field => !form[field]);

        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields.`);
            return false;
        }

        if (hasErrors) {
            toast.error("Please resolve the errors in the form before reviewing.");
            return false;
        }

        return true;
    };

    const handleReview = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setStep(2);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const applicationData = {
            phone: form.phone,
            aadhaar: form.aadhaar,
            experience: Number(form.experience),
            qualification: form.qualification,
            expertise: form.expertise,
            reason: form.reason
        };

        if (form.resumeUrl) {
            applicationData.resumeUrl = form.resumeUrl;
        }

        try {
            const response = await createInstructorApplication(applicationData).unwrap();
            if (response.success) {
                setStep(3);
                window.scrollTo(0, 0);
            } else {
                toast.error(response.message || "Failed to submit application");
                setStep(1);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.data?.message || "Something went wrong. Please try again later.");
            setStep(1);
        }
    };

    const handleBack = () => {
        setStep(1);
        window.scrollTo(0, 0);
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-[#060606] text-zinc-300 pt-24 pb-20 relative overflow-hidden flex items-center justify-center">
                {/* Background glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-xl w-full px-6">
                    <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-500 animate-bounce">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Application Logged</h1>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Thank you for applying to teach at Mentora. Your application has been logged and is currently in the review queue.
                            </p>
                            <p className="text-xs text-zinc-600 leading-relaxed mt-2">
                                We will evaluate your profile details and credential resume. Our onboarding team will contact you via email within 2-3 business days.
                            </p>
                        </div>

                        <Separator className="border-white/[0.04]" />

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button onClick={() => navigate("/profile")} variant="outline" className="border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-xl font-bold">
                                Go to Profile
                            </Button>
                            <Button onClick={() => navigate("/")} className="bg-[#E8602E] text-white hover:bg-[#d4561f] rounded-xl font-bold shadow-lg shadow-[#E8602E]/20">
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#E8602E] hover:underline mb-8 transition-all">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left Column: Promotion Info */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#E8602E] border border-[#E8602E]/20 bg-[#E8602E]/5 w-fit">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Join our Faculty</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                                Teach, Mentor,<br />and <span className="text-[#E8602E]">Inspire</span>.
                            </h1>
                            <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
                                Mentora is India's fastest-growing interactive education platform. We take care of automated workspaces, tests, and student support so you can focus entirely on delivering masterclass contents.
                            </p>
                        </div>

                        <Separator className="border-white/[0.04]" />

                        {/* Benefits list */}
                        <div className="space-y-6">
                            {[
                                { title: "Automated Sandbox Coding", desc: "Students can run and edit code in real-time right next to your video chapters. No tools configuration required.", icon: <Terminal className="w-4 h-4 text-[#E8602E]" /> },
                                { title: "24/7 AI tutor Support", desc: "Our integrated AI model acts as a TA for your courses, answering student syntax queries instantly and saving you support time.", icon: <BookOpen className="w-4 h-4 text-[#E8602E]" /> },
                                { title: "Gamified XP Achievements", desc: "Our live leaderboards and daily streak goals push completion rates above 90%, meaning your lessons are actually completed.", icon: <GraduationCap className="w-4 h-4 text-[#E8602E]" /> },
                                { title: "Lucrative Monetization", desc: "Earn monthly royalty returns on subscriptions and enrollments based on student engagement.", icon: <Heart className="w-4 h-4 text-[#E8602E]" /> },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="w-9 h-9 rounded-xl bg-[#E8602E]/10 border border-[#E8602E]/15 flex items-center justify-center shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Steps Form Container */}
                    <div className="lg:col-span-7">
                        <div className="bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
                            
                            {/* Step indicators */}
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                                <h3 className="text-base font-black text-white">
                                    {step === 1 ? "Instructor Application" : "Review Details"}
                                </h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                                    <span className={step === 1 ? "text-[#E8602E]" : ""}>Form</span>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className={step === 2 ? "text-[#E8602E]" : ""}>Review</span>
                                    <ChevronRight className="w-3 h-3" />
                                    <span>Success</span>
                                </div>
                            </div>

                            {step === 1 ? (
                                <form onSubmit={handleReview} className="space-y-6">
                                    
                                    {/* Personal Info Header */}
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Personal Information</h4>
                                        <p className="text-[11px] text-zinc-600">Please provide accurate verification details.</p>
                                    </div>

                                    {/* Phone & Aadhaar */}
                                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Phone Number <span className="text-red-500">*</span>
                                            </Label>
                                            <PhoneInput
                                                country={"in"}
                                                value={form.phone}
                                                onChange={handlePhoneChange}
                                                inputProps={{
                                                    name: "phone",
                                                    required: true
                                                }}
                                                inputClass="!w-full !bg-white/[0.02] !border-white/[0.06] !rounded-xl !text-white !h-10 !pl-12 !focus:border-[#E8602E]/30 !focus:ring-[#E8602E]/30 !transition-all"
                                                buttonClass="!bg-transparent !border-white/[0.06] !rounded-l-xl"
                                            />
                                            {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="aadhaar" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Aadhaar Card Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                id="aadhaar"
                                                name="aadhaar"
                                                value={form.aadhaar}
                                                onChange={handleAadhaarChange}
                                                placeholder="XXXX-XXXX-XXXX"
                                                className="bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:border-[#E8602E]/30 focus:ring-[#E8602E]/30 transition-all placeholder-zinc-700 h-10"
                                                required
                                            />
                                            {errors.aadhaar && <p className="text-[10px] text-red-500 mt-1">{errors.aadhaar}</p>}
                                        </div>
                                    </div>

                                    <Separator className="border-white/[0.04] my-6" />

                                    {/* Professional Info Header */}
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Professional Experience</h4>
                                        <p className="text-[11px] text-zinc-600">Provide details of your teaching qualifications.</p>
                                    </div>

                                    {/* Experience & Qualification */}
                                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="experience" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Teaching Experience (Years) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                id="experience"
                                                name="experience"
                                                value={form.experience}
                                                onChange={handleChange}
                                                min="0"
                                                max="50"
                                                placeholder="e.g. 5"
                                                className="bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:border-[#E8602E]/30 focus:ring-[#E8602E]/30 transition-all placeholder-zinc-700 h-10"
                                                required
                                            />
                                            {errors.experience && <p className="text-[10px] text-red-500 mt-1">{errors.experience}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="qualification" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Highest Qualification <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                id="qualification"
                                                name="qualification"
                                                value={form.qualification}
                                                onChange={handleChange}
                                                placeholder="e.g. M.Tech or Ph.D. in CS"
                                                className="bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:border-[#E8602E]/30 focus:ring-[#E8602E]/30 transition-all placeholder-zinc-700 h-10"
                                                required
                                            />
                                            {errors.qualification && <p className="text-[10px] text-red-500 mt-1">{errors.qualification}</p>}
                                        </div>
                                    </div>

                                    {/* Expertise & Resume */}
                                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="expertise" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Area of Expertise <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                id="expertise"
                                                name="expertise"
                                                value={form.expertise}
                                                onChange={handleChange}
                                                placeholder="e.g. React, Python, ML"
                                                className="bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:border-[#E8602E]/30 focus:ring-[#E8602E]/30 transition-all placeholder-zinc-700 h-10"
                                                required
                                            />
                                            {errors.expertise && <p className="text-[10px] text-red-500 mt-1">{errors.expertise}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="resume" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Upload Resume (Optional)
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type="file"
                                                    id="resume"
                                                    name="resume"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    disabled={fileUploading}
                                                    className="bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:border-[#E8602E]/30 focus:ring-[#E8602E]/30 transition-all h-10 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8602E]/10 file:text-[#E8602E] hover:file:bg-[#E8602E]/20"
                                                />
                                                {fileUploading && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#E8602E] text-xs font-bold gap-1.5">
                                                        <div className="w-3.5 h-3.5 border-2 border-[#E8602E] border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Uploading...</span>
                                                    </div>
                                                )}
                                            </div>
                                            {fileSelected && form.resumeUrl ? (
                                                <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1 font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resume uploaded successfully.
                                                </p>
                                            ) : (
                                                <p className="text-[9px] text-zinc-600 mt-1">PDF, DOC, DOCX up to 5MB.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reason Textarea */}
                                    <div className="space-y-2">
                                        <Label htmlFor="reason" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Why do you want to become an instructor at Mentora? <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            name="reason"
                                            value={form.reason}
                                            onChange={handleChange}
                                            placeholder="Write about your technical motivation and what syllabus or courses you wish to launch..."
                                            className="bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:border-[#E8602E]/30 focus:ring-[#E8602E]/30 transition-all placeholder-zinc-700 min-h-[100px] resize-none"
                                            required
                                        />
                                        {errors.reason ? (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.reason}</p>
                                        ) : (
                                            <p className="text-[9px] text-zinc-600">Minimum 50 characters required.</p>
                                        )}
                                    </div>

                                    {/* Form Submit */}
                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={fileUploading}
                                            className="bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl font-bold px-6 py-2.5 h-auto transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-lg shadow-[#E8602E]/10"
                                        >
                                            <span>Review Application</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>

                                </form>
                            ) : (
                                /* Step 2: Review Screen */
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Personal Details</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Full Name</span>
                                                    <span className="text-white font-bold">{user?.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Email Address</span>
                                                    <span className="text-white font-bold">{user?.email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Phone</span>
                                                    <span className="text-white font-bold">+{form.phone}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Aadhaar Card</span>
                                                    <span className="text-white font-bold">{form.aadhaar}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Professional details</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Teaching Experience</span>
                                                    <span className="text-white font-bold">{form.experience} Years</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Highest Qualification</span>
                                                    <span className="text-white font-bold">{form.qualification}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Area of Expertise</span>
                                                    <span className="text-white font-bold">{form.expertise}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Resume (Uploaded)</span>
                                                    {form.resumeUrl ? (
                                                        <a
                                                            href={form.resumeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs text-[#E8602E] font-bold hover:underline mt-1"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" /> View Uploaded Document
                                                        </a>
                                                    ) : (
                                                        <span className="text-zinc-600 italic text-xs mt-1 block">No file uploaded</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Motivation Statement</h4>
                                            <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                                                {form.reason}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="border-white/[0.04] my-6" />

                                    <div className="flex items-center justify-between gap-4">
                                        <Button
                                            onClick={handleBack}
                                            variant="outline"
                                            disabled={isLoading}
                                            className="border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-xl font-bold px-5 h-10"
                                        >
                                            Edit Form
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl font-bold px-6 h-10 transition-all flex items-center gap-1.5 shadow-lg shadow-[#E8602E]/10"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Submitting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Submit Application</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplyInstructor;
