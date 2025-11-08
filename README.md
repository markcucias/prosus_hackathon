# Study Companion Agent

An AI-powered proactive learning assistant that autonomously generates personalized study materials and schedules exam preparation.

**Built for:** AI University Games Hackathon 2024

## Problem Statement

Students waste hours creating practice problems and determining what to study. Study Companion Agent solves this by autonomously detecting assignments, generating personalized exercises, and scheduling study sessions based on performance data.

## Solution Overview

- Reads Google Calendar to detect upcoming assignments and exams
- Generates personalized exercises tailored to weak areas
- Proactively schedules study sessions in available calendar slots
- Adapts difficulty and focus based on performance tracking
- Operates autonomously without constant user prompting

## Key Features

## Key Features

**Autonomous Assignment Detection**
- Scans Google Calendar for exam/assignment keywords
- Uses GPT-4 to classify event types (exam, essay, presentation)
- Extracts topics and deadlines automatically

**Intelligent Study Plan Generation**
- Creates 3-5 study sessions leading up to deadline
- Distributes topics across sessions (fundamentals to practice)
- Adapts session count based on assignment complexity

**Personalized Exercise Generation**
- Generates 5-7 practice questions per session using GPT-4
- Adjusts question type based on assignment format
- Difficulty adapts based on past performance

**Proactive Scheduling**
- Finds available time slots in calendar
- Respects study preferences (morning/evening)
- Creates calendar events automatically

**Adaptive Learning System**
- Tracks correctness rate per topic
- Identifies weak vs. strong areas
- Focuses future exercises on struggling topics
- Increases difficulty as performance improves

## Architecture

## Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB |
| AI Engine | GPT-4 (OpenAI API) |
| Calendar | Google Calendar API |
| Scheduling | node-cron |

### System Flow

```
Google Calendar (OAuth)
    ↓
Assignment Detection (GPT-4 + Keywords)
    ↓
Study Plan Generation Algorithm
    ↓
Find Available Calendar Slots
    ↓
Schedule Study Sessions (Create Events)
    ↓
Generate Exercises (GPT-4, 2hrs before session)
    ↓
Send Proactive Notification
    ↓
User Completes Exercises
    ↓
Evaluate Answers (GPT-4 for open-ended)
    ↓
Update Progress & Topic Mastery
    ↓
[Cycle repeats for next session]
```

## Database Schema

MongoDB stores all user data, assignments, study sessions, exercises, and progress tracking. Five main collections:

#### 1. **Users**
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  googleCalendarToken: String,
  studyPreferences: {
    preferredTimes: ["morning", "evening"],
    sessionDuration: 60, // minutes
    reminderAdvance: 30 // minutes before session
  },
  createdAt: Date
}
```

#### 2. **Assignments**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: "Machine Learning Exam",
  type: "exam" | "essay" | "presentation" | "quiz",
  dueDate: Date,
  topics: ["SVMs", "Neural Networks", "Decision Trees"],
  difficulty: "medium",
  materials: [{
    type: "slide" | "past_exam" | "notes",
    url: String,
    content: String
  }],
  calendarEventId: String, // original event that triggered this
  status: "upcoming" | "in_progress" | "completed"
}
```

#### 3. **StudySessions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  assignmentId: ObjectId,
  scheduledTime: Date,
  duration: 60, // minutes
  topics: ["SVMs", "Neural Networks"],
  focus: "concepts" | "practice" | "review",
  status: "scheduled" | "active" | "completed" | "missed",
  calendarEventId: String, // created event
  exercises: [ObjectId], // references to Exercise documents
  notificationSent: Boolean
}
```

#### 4. **Exercises**
```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,
  userId: ObjectId,
  assignmentId: ObjectId,
  topic: "Support Vector Machines",
  question: "What is the purpose of the kernel trick in SVMs?",
  type: "multiple_choice" | "open_ended" | "problem_solving",
  options: ["A", "B", "C", "D"], // if multiple choice
  correctAnswer: String,
  explanation: String,
  difficulty: 3, // 1-5 scale
  generatedAt: Date,
  userAnswer: String,
  isCorrect: Boolean,
  feedback: String,
  timeSpent: 180 // seconds
}
```

#### 5. **UserProgress**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  assignmentId: ObjectId,
  topicMastery: {
    "SVMs": {
      correct: 7,
      total: 10,
      correctRate: 70, // percentage
      averageDifficulty: 3.2,
      lastPracticed: Date
    },
    "Neural Networks": {
      correct: 4,
      total: 8,
      correctRate: 50,
      averageDifficulty: 2.8,
      lastPracticed: Date
    }
  },
  overallReadiness: 65, // 0-100 score
  weakTopics: ["Neural Networks", "Decision Trees"],
  strongTopics: ["SVMs"],
  updatedAt: Date
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Cloud Project with Calendar API enabled
- OpenAI API key with GPT-4 access

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Cloud Project with Calendar API enabled
- OpenAI API key with GPT-4 access

### Installation

Clone and install:
```bash
git clone https://github.com/your-team/study-companion-agent.git
cd study-companion-agent
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/study-companion
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
PORT=3000
SESSION_SECRET=your-secret-key
```

Set up Google Calendar API:
1. Go to Google Cloud Console
2. Create project and enable Google Calendar API
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `http://localhost:3000/auth/google/callback`
5. Copy credentials to `.env`

Initialize and start:
```bash
npm run db:init
npm run dev
```

Navigate to `http://localhost:3000`

## Usage

## Usage

### End User Flow

1. Sign up and authorize Google Calendar access
2. Agent automatically scans calendar for assignments (or add manually)
3. Agent generates study plan and schedules sessions
4. Receive exercises 30 minutes before each session
5. Complete exercises and receive instant feedback
6. Track progress through topic mastery dashboard

### API Examples

### API Examples

Manual assignment input:
```javascript
POST /api/assignments
{
  "title": "Machine Learning Exam",
  "type": "exam",
  "dueDate": "2024-11-15T09:00:00Z",
  "topics": ["SVMs", "Neural Networks"]
}
```

Submit answer:
```javascript
POST /api/exercises/:exerciseId/submit
{
  "answer": "The kernel trick allows...",
  "timeSpent": 180
}
```

## Demo Script

## Demo Script

### 90-Second Walkthrough

"Every student wastes hours searching for practice problems. Here's my Google Calendar with a Machine Learning exam on Friday. The agent detected it automatically this morning and created 5 study sessions leading up to the exam. It found free slots in my calendar and scheduled them.

It's Tuesday evening. The agent sent me 6 personalized practice problems tailored to my weak areas. Yesterday I struggled with SVMs, so today focuses on that. I complete the exercises and get instant feedback. My progress updates: 45% ready, Neural Networks is weakest.

This morning, without prompting, it generated new exercises focused on Neural Networks—adapting based on performance. By Friday, I've done 30 personalized problems. No time wasted searching. Just targeted practice."

## Project Structure

## Project Structure

```
src/
├── components/       # React components
├── pages/           # Next.js pages and API routes
├── lib/             # Core business logic
│   ├── ai/          # Exercise generation, evaluation
│   ├── calendar/    # OAuth, scanning, scheduling
│   ├── scheduler/   # Study plans, notifications
│   └── progress/    # Progress tracking
├── models/          # MongoDB schemas
└── jobs/            # Scheduled tasks (cron)
```

## Key Implementation

## Key Implementation

Exercise generation core logic:
```javascript
async function generateExercise(assignment, topic, difficulty, userHistory) {
  const prompt = `Create ${assignment.type} question for ${topic} at difficulty ${difficulty}/5.
Student's past performance: ${userHistory.correctRate}%
Focus on weak areas: ${userHistory.weakAreas}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

Progress tracking:
```javascript
async function updateProgress(userId, exercise, evaluation) {
  const topicData = progress.topicMastery[exercise.topic];
  topicData.total += 1;
  if (evaluation.isCorrect) topicData.correct += 1;
  
  const masteryRate = (topicData.correct / topicData.total) * 100;
  if (masteryRate < 60) progress.weakTopics.push(topic);
  
  await progress.save();
}
```

## Known Limitations

## Known Limitations

- Calendar OAuth can fail in certain environments (fallback: manual input)
- GPT-4 rate limits on free tier (mitigation: caching and batching)
- Open-ended answer evaluation is not perfect
- Demo assumes Europe/Amsterdam timezone

## Future Work

- Real-time study supervision with hints during sessions
- Material analysis (upload slides/notes for concept extraction)
- Spaced repetition scheduling
- Mobile app (iOS/Android)
- Multi-user study groups
- Voice interface for oral practice

## Team

Built for AI University Games Hackathon 2024

## License

MIT License

## Contact

GitHub Issues: [Create an issue](https://github.com/your-team/study-companion-agent/issues)
