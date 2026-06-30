import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, Plus, Minus, Trash2, Video, FileUp, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateQuizMutation, useGetQuizQuery } from "@/features/api/quizApi";
import { useGenerateAIQuizMutation } from "@/features/api/aiApi";
import { useSocket } from "@/hooks/useSocket";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [uploadDocInfo, setUploadDocInfo] = useState([]);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [timeLimit, setTimeLimit] = useState(30);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;
  const navigate=useNavigate();
  const [createQuiz] = useCreateQuizMutation();
  const { data: quizData } = useGetQuizQuery(lecture?.quiz, { skip: !lecture?.quiz });

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo({
        videoUrl: lecture.videoUrl,
        publicId: lecture.publicId
      });
      if (lecture.docInfo && lecture.docInfo.length > 0) {
        setUploadDocInfo(lecture.docInfo);
      }
      if (quizData?.data) {
        const quiz = quizData.data;
        setQuestions(quiz.questions);
        setTimeLimit(quiz.timeLimit);
      }
    }
  }, [lecture, quizData]);

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
  const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();
  const [generateAIQuiz, { isLoading: isAiGenerating }] = useGenerateAIQuizMutation();

  // Import the socket hook at the top of the file
  const { socketId, getUploadProgress, resetUploadProgress } = useSocket();
  const [currentUploadId, setCurrentUploadId] = useState(null);

  // Effect to update progress bar based on socket events
  useEffect(() => {
    if (currentUploadId) {
      const progress = getUploadProgress(currentUploadId);

      // Update the progress state
      if (progress > 0) {
        setUploadProgress(progress);
      }

      // If upload is complete, clean up
      if (progress === 100) {
        setTimeout(() => {
          setMediaProgress(false);
          resetUploadProgress(currentUploadId);
          setCurrentUploadId(null);
        }, 500); // Small delay to show 100% completion
      }

      // If there was an error
      if (progress === -1) {
        toast.error("Video upload failed on the server");
        setMediaProgress(false);
        resetUploadProgress(currentUploadId);
        setCurrentUploadId(null);
      }
    }
  }, [currentUploadId, getUploadProgress, resetUploadProgress]);

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Generate a unique upload ID
      const uploadId = `video_${Date.now()}`;
      setCurrentUploadId(uploadId);

      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);

      try {
        // Set initial progress to show activity
        setUploadProgress(0);

        // Add socket ID and upload ID to headers
        const headers = {
          'Content-Type': 'multipart/form-data',
          'X-Upload-ID': uploadId
        };

        // Only add socket ID if it exists
        if (socketId) {
          headers['X-Socket-ID'] = socketId;
        }

        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          headers,
          onUploadProgress: ({ loaded, total }) => {
            // This only tracks the HTTP upload to our server, not the Cloudinary upload
            // We'll use a low percentage (max 30%) to indicate the first phase
            const clientProgress = Math.min(30, Math.round((loaded * 30) / total));
            if (clientProgress > 0) {
              setUploadProgress(clientProgress);
            }
          }
        });

        if (res.data.success) {
          console.log('Video upload response:', res.data);
          setUploadVideoInfo({
            videoUrl: res.data.data.secure_url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);

          // The socket will handle setting progress to 100%
        }
      } catch (error) {
        console.error('Video upload error:', error);
        toast.error("Video upload failed");
        setMediaProgress(false);
        resetUploadProgress(uploadId);
        setCurrentUploadId(null);
      }
    }
  };

  const fileUploadHandler = async (e, fileType) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setMediaProgress(true);

    try {
      const endpoint = fileType === "document" ? `${MEDIA_API}/upload-material` : `${MEDIA_API}/upload-video`;

      if (fileType === "document") {
        // Handle multiple document uploads
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await axios.post(endpoint, formData, {
            onUploadProgress: ({ loaded, total }) => {
              setUploadProgress(Math.round((loaded * 100) / total));
            },
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (res.data.success) {
            return {
              fileUrl: res.data.data.secure_url,
              fileName: file.name,
              publicId: res.data.data.public_id
            };
          }
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        setUploadDocInfo(prev => [...prev, ...uploadedFiles]);
      } else {
        // Handle single video upload
        const formData = new FormData();
        formData.append("file", files[0]);

        const res = await axios.post(endpoint, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (res.data.success) {
          setUploadVideoInfo({
            videoUrl: res.data.data.secure_url,
            publicId: res.data.data.public_id
          });
        }
      }

      setBtnDisable(false);
      toast.success(fileType === "document" ? "Documents uploaded successfully" : "Video uploaded successfully");
    } catch (error) {
      console.error(`${fileType} upload error:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`${fileType} upload failed: ${error.message}`);
      }
    } finally {
      setMediaProgress(false);
    }
  };

  const removeDocument = (index) => {
    setUploadDocInfo(prev => prev.filter((_, i) => i !== index));
  };

  const editLectureHandler = async () => {
    const lectureData = {
      lectureTitle,
      videoInfo: uploadVideoInfo,
      docInfo: uploadDocInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    };

    console.log('Submitting lecture data:', lectureData);
    console.log('Documents:', uploadDocInfo);
    console.log('Materials array will be:', uploadDocInfo.map(doc => ({
      type: doc.fileName.split('.').pop().toUpperCase(),
      url: doc.fileUrl,
      publicId: doc.fileUrl.split("/").pop().split(".")[0]
    })));

    await editLecture(lectureData);
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(()=>{
    if(removeSuccess){
      toast.success(removeData.message);
      navigate(-1)
    }
  },[removeSuccess])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleDecrementTime = () => {
    setTimeLimit(prev => Math.max(1, prev - 1));
  };

  const handleIncrementTime = () => {
    setTimeLimit(prev => prev + 1);
  };

  const handleQuizSubmit = async () => {
    try {
      // Validate questions
      if (!questions || questions.length === 0) {
        toast.error("Please add at least one question");
        return;
      }

      // Validate each question
      for (const question of questions) {
        if (!question.question.trim()) {
          toast.error("Please fill in all question texts");
          return;
        }
        if (question.options.some(option => !option.trim())) {
          toast.error("Please fill in all options for each question");
          return;
        }
      }

      await createQuiz({
        lectureId,
        questions,
        timeLimit,
      });
      toast.success("Quiz created successfully");
    } catch (error) {
      console.error("Quiz creation error:", error);
      toast.error(error.data?.message || "Failed to create quiz");
    }
  };

  const generateAIQuizHandler = async () => {
    try {
      const response = await generateAIQuiz({ lectureId, courseId }).unwrap();
      if (response.success && response.questions) {
        setQuestions(response.questions);
        toast.success("AI Quiz questions drafted successfully!");
      }
    } catch (err) {
      console.error("AI Quiz generation error:", err);
      toast.error(err?.data?.message || "Failed to generate quiz with AI");
    }
  };

  return (
    <div className="w-full bg-[#0c0c0c] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header Actions */}
      <div className="p-6 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.01] to-transparent">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-white tracking-tight">Lecture Settings</h2>
          <p className="text-xs text-white/40 font-medium">Configure video properties, append resources, and configure test quizzes.</p>
        </div>
        
        <Button 
          disabled={removeLoading} 
          onClick={removeLectureHandler}
          className="border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 hover:border-red-500/25 text-xs font-bold px-4 h-9 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
        >
          {removeLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" /> Remove Lecture
            </>
          )}
        </Button>
      </div>

      {/* Main Form Fields */}
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Lecture Title */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Lecture Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
            className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none transition-all"
          />
        </div>

        {/* Video & PDF Upload Section Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Video Dragzone File Uploader */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
              Lecture Video <span className="text-[#E8602E]">*</span>
            </Label>
            
            <div className="border border-dashed border-white/[0.1] hover:border-[#E8602E]/40 bg-white/[0.01] rounded-2xl p-6 text-center cursor-pointer transition-all relative group">
              <input 
                type="file" 
                onChange={fileChangeHandler} 
                accept="video/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {uploadVideoInfo?.videoUrl ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Video Ready
                  </div>
                  <p className="text-xs text-white/50 max-w-sm mx-auto truncate mt-1">{uploadVideoInfo.videoUrl}</p>
                  <p className="text-[9px] text-white/30">Click or drag a new video to replace</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-white/40 group-hover:text-[#E8602E] transition-colors">
                    <Video className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-white">Upload lecture video</p>
                  <p className="text-[10px] text-white/30">Supports MP4, MOV, or WEBM up to 100MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Dragzone File Uploader */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Attachments & Documents</Label>
            
            <div className="border border-dashed border-white/[0.1] hover:border-[#E8602E]/40 bg-white/[0.01] rounded-2xl p-6 text-center cursor-pointer transition-all relative group">
              <input 
                type="file" 
                onChange={(e) => fileUploadHandler(e, "document")} 
                accept=".pdf,.docx,.ppt,.pptx" 
                multiple 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-2 py-2">
                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-white/40 group-hover:text-[#E8602E] transition-colors">
                  <FileUp className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-white">Upload materials</p>
                <p className="text-[10px] text-white/30">Supports PDF, DOCX, or PPT up to 15MB</p>
              </div>
            </div>
          </div>

        </div>

        {/* Uploaded Documents List */}
        {uploadDocInfo.length > 0 && (
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Attached Materials</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {uploadDocInfo.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-white/[0.05] rounded-xl bg-white/[0.01]">
                  <span className="text-xs text-white/70 truncate mr-2">{doc.fileName}</span>
                  <button
                    onClick={() => removeDocument(index)}
                    className="w-7 h-7 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 text-red-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Toggle */}
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
          <div className="space-y-0.5">
            <Label htmlFor="preview-mode" className="text-xs font-bold text-white leading-none block">Preview Access</Label>
            <span className="text-[10px] text-white/40">Enable this to allow students to watch this video without buying the course.</span>
          </div>
          <Switch checked={isFree} onCheckedChange={setIsFree} id="preview-mode" />
        </div>

        {/* Upload progress indicator */}
        {mediaProgress && (
          <div className="space-y-2 bg-[#121212] border border-white/[0.06] p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white/70">Uploading files to server...</span>
              <span className="text-[#E8602E]">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5 bg-white/[0.03]" />
          </div>
        )}

        {/* Divider separator */}
        <div className="border-t border-white/[0.04] pt-8" />

        {/* Quiz Builder Panel */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#E8602E]" /> Quiz Settings
              </h3>
              <p className="text-[11px] text-white/40">Build an assessment test students must complete after watching this lecture.</p>
            </div>
          </div>

          <div className="space-y-5 bg-[#090909] border border-white/[0.04] rounded-2xl p-5 md:p-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Time Limit (minutes)</Label>
              <div className="flex items-center bg-white/[0.02] border border-white/[0.06] rounded-xl h-10 w-32 overflow-hidden">
                <button
                  type="button"
                  onClick={handleDecrementTime}
                  className="w-10 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-all border-r border-white/[0.06] select-none cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  value={timeLimit}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/\D/g, ''));
                    setTimeLimit(val > 0 ? val : 1);
                  }}
                  className="flex-1 w-full h-full text-center bg-transparent border-0 text-xs font-bold text-white focus:outline-none focus:ring-0 focus-visible:ring-0 p-0 outline-none"
                />
                <button
                  type="button"
                  onClick={handleIncrementTime}
                  className="w-10 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-all border-l border-white/[0.06] select-none cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Questions Section */}
            {questions.length > 0 && (
              <div className="space-y-5">
                <Label className="text-[10px] font-bold text-white/45 uppercase tracking-widest block border-b border-white/[0.04] pb-2">Questions Outline</Label>
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-5 space-y-4 border border-white/[0.05] bg-[#0c0c0c] rounded-xl relative group">
                    
                    {/* Remove Question Icon */}
                    <button 
                      onClick={() => removeQuestion(qIndex)}
                      className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 text-red-400 hover:text-red-350 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Question {qIndex + 1}</Label>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                        placeholder="Enter your question"
                        className="w-full h-10 bg-white/[0.02] border-white/[0.06] text-xs rounded-xl text-white outline-none"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Multiple Choice Options</Label>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 h-9 bg-transparent border-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-white/20 p-0"
                            />
                            
                            <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0 group/label">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                                className="w-3.5 h-3.5 accent-[#E8602E] cursor-pointer"
                              />
                              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                q.correctAnswer === oIndex 
                                  ? "text-[#E8602E]" 
                                  : "text-white/40 group-hover/label:text-white/80"
                              }`}>
                                Correct
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quiz Buttons Grid */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="flex-1 h-10 border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:text-white rounded-xl text-xs font-bold text-white/50"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isAiGenerating}
                onClick={generateAIQuizHandler}
                className="flex-1 h-10 border-white/[0.06] bg-[#E8602E]/8 hover:bg-[#E8602E]/15 border-[#E8602E]/20 text-[#E8602E] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Drafting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate with AI
                  </>
                )}
              </Button>

              <Button
                onClick={handleQuizSubmit}
                disabled={questions.length === 0}
                className="flex-1 h-10 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs font-bold transition-all"
              >
                Save Quiz Layout
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Save Action Footer */}
      <div className="p-6 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/instructor/course/${courseId}/lecture`)}
          className="h-10 border-white/[0.06] bg-transparent hover:bg-white/[0.05] hover:text-white rounded-xl text-xs font-bold transition-all text-white/50"
        >
          Cancel
        </Button>
        
        <Button 
          disabled={isLoading} 
          onClick={editLectureHandler}
          className="h-10 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#E8602E]/10 px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Update Lecture Details"
          )}
        </Button>
      </div>
    </div>
  );
};

export default LectureTab;