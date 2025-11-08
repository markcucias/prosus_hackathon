// src/lib/templates/tier1_templates.js

/**
 * TIER 1 - CORE EXERCISE TEMPLATES
 * These 5 templates are the foundation of the system.
 * Priority: Build these first (4 hours)
 * Evaluation: All are auto-evaluable (no GPT needed for grading)
 */

export const TIER1_TEMPLATES = {
  
  // ============================================================================
  // 1. MULTIPLE CHOICE
  // ============================================================================
  
  multiple_choice: {
    name: "Multiple Choice Question",
    description: "Standard MCQ with 4 options, one correct answer",
    evaluationType: "automatic", // No GPT needed for evaluation
    
    // What gets stored in MongoDB after generation
    schema: {
      type: "multiple_choice",
      question: String,           // "What is the time complexity of binary search?"
      options: [String],          // ["O(n)", "O(log n)", "O(n²)", "O(1)"]
      correctAnswer: String,      // "B"
      explanation: String,        // Why B is correct
      topic: String,
      difficulty: Number,         // 1-5
      // User interaction fields (filled later)
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String
    },
    
    // How to generate this exercise with GPT-4
    generatePrompt: (topic, difficulty, assignmentType, context = {}) => {
      const difficultyDescriptions = {
        1: "very basic recall or recognition",
        2: "straightforward understanding",
        3: "moderate application or analysis", 
        4: "complex reasoning or synthesis",
        5: "expert-level critical thinking"
      };
      
      return `Generate a multiple choice question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5 - ${difficultyDescriptions[difficulty]}

INSTRUCTIONS:
- Create a clear, unambiguous question
- Provide exactly 4 options labeled A, B, C, D
- Make distractors plausible but clearly incorrect to someone who understands the concept
- Avoid "all of the above" or "none of the above" options
- Explanation should be 1-2 sentences

Return this EXACT JSON structure:
{
  "question": "your question text here",
  "options": [
    "Option A text",
    "Option B text",
    "Option C text",
    "Option D text"
  ],
  "correctAnswer": "B",
  "explanation": "why B is correct"
}`;
    },
    
    // How to evaluate user's answer (automatic - no GPT needed)
    evaluate: (exercise, userAnswer) => {
      const correct = userAnswer.trim().toUpperCase() === 
                     exercise.correctAnswer.toUpperCase();
      
      return {
        isCorrect: correct,
        score: correct ? 100 : 0,
        feedback: correct 
          ? `Correct! ${exercise.explanation}`
          : `Incorrect. The correct answer is ${exercise.correctAnswer}. ${exercise.explanation}`,
        correctAnswer: exercise.correctAnswer
      };
    }
  },
  
  // ============================================================================
  // 2. TRUE/FALSE WITH JUSTIFICATION
  // ============================================================================
  
  true_false_justify: {
    name: "True/False with Justification",
    description: "Statement that's true or false, user must explain why",
    evaluationType: "semi-automatic", // Boolean is auto, justification checked via keywords
    
    schema: {
      type: "true_false_justify",
      statement: String,          // "Mitosis results in four daughter cells"
      correctAnswer: Boolean,     // false
      explanation: String,        // Why it's false and what's actually true
      requiredKeywords: [String], // ["two", "meiosis", "four"] - for justification check
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: Boolean,
      userJustification: String,
      isCorrect: Boolean,
      feedback: String
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a true/false question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Create a statement that is definitively true or false (not ambiguous)
- If false, the statement should contain a common misconception
- Explanation should clarify why it's true/false in 2-3 sentences
- Provide 2-4 keywords that a good justification should include

Return this EXACT JSON structure:
{
  "statement": "your statement here",
  "correctAnswer": false,
  "explanation": "detailed explanation of why true/false",
  "requiredKeywords": ["keyword1", "keyword2", "keyword3"]
}`;
    },
    
    evaluate: (exercise, userAnswer, userJustification) => {
      const booleanCorrect = userAnswer === exercise.correctAnswer;
      
      if (!booleanCorrect) {
        return {
          isCorrect: false,
          score: 0,
          feedback: `Incorrect. The statement is ${exercise.correctAnswer}. ${exercise.explanation}`,
          correctAnswer: exercise.correctAnswer
        };
      }
      
      // Check justification quality via keywords
      const justificationLower = (userJustification || "").toLowerCase();
      const keywordsFound = exercise.requiredKeywords.filter(k =>
        justificationLower.includes(k.toLowerCase())
      );
      
      const ratio = keywordsFound.length / exercise.requiredKeywords.length;
      const adequate = ratio >= 0.5;
      
      return {
        isCorrect: adequate,               // <-- reflect justification quality
        score: adequate ? 100 : 60,        // partial credit if boolean right but weak rationale
        feedback: adequate
          ? `Correct! Your justification covers the key points. ${exercise.explanation}`
          : `Right idea, but justification is thin. Mention: ${exercise.requiredKeywords.join(', ')}. ${exercise.explanation}`,
        correctAnswer: exercise.correctAnswer,
        keywordsCovered: keywordsFound,
        keywordsMissed: exercise.requiredKeywords.filter(k => !keywordsFound.includes(k))
      };
    }
  },
  
  // ============================================================================
  // 3. FLASHCARD
  // ============================================================================
  
  flashcard: {
    name: "Flashcard",
    description: "Term on front, definition/explanation on back",
    evaluationType: "self-report", // User self-reports correct/incorrect
    
    schema: {
      type: "flashcard",
      front: String,              // "What is polymorphism?"
      back: String,               // "The ability of objects to take multiple forms..."
      keyPoints: [String],        // Key concepts for optional keyword checking
      topic: String,
      difficulty: Number,
      // User interaction
      userKnew: Boolean,          // Did user know this before flipping?
      reviewAgain: Boolean,       // Does user want to review this again?
      timesReviewed: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a flashcard for studying "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Front: A clear question or prompt (not just a term)
- Back: Concise answer/explanation (2-4 sentences max)
- Include 2-3 key points that the answer must cover

Return this EXACT JSON structure:
{
  "front": "What is [concept]?",
  "back": "concise but complete explanation",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;
    },
    
    evaluate: (exercise, userResponse) => {
      // Flashcards are self-reported
      // userResponse = { knew: true/false, wantsReview: true/false }
      
      return {
        isCorrect: userResponse.knew,
        score: userResponse.knew ? 100 : 0,
        feedback: userResponse.knew 
          ? "Great! Keep reviewing regularly." 
          : "No problem - review this again later.",
        needsReview: userResponse.wantsReview || !userResponse.knew
      };
    },
    
    // Optional: keyword-based verification instead of self-report
    evaluateWithAnswer: (exercise, userAnswer) => {
      const answerLower = (userAnswer || "").toLowerCase();
      const keywordsFound = exercise.keyPoints.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      const score = (keywordsFound.length / exercise.keyPoints.length) * 100;
      const correct = score >= 60; // 60% threshold
      
      return {
        isCorrect: correct,
        score: Math.round(score),
        feedback: correct
          ? `Good! You covered ${keywordsFound.length}/${exercise.keyPoints.length} key points.`
          : `You missed some key points: ${exercise.keyPoints.join(', ')}. Correct answer: ${exercise.back}`,
        keywordsCovered: keywordsFound,
        keywordsMissed: exercise.keyPoints.filter(k => !keywordsFound.includes(k))
      };
    }
  },
  
  // ============================================================================
  // 4. FILL-IN-THE-BLANK
  // ============================================================================
  
  fill_in_blank: {
    name: "Fill in the Blank",
    description: "Sentence with blank(s) to complete",
    evaluationType: "automatic",
    
    schema: {
      type: "fill_in_blank",
      sentence: String,           // "The ___ is the powerhouse of the cell"
      blanks: [{                  // Support multiple blanks
        position: Number,         // Which blank (0-indexed)
        correctAnswers: [String], // ["mitochondria", "mitochondrion"] - accept variants
        caseSensitive: Boolean
      }],
      explanation: String,
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswers: [String],
      isCorrect: Boolean,
      feedback: String
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a fill-in-the-blank question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Create a sentence with 1-2 blank spaces marked with ___
- Provide all acceptable answers for each blank (including common valid variations)
- Blanks should test key terminology or concepts
- Sentence should provide enough context to make the answer clear

Return this EXACT JSON structure:
{
  "sentence": "The ___ is the powerhouse of the cell",
  "blanks": [
    {
      "position": 0,
      "correctAnswers": ["mitochondria", "mitochondrion"],
      "caseSensitive": false
    }
  ],
  "explanation": "brief explanation of the correct answer"
}`;
    },
    
    evaluate: (exercise, userAnswers) => {
      // userAnswers is an array matching blanks array
      const results = exercise.blanks.map((blank, index) => {
        const userAnswer = (userAnswers[index] || "").trim();
        const correctAnswers = blank.correctAnswers.map(ans => 
          blank.caseSensitive ? ans : ans.toLowerCase()
        );
        const normalizedUserAnswer = blank.caseSensitive 
          ? userAnswer 
          : userAnswer.toLowerCase();
        
        return correctAnswers.includes(normalizedUserAnswer);
      });
      
      const allCorrect = results.every(r => r);
      const score = (results.filter(r => r).length / results.length) * 100;
      
      return {
        isCorrect: allCorrect,
        score: Math.round(score),
        feedback: allCorrect
          ? `Correct! ${exercise.explanation}`
          : `Not quite. ${exercise.explanation}`,
        correctAnswers: exercise.blanks.map(b => b.correctAnswers[0])
      };
    }
  },
  
  // ============================================================================
  // 5. NUMERICAL PROBLEM
  // ============================================================================
  
  numerical_problem: {
    name: "Numerical Problem",
    description: "Math/calculation problem with numeric answer",
    evaluationType: "automatic",
    
    schema: {
      type: "numerical_problem",
      question: String,           // "If f(x) = 2x + 3, what is f(5)?"
      correctAnswer: Number,      // 13
      tolerance: Number,          // 0.01 for floating point comparison
      units: String,              // "meters", "seconds", null if unitless
      showWork: Boolean,          // Does this require showing work?
      solutionSteps: [String],    // Optional: steps for solution
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: Number,
      userWork: String,           // Optional: if showWork = true
      isCorrect: Boolean,
      feedback: String
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a numerical problem about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Create a clear problem that requires calculation
- Provide the exact numeric answer
- Specify units if applicable (or null if unitless)
- Provide solution steps if it's a multi-step problem
- Set appropriate tolerance for floating-point answers (usually 0.01)

Return this EXACT JSON structure:
{
  "question": "If f(x) = 2x + 3, what is f(5)?",
  "correctAnswer": 13,
  "tolerance": 0.01,
  "units": null,
  "showWork": false,
  "solutionSteps": ["Substitute x=5", "Calculate 2(5)+3 = 13"]
}`;
    },
    
    evaluate: (exercise, userAnswer, userWork = null) => {
      const numericAnswer = parseFloat(userAnswer);
      
      if (isNaN(numericAnswer)) {
        return {
          isCorrect: false,
          score: 0,
          feedback: "Please provide a numeric answer.",
          correctAnswer: exercise.correctAnswer
        };
      }
      
      const difference = Math.abs(numericAnswer - exercise.correctAnswer);
      const correct = difference <= exercise.tolerance;
      
      let feedback = "";
      if (correct) {
        feedback = `Correct! The answer is ${exercise.correctAnswer}`;
        if (exercise.units) feedback += ` ${exercise.units}`;
        feedback += ".";
      } else {
        feedback = `Incorrect. The correct answer is ${exercise.correctAnswer}`;
        if (exercise.units) feedback += ` ${exercise.units}`;
        feedback += `.`;
        
        if (exercise.solutionSteps && exercise.solutionSteps.length > 0) {
          feedback += `\n\nSolution steps:\n${exercise.solutionSteps.map((step, i) => 
            `${i + 1}. ${step}`
          ).join('\n')}`;
        }
      }
      
      return {
        isCorrect: correct,
        score: correct ? 100 : 0,
        feedback: feedback,
        correctAnswer: exercise.correctAnswer,
        userAnswerDifference: difference
      };
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate an exercise using GPT-4
 */
export async function generateExercise(templateType, topic, difficulty, assignmentType, openai) {
  const template = TIER1_TEMPLATES[templateType];
  
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  
  const prompt = template.generatePrompt(topic, difficulty, assignmentType);
  
  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content: "You are an expert educational content creator. Return ONLY valid JSON matching the requested structure. No markdown, no explanations outside the JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 1
    // Removed response_format - might not be supported by gpt-5-nano
  });
  
  const generated = JSON.parse(response.choices[0].message.content);
  
  // Add metadata
  return {
    type: templateType,
    topic: topic,
    difficulty: difficulty,
    ...generated,
    // Initialize user interaction fields
    userAnswer: null,
    isCorrect: null,
    feedback: null,
    createdAt: new Date()
  };
}

/**
 * Evaluate user's answer
 */
export function evaluateExercise(exercise, userResponse) {
  const template = TIER1_TEMPLATES[exercise.type];
  
  if (!template) {
    throw new Error(`Unknown exercise type: ${exercise.type}`);
  }
  
  // Different templates expect different response formats
  if (exercise.type === "multiple_choice") {
    return template.evaluate(exercise, userResponse.answer);
  } else if (exercise.type === "true_false_justify") {
    return template.evaluate(exercise, userResponse.answer, userResponse.justification);
  } else if (exercise.type === "flashcard") {
    return template.evaluate(exercise, userResponse);
  } else if (exercise.type === "fill_in_blank") {
    return template.evaluate(exercise, userResponse.answers);
  } else if (exercise.type === "numerical_problem") {
    return template.evaluate(exercise, userResponse.answer, userResponse.work);
  }
  
  throw new Error(`Evaluation not implemented for type: ${exercise.type}`);
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

EXAMPLE 1: Generate a multiple choice question

const exercise = await generateExercise(
  "multiple_choice",
  "Binary Search",
  3,
  "hybrid",
  openaiClient
);

// Saves to MongoDB:
await Exercise.create(exercise);


EXAMPLE 2: Evaluate user's answer

const evaluation = evaluateExercise(exercise, { answer: "B" });

// Returns:
{
  isCorrect: true,
  score: 100,
  feedback: "Correct! Binary search halves the search space each iteration",
  correctAnswer: "B"
}


EXAMPLE 3: True/False with justification

const tfExercise = await generateExercise(
  "true_false_justify",
  "Cell Division",
  2,
  "theoretical",
  openaiClient
);

const evaluation = evaluateExercise(tfExercise, {
  answer: false,
  justification: "Mitosis produces two daughter cells, not four. Meiosis produces four."
});

// Returns:
{
  isCorrect: true,
  score: 100,
  feedback: "Correct! Your justification covers the key points...",
  keywordsCovered: ["two", "meiosis", "four"],
  keywordsMissed: []
}


EXAMPLE 4: Fill in the blank

const evaluation = evaluateExercise(fillBlankExercise, {
  answers: ["mitochondria"]
});


EXAMPLE 5: Numerical problem

const evaluation = evaluateExercise(numericalExercise, {
  answer: "13",
  work: "f(5) = 2(5) + 3 = 10 + 3 = 13"
});

*/

export default TIER1_TEMPLATES;
