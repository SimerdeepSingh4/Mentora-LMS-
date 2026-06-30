import { ChatGoogle  } from "@langchain/google";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";

export const chatWithTutor = async (req, res) => {
  try {
    const { courseId, lectureId, message, history = [] } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    // Get Course details
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Get Lecture details if available
    let lecture = null;
    if (lectureId) {
      lecture = await Lecture.findById(lectureId);
    }

    // Check Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured on the server. Please configure GEMINI_API_KEY in the server .env file."
      });
    }

    // Construct the System Prompt with Course/Lecture Context
    let context = `You are Mentora AI, an intelligent learning assistant and tutor for the course "${course.courseTitle}".
Category: ${course.category}
Level: ${course.courseLevel || "All Levels"}
Description: ${course.description || "No description provided."}
`;

    if (lecture) {
      context += `
The student is currently watching the lecture: "${lecture.lectureTitle}".
`;
      if (lecture.docInfo && lecture.docInfo.length > 0) {
        context += `
Related documents/reading materials for this lecture:
${lecture.docInfo.map(doc => `- ${doc.fileName}`).join("\n")}
`;
      }
    } else {
      context += `
Here are the lectures available in this course:
${course.lectures.map((lec, idx) => `${idx + 1}. ${lec.lectureTitle}`).join("\n")}
`;
    }

    context += `
Guidelines:
1. Answer the student's questions clearly, concisely, and educationally.
2. Provide code examples or step-by-step explanations if relevant to their question. Use proper markdown for code formatting (e.g. \`\`\`javascript ... \`\`\`).
3. Only answer questions related to this course, general programming/technology topics, learning tips, or related academic concepts. If the student asks something completely unrelated (e.g. food, gossip, random calculations), politely remind them that you are the Mentora AI tutor for this course and redirect them back.
4. Keep the tone friendly, encouraging, helpful, and professional.
`;

    // Map history to Langchain Messages
    const messages = [
      new SystemMessage(context)
    ];

    // Append history (limit to last 10 messages for performance and token savings)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === "assistant" || msg.role === "model") {
        messages.push(new AIMessage(msg.content));
      }
    }

    // Append current user message
    messages.push(new HumanMessage(message));

    // Initialize Langchain Gemini Model
    const model = new ChatGoogle({
      model: "gemini-flash-lite-latest",
      maxOutputTokens: 2048,
      apiKey: apiKey,
      temperature: 0.7
    });

    console.log(`[AI Tutor] Sending request to Gemini for course: "${course.courseTitle}", lecture: "${lecture ? lecture.lectureTitle : "None"}"`);
    const response = await model.invoke(messages);

    return res.status(200).json({
      success: true,
      response: response.content
    });

  } catch (error) {
    console.error("Error in chatWithTutor:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while communicating with the AI Tutor.",
      error: error.message
    });
  }
};

export const generateQuiz = async (req, res) => {
  try {
    const { lectureId, courseId } = req.body;

    if (!lectureId) {
      return res.status(400).json({
        success: false,
        message: "Lecture ID is required"
      });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    const course = await Course.findById(courseId || lecture.courseId);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured on the server. Please configure GEMINI_API_KEY in the server .env file."
      });
    }

    const prompt = `You are a professional quiz generator. Create a multiple-choice quiz of exactly 5 questions based on the following lecture and course topic.
Course Topic: ${course ? course.courseTitle : "General"}
Lecture Title: ${lecture.lectureTitle}

Your response must be a valid JSON object matching this structure EXACTLY, with no explanation, no HTML tags, and no markdown formatting wrappers (do NOT wrap in \`\`\`json):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctAnswer": 0
    }
  ]
}

Ensure:
1. Every question has exactly 4 options.
2. "correctAnswer" is an integer index from 0 to 3 pointing to the correct option in the options array.
3. Questions are educational, accurate, and directly test understanding of the lecture topic.
4. Output ONLY the raw JSON string. Do not include markdown code block syntax.`;

    const model = new ChatGoogle({
      model: "gemini-flash-lite-latest",
      maxOutputTokens: 2048,
      apiKey: apiKey,
      temperature: 0.5
    });

    const response = await model.invoke([new HumanMessage(prompt)]);
    let contentText = response.content;

    // Clean up markdown block wrapper if AI returned one
    if (contentText.startsWith("```")) {
      contentText = contentText.replace(/^```(json)?\s*/i, "").replace(/\s*```$/, "");
    }
    contentText = contentText.trim();

    const quizData = JSON.parse(contentText);

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid response format from AI");
    }

    return res.status(200).json({
      success: true,
      questions: quizData.questions
    });

  } catch (error) {
    console.error("Error in generateQuiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz using AI.",
      error: error.message
    });
  }
};
