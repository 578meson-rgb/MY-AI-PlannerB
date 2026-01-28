
import { GoogleGenAI } from "@google/genai";
import { UserPlanRequest } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (request: UserPlanRequest) => {
  const { selectedChapters, examDate, dailyHours, confidence } = request;

  const topicsFormatted = selectedChapters.map(sc => {
    return `${sc.subjectId} ${sc.paper === 'first' ? '1st' : '2nd'} Paper: ${sc.chapterNames.join(', ')}`;
  }).join('\n');

  const prompt = `
Act as a smart, caring, and realistic senior student/mentor. 
The student has provided:
Topics:
${topicsFormatted}
Exam Date: ${examDate}
Daily Study Time: ${dailyHours} hours
Confidence: ${confidence}

Create a PRECISE, LOGICAL, and HUMAN-FRIENDLY routine. 
Rules:
1. Don't be a robot. Distribute topics naturally.
2. Hardest/Most Important chapters must be done first.
3. Group related chapters logically.
4. Include exactly one "Buffer Day" for every 6 study days.
5. Use the Bangla chapter names provided exactly.
6. The output must follow the EXACT formatting style of the "Personalized Study Plan" provided in screenshots.

Format requirements:
- Day entries: "Day [N]: [Chapter Name Bangla] ([Subject English]) ([N] hrs) - [Specific Sub-topic or focus area in English]"
- The [Chapter Name Bangla] should be the one provided in the list.
- Subject English should be "Physics 1st", "Higher Math 2nd", etc.
- Descriptions should be realistic student-focused goals.

Return output ONLY in this EXACT structure (including emojis and headers):

📅 Study Duration Overview:
- Total days left until the exam: [Days] (Approximate until [Date])
- Number of active study days: [Days] (Focused Intensive Cycle)
- Number of buffer / rest days: [Days] days
- Overall preparation strategy: [One professional sentence describing the approach]

⏳ Smart Time Estimation:
- [Chapter Name Bangla]: [Total Hours] | [Difficulty] | [Reasoning logic]

🗓️ Daily Study Plan:
Day 1: [Chapter Name Bangla] ([Subject English]) ([N] hrs) - [English Detail]
Day 2: [Chapter Name Bangla] ([Subject English]) ([N] hrs) - [English Detail]
... (Use "Buffer / Rest Day (Relax and review formulas)" for rest days)

🔁 Revision Strategy:
- Weekly Review: [Short description]
- Specific Session: [Days range and focus]
- Duration: [Hours blocks]

🌱 Daily Motivation:
Day 1: [Short English Quote]
Day 2: [Short English Quote]
...

⚠️ Burnout Prevention Tips:
- 50/10 Rule: [Advice]
- Catch-up Strategy: [Advice]
- Hydration: [Advice]

🎯 Exam-Focused Advice:
- Last 48 Hours: [Specific advice]
- Final Day: [Specific advice]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.3, // Lower temperature for stricter formatting consistency
      }
    });

    return response.text || "Failed to generate plan. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
