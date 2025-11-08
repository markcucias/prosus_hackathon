// src/lib/templates/tier3_templates.js

/**
 * TIER 3 - ADVANCED TEMPLATES
 * These 4 templates add sophistication and exam-level complexity.
 * Priority: Build if time permits after Tier 1 & 2 are working (3 hours)
 * Evaluation: All require GPT-assisted evaluation for accuracy
 */

export const TIER3_TEMPLATES = {
  
  // ============================================================================
  // 12. SCENARIO ANALYSIS - VARIANT A: APPLICATION
  // ============================================================================
  
  scenario_application: {
    name: "Scenario Analysis - Application",
    description: "Apply concepts to a real-world scenario",
    evaluationType: "gpt-assisted",
    
    schema: {
      type: "scenario_application",
      scenario: String,           // Detailed real-world situation
      question: String,           // What to analyze/determine
      relevantConcepts: [String], // Concepts that apply to this scenario
      correctAnalysis: String,    // Expected analysis
      keyPoints: [String],        // Points that must be covered
      minKeyPoints: Number,
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a scenario-based application question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Create a realistic scenario (2-4 sentences) where the student must apply concepts
- Ask a specific question about what concept applies, what they should do, or what would happen
- Identify the relevant concepts from the topic
- Provide the correct analysis/answer
- List 3-4 key points that must be in a good answer
- Set minKeyPoints to 2

Return this EXACT JSON structure:
{
  "scenario": "detailed realistic scenario (2-4 sentences)",
  "question": "What concept applies here? What should be done? What would happen?",
  "relevantConcepts": ["concept 1", "concept 2"],
  "correctAnalysis": "expected answer/analysis",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "minKeyPoints": 2
}

EXAMPLE:
{
  "scenario": "A startup's web application is experiencing slow response times during peak hours. The database queries are taking progressively longer as more users join. The application currently uses a single MySQL database with no caching layer.",
  "question": "What database optimization strategies should they implement and why?",
  "relevantConcepts": ["database indexing", "caching", "query optimization", "horizontal scaling"],
  "correctAnalysis": "They should implement database indexing on frequently queried columns, add a caching layer (Redis/Memcached) for repeated queries, optimize slow queries, and consider read replicas for scaling.",
  "keyPoints": ["indexing", "caching layer", "query optimization", "scaling strategy"],
  "minKeyPoints": 2
}`;
    },
    
    evaluate: async (exercise, userAnswer, openai) => {
      const prompt = `Evaluate this scenario analysis answer.

SCENARIO: ${exercise.scenario}
QUESTION: ${exercise.question}
RELEVANT CONCEPTS: ${exercise.relevantConcepts.join(', ')}
KEY POINTS TO COVER: ${exercise.keyPoints.join(', ')}
CORRECT ANALYSIS: ${exercise.correctAnalysis}

STUDENT'S ANSWER: ${userAnswer}

CRITERIA:
- Did they identify the correct concepts?
- Did they apply them appropriately to the scenario?
- Did they cover at least ${exercise.minKeyPoints} key points?
- Is their reasoning sound?

Return ONLY this JSON:
{
  "score": 0-100,
  "isCorrect": true or false (true if score >= 70),
  "feedback": "specific feedback on their analysis - what was good, what was missing",
  "conceptsIdentified": ["concepts they correctly identified"],
  "keyPointsCovered": ["key points they mentioned"],
  "keyPointsMissed": ["key points they didn't mention"],
  "misconceptions": ["any errors or misconceptions in their answer"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are an expert evaluator of applied learning. Assess if students can transfer knowledge to new situations. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1,
        // response_format: { type: "json_object" } // Removed - might not be supported by gpt-5-nano
      });
      
      return JSON.parse(response.choices[0].message.content);
    }
  },
  
  // ============================================================================
  // 13. SCENARIO ANALYSIS - VARIANT B: PREDICTION
  // ============================================================================
  
  scenario_prediction: {
    name: "Scenario Analysis - Prediction",
    description: "Predict outcomes based on a given scenario",
    evaluationType: "gpt-assisted",
    
    schema: {
      type: "scenario_prediction",
      scenario: String,           // Setup situation
      question: String,           // "What would happen if...?"
      correctPrediction: String,  // Expected outcome
      reasoning: String,          // Why this would happen
      keyPoints: [String],        // Points in reasoning
      minKeyPoints: Number,
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a prediction scenario question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Describe a situation with specific conditions
- Ask "What would happen if..." or "What is the likely outcome..."
- Provide the correct prediction
- Explain the reasoning behind this prediction
- List key points that support the prediction
- Set minKeyPoints to 2

Return this EXACT JSON structure:
{
  "scenario": "setup situation with conditions",
  "question": "What would happen if [change/action]?",
  "correctPrediction": "the expected outcome",
  "reasoning": "why this outcome would occur",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "minKeyPoints": 2
}

EXAMPLE:
{
  "scenario": "A binary search tree contains the values [8, 3, 10, 1, 6, 14, 4, 7, 13]. The tree is balanced and follows standard BST properties.",
  "question": "What would happen if we delete the root node (8)?",
  "correctPrediction": "The tree would need to be restructured. Either 7 (largest in left subtree) or 10 (smallest in right subtree) would become the new root.",
  "reasoning": "When deleting a node with two children in a BST, we replace it with either its in-order predecessor (largest value in left subtree) or in-order successor (smallest value in right subtree) to maintain BST properties.",
  "keyPoints": ["two children deletion", "in-order predecessor or successor", "BST properties maintained"],
  "minKeyPoints": 2
}`;
    },
    
    evaluate: async (exercise, userAnswer, openai) => {
      const prompt = `Evaluate this prediction answer.

SCENARIO: ${exercise.scenario}
QUESTION: ${exercise.question}
CORRECT PREDICTION: ${exercise.correctPrediction}
REASONING: ${exercise.reasoning}
KEY POINTS: ${exercise.keyPoints.join(', ')}

STUDENT'S ANSWER: ${userAnswer}

CRITERIA:
- Did they make a reasonable prediction?
- Did they explain their reasoning?
- Did they cover at least ${exercise.minKeyPoints} key points?
- Is their logic sound?

Return ONLY this JSON:
{
  "score": 0-100,
  "isCorrect": true or false (true if score >= 70),
  "feedback": "detailed feedback on their prediction and reasoning",
  "predictionAccuracy": "how close their prediction was to correct",
  "keyPointsCovered": ["points they mentioned"],
  "keyPointsMissed": ["points they missed"],
  "reasoningQuality": "assessment of their logical reasoning"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are an expert evaluator. Assess the quality of predictions and reasoning. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1,
        // response_format: { type: "json_object" } // Removed - might not be supported by gpt-5-nano
      });
      
      return JSON.parse(response.choices[0].message.content);
    }
  },
  
  // ============================================================================
  // 14. ERROR IDENTIFICATION & CORRECTION
  // ============================================================================
  
  error_identification: {
    name: "Error Identification",
    description: "Find and explain the error in a given solution",
    evaluationType: "gpt-assisted",
    
    schema: {
      type: "error_identification",
      question: String,           // Original problem
      incorrectSolution: String,  // Solution with errors
      errors: [{                  // List of errors
        type: String,             // Type of error
        location: String,         // Where it occurs
        explanation: String,      // What's wrong
        correction: String        // How to fix it
      }],
      correctSolution: String,    // The right answer
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate an error identification question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Present a problem and an INCORRECT solution
- The solution should contain 1-2 common mistakes students make
- Identify each error with its type, location, and explanation
- Provide the correct solution
- Errors should be subtle enough to require understanding, not just obvious typos

Return this EXACT JSON structure:
{
  "question": "the original problem",
  "incorrectSolution": "step-by-step solution with errors",
  "errors": [
    {
      "type": "conceptual error | calculation error | logical error | formula misapplication",
      "location": "where in the solution this occurs",
      "explanation": "what is wrong",
      "correction": "what should be done instead"
    }
  ],
  "correctSolution": "the correct solution"
}

EXAMPLE:
{
  "question": "Find the derivative of f(x) = x³ + 2x",
  "incorrectSolution": "f'(x) = 3x³ + 2",
  "errors": [
    {
      "type": "formula misapplication",
      "location": "first term",
      "explanation": "Applied power rule incorrectly - kept the exponent instead of reducing it by 1",
      "correction": "Power rule: d/dx[x³] = 3x², not 3x³"
    }
  ],
  "correctSolution": "f'(x) = 3x² + 2"
}`;
    },
    
    evaluate: async (exercise, userAnswer, openai) => {
      const prompt = `Evaluate this error identification answer.

ORIGINAL PROBLEM: ${exercise.question}
INCORRECT SOLUTION: ${exercise.incorrectSolution}

ACTUAL ERRORS:
${exercise.errors.map((err, i) => 
  `Error ${i + 1}: ${err.type} - ${err.explanation}`
).join('\n')}

CORRECT SOLUTION: ${exercise.correctSolution}

STUDENT'S ANSWER: ${userAnswer}

CRITERIA:
- Did they identify the error(s)?
- Did they explain what was wrong?
- Did they provide or suggest the correction?
- Do they understand the underlying concept?

Return ONLY this JSON:
{
  "score": 0-100,
  "isCorrect": true or false (true if score >= 70),
  "feedback": "detailed feedback on their error identification",
  "errorsFound": ["errors they correctly identified"],
  "errorsMissed": ["errors they didn't catch"],
  "explanationQuality": "assessment of how well they explained the errors"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are an expert evaluator. Assess if students can identify and explain errors. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1,
        // response_format: { type: "json_object" } // Removed - might not be supported by gpt-5-nano
      });
      
      return JSON.parse(response.choices[0].message.content);
    }
  },
  
  // ============================================================================
  // 15. MINI PROBLEM SET
  // ============================================================================
  
  mini_problem_set: {
    name: "Mini Problem Set",
    description: "3-5 quick related problems for rapid practice",
    evaluationType: "mixed", // Some auto, some GPT
    
    schema: {
      type: "mini_problem_set",
      instructions: String,       // Overall instructions
      problems: [{                // Array of 3-5 problems
        question: String,
        type: String,             // "numerical" | "short_answer" | "multiple_choice"
        correctAnswer: String,    // Or Number for numerical
        options: [String],        // Optional; required if type is "multiple_choice"
        explanation: String,
        points: Number            // Weight of this problem
      }],
      totalPoints: Number,
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswers: [String],
      score: Number,
      feedback: String,
      isCorrect: Boolean
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a mini problem set about "${topic}" for a ${assignmentType}.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Create 3-5 related problems that build on each other or test the same concept
- Mix problem types: numerical calculations, short conceptual questions, or quick MCQs
- For multiple_choice type, include an options array with 4 choices (A, B, C, D)
- Each problem should be solvable in 1-2 minutes
- Assign points based on difficulty (1-3 points per problem)
- Total should be 10 points

Return this EXACT JSON structure:
{
  "instructions": "overall instructions for the problem set",
  "problems": [
    {
      "question": "problem 1",
      "type": "numerical",
      "correctAnswer": 42,
      "explanation": "how to solve",
      "points": 2
    },
    {
      "question": "problem 2",
      "type": "short_answer",
      "correctAnswer": "brief answer",
      "explanation": "explanation",
      "points": 3
    },
    {
      "question": "problem 3",
      "type": "multiple_choice",
      "correctAnswer": "B",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "explanation": "why B",
      "points": 2
    }
  ],
  "totalPoints": 10
}

EXAMPLE (Calculus):
{
  "instructions": "Solve these related derivative problems. Show your work.",
  "problems": [
    {
      "question": "Find f'(x) if f(x) = x²",
      "type": "short_answer",
      "correctAnswer": "2x",
      "explanation": "Power rule: bring down exponent, reduce power by 1",
      "points": 2
    },
    {
      "question": "Find f'(x) if f(x) = 3x²",
      "type": "short_answer",
      "correctAnswer": "6x",
      "explanation": "Constant multiple rule: multiply derivative by constant",
      "points": 2
    },
    {
      "question": "What is f'(5) if f(x) = 3x²?",
      "type": "numerical",
      "correctAnswer": 30,
      "explanation": "f'(x) = 6x, so f'(5) = 6(5) = 30",
      "points": 3
    }
  ],
  "totalPoints": 7
}`;
    },
    
    evaluate: async (exercise, userAnswers, openai) => {
      const results = [];
      let totalScore = 0;
      
      for (let i = 0; i < exercise.problems.length; i++) {
        const problem = exercise.problems[i];
        const userAnswer = userAnswers[i];
        
        let problemResult;
        
        if (problem.type === "numerical") {
          // Auto-evaluate numerical
          const numAnswer = parseFloat(userAnswer);
          const correct = !isNaN(numAnswer) && Math.abs(numAnswer - problem.correctAnswer) <= 0.01;
          
          problemResult = {
            problemNumber: i + 1,
            isCorrect: correct,
            pointsEarned: correct ? problem.points : 0,
            feedback: correct 
              ? `Correct! ${problem.explanation}`
              : `Incorrect. Expected ${problem.correctAnswer}. ${problem.explanation}`
          };
          
        } else if (problem.type === "multiple_choice") {
          // Auto-evaluate MCQ
          const correct = userAnswer.trim().toUpperCase() === problem.correctAnswer.toUpperCase();
          
          problemResult = {
            problemNumber: i + 1,
            isCorrect: correct,
            pointsEarned: correct ? problem.points : 0,
            feedback: correct
              ? `Correct! ${problem.explanation}`
              : `Incorrect. Correct answer is ${problem.correctAnswer}. ${problem.explanation}`
          };
          
        } else {
          // Short answer - needs GPT
          const prompt = `Evaluate this short answer.

QUESTION: ${problem.question}
CORRECT ANSWER: ${problem.correctAnswer}
EXPLANATION: ${problem.explanation}
STUDENT'S ANSWER: ${userAnswer}
POINTS POSSIBLE: ${problem.points}

Return ONLY this JSON:
{
  "isCorrect": true or false,
  "pointsEarned": 0-${problem.points},
  "feedback": "brief feedback"
}`;

          const response = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
              {
                role: "system",
                content: "You are evaluating a single problem in a problem set. Be fair but accurate. Return ONLY valid JSON."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 1,
            // response_format: { type: "json_object" } // Removed - might not be supported by gpt-5-nano
          });
          
          problemResult = JSON.parse(response.choices[0].message.content);
          problemResult.problemNumber = i + 1;
        }
        
        results.push(problemResult);
        totalScore += problemResult.pointsEarned;
      }
      
      const percentScore = (totalScore / exercise.totalPoints) * 100;
      const isCorrect = percentScore >= 70;
      
      return {
        isCorrect: isCorrect,
        score: Math.round(percentScore),
        totalPointsEarned: totalScore,
        totalPointsPossible: exercise.totalPoints,
        feedback: `You scored ${totalScore}/${exercise.totalPoints} points (${Math.round(percentScore)}%)`,
        problemResults: results
      };
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a Tier 3 exercise using GPT-4
 */
export async function generateTier3Exercise(templateType, topic, difficulty, assignmentType, openai) {
  const template = TIER3_TEMPLATES[templateType];
  
  if (!template) {
    throw new Error(`Unknown Tier 3 template type: ${templateType}`);
  }
  
  const prompt = template.generatePrompt(topic, difficulty, assignmentType);
  
  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content: "You are an expert educational content creator specializing in advanced assessment. Return ONLY valid JSON matching the requested structure exactly."
      },
      {
        role: "user",
        content: prompt
      }
    ],
        temperature: 1,
    // response_format: { type: "json_object" } // Removed - might not be supported by gpt-5-nano
  });
  
  const generated = JSON.parse(response.choices[0].message.content);
  
  return {
    type: templateType,
    topic: topic,
    difficulty: difficulty,
    ...generated,
    userAnswer: null,
    isCorrect: null,
    feedback: null,
    score: null,
    createdAt: new Date()
  };
}

/**
 * Evaluate a Tier 3 exercise (all require GPT)
 */
export async function evaluateTier3Exercise(exercise, userResponse, openai) {
  const template = TIER3_TEMPLATES[exercise.type];
  
  if (!template) {
    throw new Error(`Unknown Tier 3 exercise type: ${exercise.type}`);
  }
  
  if (!openai) {
    throw new Error(`All Tier 3 exercises require OpenAI client for evaluation`);
  }
  
  // Route to appropriate evaluation function
  switch (exercise.type) {
    case 'scenario_application':
      return await template.evaluate(exercise, userResponse.answer, openai);
    
    case 'scenario_prediction':
      return await template.evaluate(exercise, userResponse.answer, openai);
    
    case 'error_identification':
      return await template.evaluate(exercise, userResponse.answer, openai);
    
    case 'mini_problem_set':
      return await template.evaluate(exercise, userResponse.answers, openai);
    
    default:
      throw new Error(`Evaluation not implemented for type: ${exercise.type}`);
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

EXAMPLE 1: Scenario Application

const scenario = await generateTier3Exercise(
  "scenario_application",
  "Database Optimization",
  4,
  "hybrid",
  openaiClient
);

await Exercise.create(scenario);

const evaluation = await evaluateTier3Exercise(
  scenario,
  { answer: "They should add indexing on user_id and implement Redis caching..." },
  openaiClient
);

// Returns:
{
  isCorrect: true,
  score: 85,
  feedback: "Good analysis! You identified key strategies...",
  conceptsIdentified: ["indexing", "caching"],
  keyPointsCovered: ["indexing", "caching layer", "scaling"],
  keyPointsMissed: ["query optimization"],
  misconceptions: []
}


EXAMPLE 2: Prediction Scenario

const prediction = await generateTier3Exercise(
  "scenario_prediction",
  "Binary Search Trees",
  3,
  "practical",
  openaiClient
);

const evaluation = await evaluateTier3Exercise(
  prediction,
  { answer: "The tree would restructure by promoting the in-order successor..." },
  openaiClient
);


EXAMPLE 3: Error Identification

const errorExercise = await generateTier3Exercise(
  "error_identification",
  "Calculus - Derivatives",
  3,
  "practical",
  openaiClient
);

const evaluation = await evaluateTier3Exercise(
  errorExercise,
  { answer: "The error is in applying the power rule - they kept x³ instead of reducing to x²" },
  openaiClient
);

// Returns:
{
  isCorrect: true,
  score: 90,
  feedback: "Excellent! You correctly identified the power rule error...",
  errorsFound: ["power rule misapplication"],
  errorsMissed: [],
  explanationQuality: "Clear and accurate explanation"
}


EXAMPLE 4: Mini Problem Set

const problemSet = await generateTier3Exercise(
  "mini_problem_set",
  "Linear Algebra",
  2,
  "practical",
  openaiClient
);

const evaluation = await evaluateTier3Exercise(
  problemSet,
  { answers: ["6", "18", "correct", "B", "invertible"] },
  openaiClient
);

// Returns:
{
  isCorrect: true,
  score: 90,
  totalPointsEarned: 9,
  totalPointsPossible: 10,
  feedback: "You scored 9/10 points (90%)",
  problemResults: [
    { problemNumber: 1, isCorrect: true, pointsEarned: 2, feedback: "Correct!" },
    { problemNumber: 2, isCorrect: true, pointsEarned: 2, feedback: "Correct!" },
    { problemNumber: 3, isCorrect: false, pointsEarned: 1, feedback: "Partially correct..." },
    { problemNumber: 4, isCorrect: true, pointsEarned: 2, feedback: "Correct!" },
    { problemNumber: 5, isCorrect: true, pointsEarned: 2, feedback: "Correct!" }
  ]
}

*/

export default TIER3_TEMPLATES;
