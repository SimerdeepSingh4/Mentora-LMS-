import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AlertCircle, BookOpen, GraduationCap, Upload, CheckCircle2 } from "lucide-react";
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

        // Validate the field when the user types
        validateField(name, value);
    };

    const handlePhoneChange = (value) => {
        setForm(prev => ({ ...prev, phone: value }));

        // Validate phone
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

        // Validate aadhaar
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
        // Check file size
        const maxSize = 5 * 1024 * 1024; // 5MB (Supabase allows larger files)
        if (file && file.size > maxSize) {
            toast.error("File size should be less than 5MB!");
            return;
        }

        // Check file type
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
            // First try Supabase upload
            try {
                // Use the direct Supabase upload utility
                const { uploadFileToSupabase } = await import('@/utils/directSupabase');

                // Upload the file directly to Supabase
                const resumeUrl = await uploadFileToSupabase(file, 'resumes');

                // Log the URL for debugging
                console.log("Direct Supabase upload successful. URL:", resumeUrl);

                // Update the form with the resume URL
                setForm(prev => ({ ...prev, resumeUrl }));
                toast.success("Resume uploaded successfully to Supabase!");
                return; // Exit early on success
            } catch (supabaseError) {
                console.error("Supabase upload failed, falling back to Cloudinary:", supabaseError);

                // Show a notification about the fallback
                toast.info("Using alternative upload method...");
            }

            // Fallback to Cloudinary via server
            console.log("Falling back to Cloudinary upload...");

            // Create a FormData object
            const formData = new FormData();
            formData.append("file", file);

            // Use the media API to upload the file as a material (document)
            const response = await fetch("http://localhost:8080/api/v1/media/upload-material", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                // Store the clean URL without the attachment parameter for PDFs
                let resumeUrl = data.data.secure_url;

                // Log the URL for debugging
                console.log("Cloudinary upload successful. URL:", resumeUrl);

                // Clean the URL for PDFs to ensure it can be viewed directly
                if (file.type === "application/pdf" && resumeUrl.includes('fl_attachment:attachment')) {
                    resumeUrl = resumeUrl.replace('/upload/fl_attachment:attachment/', '/upload/');
                    console.log("Cleaned resume URL:", resumeUrl);
                }

                setForm(prev => ({ ...prev, resumeUrl }));
                toast.success("Resume uploaded successfully!");
            } else {
                throw new Error(data.message || "Failed to upload resume");
            }
        } catch (error) {
            console.error("All upload methods failed:", error);

            // Show a more detailed error message
            let errorMessage = "Failed to upload resume. ";

            if (error.message && error.message.includes("row-level security")) {
                errorMessage = "Security policy error. Please contact support with error code: RLS-VIOLATION.";
                console.error("Row-level security policy violation. This requires admin to update bucket permissions.");
            } else if (error.message && error.message.includes("permission")) {
                errorMessage += "Permission denied. Please check storage permissions.";
            } else if (error.message && error.message.includes("network")) {
                errorMessage += "Network error. Please check your internet connection.";
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += "Please try again.";
            }

            toast.error(errorMessage);
        } finally {
            setFileUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    };

    const validateForm = () => {
        // Check for any existing errors
        const hasErrors = Object.values(errors).some(error => error !== "");

        // Check if required fields are filled
        const requiredFields = ["phone", "aadhaar", "experience", "qualification", "expertise", "reason"];
        const missingFields = requiredFields.filter(field => !form[field]);

        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
            return false;
        }

        if (hasErrors) {
            toast.error("Please fix the errors in the form before submitting");
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

        // Create the application data object
        const applicationData = {
            phone: form.phone,
            aadhaar: form.aadhaar,
            experience: Number(form.experience), // Ensure experience is a number
            qualification: form.qualification,
            expertise: form.expertise,
            reason: form.reason
        };

        // Only add resumeUrl if it exists
        if (form.resumeUrl) {
            applicationData.resumeUrl = form.resumeUrl;
        }

        console.log("Submitting application data:", applicationData);

        try {
            const response = await createInstructorApplication(applicationData).unwrap();
            console.log("Application submission response:", response);

            if (response.success) {
                setStep(3);
                window.scrollTo(0, 0);
            } else {
                toast.error(response.message || "Failed to submit application");
                setStep(1);
            }
        } catch (error) {
            console.error("Application submission error:", error);

            // More detailed error logging
            if (error.status) console.error(`Status: ${error.status}`);
            if (error.data) console.error("Error data:", error.data);

            // Show a more specific error message if available
            let errorMessage = "Something went wrong. Please try again later.";

            if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (typeof error.message === 'string') {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            setStep(1);
        }
    };

    const handleBack = () => {
        setStep(1);
        window.scrollTo(0, 0);
    };

    if (step === 3) {
        return (
            <div className="container max-w-4xl px-4 py-8 mx-auto">
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-800">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-300" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center text-green-700 dark:text-green-300">
                            Application Submitted Successfully!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Thank you for applying to become an instructor at Mentora. Your application has been received and is under review.
                        </p>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            We will notify you via email once your application has been processed. This typically takes 2-3 business days.
                        </p>
                        <div className="flex flex-col gap-4 mt-8 sm:flex-row sm:justify-center">
                            <Button onClick={() => navigate("/profile")} variant="outline">
                                Go to Profile
                            </Button>
                            <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700">
                                Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl px-4 py-8 mx-auto">
            {step === 1 ? (
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900">
                            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">Become an Instructor</CardTitle>
                        <CardDescription className="text-center">
                            Share your knowledge and expertise with students around the world
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 mb-6 border rounded-lg bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <h5 className="mb-1 font-medium">Important</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Please provide accurate information. Your application will be reviewed by our team.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleReview} className="space-y-6">
                            <div className="space-y-4">
                                <div className="pb-2">
                                    <h3 className="text-lg font-medium">Personal Information</h3>
                                    <Separator className="my-2" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="phone" className="text-sm font-medium">
                                            Phone Number <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="mt-1">
                                            <PhoneInput
                                                country={"in"}
                                                value={form.phone}
                                                onChange={handlePhoneChange}
                                                inputProps={{
                                                    name: "phone",
                                                    required: true,
                                                    className: "w-full p-2 border rounded-md"
                                                }}
                                                containerClass="w-full"
                                            />
                                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="aadhaar" className="text-sm font-medium">
                                            Aadhaar Card Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="aadhaar"
                                            name="aadhaar"
                                            value={form.aadhaar}
                                            onChange={handleAadhaarChange}
                                            placeholder="XXXX-XXXX-XXXX"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.aadhaar && <p className="mt-1 text-sm text-red-500">{errors.aadhaar}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="pb-2">
                                    <h3 className="text-lg font-medium">Professional Information</h3>
                                    <Separator className="my-2" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="experience" className="text-sm font-medium">
                                            Teaching Experience (years) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            id="experience"
                                            name="experience"
                                            value={form.experience}
                                            onChange={handleChange}
                                            min="0"
                                            max="50"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="qualification" className="text-sm font-medium">
                                            Highest Qualification <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="qualification"
                                            name="qualification"
                                            value={form.qualification}
                                            onChange={handleChange}
                                            placeholder="e.g., Ph.D. in Computer Science"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.qualification && <p className="mt-1 text-sm text-red-500">{errors.qualification}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="expertise" className="text-sm font-medium">
                                        Area of Expertise <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        id="expertise"
                                        name="expertise"
                                        value={form.expertise}
                                        onChange={handleChange}
                                        placeholder="e.g., Web Development, Data Science"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.expertise && <p className="mt-1 text-sm text-red-500">{errors.expertise}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="reason" className="text-sm font-medium">
                                        Why do you want to become an instructor? <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        name="reason"
                                        value={form.reason}
                                        onChange={handleChange}
                                        placeholder="Describe your motivation and what you hope to achieve as an instructor..."
                                        className="mt-1 min-h-[120px]"
                                        required
                                    />
                                    {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                                    <p className="mt-1 text-xs text-gray-500">Minimum 50 characters required</p>
                                </div>

                                <div>
                                    <Label htmlFor="resume" className="text-sm font-medium">
                                        Upload Resume (Optional)
                                    </Label>
                                    <div className="mt-1">
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                id="resume"
                                                name="resume"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                disabled={fileUploading}
                                                className="flex-1"
                                            />
                                            {fileUploading && (
                                                <div className="flex items-center text-blue-600">
                                                    <span className="animate-spin mr-2">⟳</span> Uploading...
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Accepted formats: PDF, DOC, DOCX</p>
                                        {fileSelected && form.resumeUrl && (
                                            <p className="mt-2 text-sm text-green-600">
                                                <CheckCircle2 className="inline-block w-4 h-4 mr-1" /> Resume uploaded successfully
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    className="px-6"
                                    disabled={fileUploading}
                                >
                                    Review Application
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Review Your Application</CardTitle>
                        <CardDescription className="text-center">
                            Please review your information before submitting
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Personal Information</h3>
                                <Separator className="my-2" />
                                <dl className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm">{user?.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm">{user?.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                        <dd className="mt-1 text-sm">{form.phone}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Aadhaar Number</dt>
                                        <dd className="mt-1 text-sm">{form.aadhaar}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">Professional Information</h3>
                                <Separator className="my-2" />
                                <dl className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Teaching Experience</dt>
                                        <dd className="mt-1 text-sm">{form.experience} years</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Highest Qualification</dt>
                                        <dd className="mt-1 text-sm">{form.qualification}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Area of Expertise</dt>
                                        <dd className="mt-1 text-sm">{form.expertise}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Resume</dt>
                                        <dd className="mt-1 text-sm">
                                            {form.resumeUrl ? (
                                                <a
                                                    href={form.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-600 hover:underline"
                                                >
                                                    <Upload className="w-4 h-4 mr-1" /> View Uploaded Resume
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">No resume uploaded</span>
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">Motivation</h3>
                                <Separator className="my-2" />
                                <div className="p-4 mt-2 bg-gray-50 rounded-md dark:bg-gray-800">
                                    <p className="text-sm whitespace-pre-line">{form.reason}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading}
                        >
                            Back to Edit
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit Application"}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default ApplyInstructor;
