import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateQuizMutation, useGetQuizQuery } from "@/features/api/quizApi";
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
          },
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

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disbaled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
            {
              removeLoading ? <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
              Please wait
              </> : "Remove Lecture"
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="space-y-2">
          <Label>Upload PDF, DOCX, or PPT</Label>
          <Input
            type="file"
            accept=".pdf,.docx,.ppt,.pptx"
            onChange={(e) => fileUploadHandler(e, "document")}
            multiple
          />
          {uploadDocInfo.length > 0 && (
            <div className="mt-2 space-y-2">
              {uploadDocInfo.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-card">
                  <span className="text-sm text-foreground">{doc.fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="airplane-mode" />
          <Label htmlFor="airplane-mode">Is this video FREE</Label>
        </div>

        {mediaProgress && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Quiz Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quiz Settings</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Time Limit (minutes)</Label>
              <Input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min="1"
              />
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Questions</h4>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 space-y-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Question {qIndex + 1}</Label>
                    <Input
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-muted-foreground">Correct</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <Button
              onClick={handleQuizSubmit}
              disabled={questions.length === 0}
            >
              Save Quiz
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={isLoading} onClick={editLectureHandler}>
            {
              isLoading ? <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
              Please wait
              </> : "Update Lecture"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;