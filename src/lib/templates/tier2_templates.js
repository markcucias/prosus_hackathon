// src/lib/templates/tier2_templates.js

/**
 * TIER 2 - VARIETY TEMPLATES
 * These 6 templates add depth and prevent repetition over multi-day prep.
 * Priority: Build after Tier 1 is working (4 hours)
 * Evaluation: Mix of keyword-based and GPT-assisted
 */

export const TIER2_TEMPLATES = {
  
  // ============================================================================
  // 6. SHORT ANSWER - VARIANT A: DEFINE
  // ============================================================================
  
  short_answer_define: {
    name: "Short Answer - Define",
    description: "Define a term or concept in 1-2 sentences",
    evaluationType: "semi-automatic", // Keyword checking first, GPT if needed
    
    schema: {
      type: "short_answer_define",
      question: String,           // "Define recursion in computer science"
      keyPoints: [String],        // ["function", "calls itself", "base case"]
      sampleAnswer: String,       // Example of good answer
      minKeyPoints: Number,       // Must include at least N key points
      maxSentences: Number,       // Usually 1-2
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a definition question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Ask student to define a specific term or concept related to the topic
- Identify 3-4 key points that MUST be in a complete definition
- Provide a sample answer that's 1-2 sentences and includes all key points
- Set minKeyPoints to 2 (student must cover at least 2 of the key points)

Return this EXACT JSON structure:
{
  "question": "Define [term/concept]",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "sampleAnswer": "sample 1-2 sentence definition",
  "minKeyPoints": 2,
  "maxSentences": 2
}`;
    },
    
    evaluate: (exercise, userAnswer) => {
      const answerLower = userAnswer.toLowerCase();
      
      // Count key points covered
      const keywordsFound = exercise.keyPoints.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      const keyPointsCovered = keywordsFound.length;
      const percentCovered = keyPointsCovered / exercise.keyPoints.length;
      
      // Check sentence count
      const sentenceCount = (userAnswer.match(/[.!?]+/g) || []).length;
      const tooLong = sentenceCount > exercise.maxSentences + 1;
      
      let isCorrect = keyPointsCovered >= exercise.minKeyPoints;
      let score = Math.round(percentCovered * 100);
      
      let feedback;
      if (isCorrect && !tooLong) {
        feedback = `Good definition! You covered ${keyPointsCovered}/${exercise.keyPoints.length} key points.`;
      } else if (isCorrect && tooLong) {
        score = Math.max(70, score - 10);
        feedback = `Your definition is correct but could be more concise. Aim for ${exercise.maxSentences} sentences.`;
      } else {
        isCorrect = false;
        feedback = `Your definition is incomplete. Make sure to mention: ${exercise.keyPoints.join(', ')}. Sample answer: ${exercise.sampleAnswer}`;
      }
      
      return {
        isCorrect: isCorrect,
        score: score,
        feedback: feedback,
        keyPointsCovered: keywordsFound,
        keyPointsMissed: exercise.keyPoints.filter(k => !keywordsFound.includes(k)),
        sampleAnswer: exercise.sampleAnswer
      };
    }
  },
  
  // ============================================================================
  // 7. SHORT ANSWER - VARIANT B: EXPLAIN
  // ============================================================================
  
  short_answer_explain: {
    name: "Short Answer - Explain",
    description: "Explain a concept or process in 3-4 sentences",
    evaluationType: "gpt-assisted", // More nuanced, needs GPT
    
    schema: {
      type: "short_answer_explain",
      question: String,           // "Explain how binary search works"
      keyPoints: [String],        // Points that should be covered
      sampleAnswer: String,       // Example of good answer
      minKeyPoints: Number,       // At least N points
      maxSentences: Number,       // Usually 3-4
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate an explanation question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Ask student to explain HOW something works or WHY something happens
- Identify 3-5 key points that should be in a complete explanation
- Provide a sample answer that's 3-4 sentences
- Set minKeyPoints to 2-3 (depending on complexity)

Return this EXACT JSON structure:
{
  "question": "Explain how [process] works" or "Explain why [phenomenon] occurs",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "sampleAnswer": "sample 3-4 sentence explanation",
  "minKeyPoints": 3,
  "maxSentences": 4
}`;
    },
    
    evaluate: async (exercise, userAnswer, openai) => {
      // First try keyword checking
      const answerLower = userAnswer.toLowerCase();
      const keywordsFound = exercise.keyPoints.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      const keyPointsCovered = keywordsFound.length;
      
      // If clearly insufficient, don't waste GPT call
      if (keyPointsCovered < exercise.minKeyPoints - 1) {
        return {
          isCorrect: false,
          score: Math.round((keyPointsCovered / exercise.keyPoints.length) * 60),
          feedback: `Your explanation is incomplete. Make sure to cover: ${exercise.keyPoints.join(', ')}. Sample answer: ${exercise.sampleAnswer}`,
          keyPointsCovered: keywordsFound,
          keyPointsMissed: exercise.keyPoints.filter(k => !keywordsFound.includes(k))
        };
      }
      
      // Use GPT for nuanced evaluation
      const prompt = `Evaluate this student's explanation.

QUESTION: ${exercise.question}
KEY POINTS TO COVER: ${exercise.keyPoints.join(', ')}
SAMPLE CORRECT ANSWER: ${exercise.sampleAnswer}
STUDENT'S ANSWER: ${userAnswer}

CRITERIA:
- Does it cover at least ${exercise.minKeyPoints} of the key points?
- Is the explanation accurate and clear?
- Are there any significant errors or misconceptions?

Return ONLY this JSON:
{
  "score": 0-100,
  "isCorrect": true or false (true if score >= 70),
  "feedback": "2-3 sentence feedback on what was good and what could be improved",
  "coveredPoints": ["points they mentioned"],
  "missedPoints": ["points they didn't cover"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are a fair educational evaluator. Be encouraging but accurate. Return ONLY valid JSON."
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
  // 8. SHORT ANSWER - VARIANT C: COMPARE
  // ============================================================================
  
  short_answer_compare: {
    name: "Short Answer - Compare",
    description: "Compare and contrast two concepts",
    evaluationType: "gpt-assisted",
    
    schema: {
      type: "short_answer_compare",
      question: String,           // "Compare mitosis and meiosis"
      conceptA: String,           // "mitosis"
      conceptB: String,           // "meiosis"
      aspects: [String],          // ["number of divisions", "daughter cells", "genetic variation"]
      correctComparisons: Object, // Expected differences
      minAspects: Number,         // Must compare at least N aspects
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a comparison question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Ask student to compare and contrast two related concepts
- Identify 3-4 key aspects that should be compared
- For each aspect, provide the correct comparison
- Set minAspects to 2 (must compare at least 2 aspects)

Return this EXACT JSON structure:
{
  "question": "Compare [concept A] and [concept B]",
  "conceptA": "first concept",
  "conceptB": "second concept",
  "aspects": ["aspect 1", "aspect 2", "aspect 3"],
  "correctComparisons": {
    "aspect 1": "how they differ on aspect 1",
    "aspect 2": "how they differ on aspect 2",
    "aspect 3": "how they differ on aspect 3"
  },
  "minAspects": 2
}

EXAMPLE:
{
  "question": "Compare mitosis and meiosis",
  "conceptA": "mitosis",
  "conceptB": "meiosis",
  "aspects": ["number of divisions", "daughter cells", "genetic variation"],
  "correctComparisons": {
    "number of divisions": "mitosis has 1 division, meiosis has 2",
    "daughter cells": "mitosis produces 2, meiosis produces 4",
    "genetic variation": "mitosis produces identical cells, meiosis produces varied cells"
  },
  "minAspects": 2
}`;
    },
    
    evaluate: async (exercise, userAnswer, openai) => {
      const prompt = `Evaluate this comparison answer.

QUESTION: ${exercise.question}
ASPECTS TO COMPARE: ${exercise.aspects.join(', ')}
CORRECT COMPARISONS:
${Object.entries(exercise.correctComparisons).map(([aspect, comparison]) => 
  `- ${aspect}: ${comparison}`
).join('\n')}

STUDENT'S ANSWER: ${userAnswer}

CRITERIA:
- Did they compare at least ${exercise.minAspects} aspects?
- Are the comparisons accurate?
- Did they note both similarities AND differences?

Return ONLY this JSON:
{
  "score": 0-100,
  "isCorrect": true or false (true if score >= 70),
  "feedback": "specific feedback on their comparison",
  "aspectsCovered": ["aspects they compared"],
  "aspectsMissed": ["aspects they didn't compare"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are an expert evaluator. Assess the quality and accuracy of comparisons. Return ONLY valid JSON."
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
  // 9. ONE-SENTENCE DEFINITION (QUIZ VERSION)
  // ============================================================================
  
  one_sentence_definition: {
    name: "One-Sentence Definition",
    description: "Quick definition in exactly one sentence - for quizzes",
    evaluationType: "semi-automatic",
    
    schema: {
      type: "one_sentence_definition",
      term: String,               // "Polymorphism"
      sampleDefinition: String,   // "The ability of objects to take multiple forms"
      keyPoints: [String],        // ["multiple forms", "objects", "same interface"]
      minKeyPoints: Number,       // Usually 2
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a one-sentence definition question about "${topic}" for a ${assignmentType}.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Choose an important term/concept from the topic
- Provide a concise one-sentence definition
- Identify 2-3 key points that must be in the definition
- This is for quick recall, so keep it simple

Return this EXACT JSON structure:
{
  "term": "the term to define",
  "sampleDefinition": "one sentence definition",
  "keyPoints": ["key point 1", "key point 2"],
  "minKeyPoints": 2
}`;
    },
    
    evaluate: (exercise, userAnswer) => {
      const answerLower = userAnswer.toLowerCase();
      
      // Check for key points
      const keywordsFound = exercise.keyPoints.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      const keyPointsCovered = keywordsFound.length;
      const isCorrect = keyPointsCovered >= exercise.minKeyPoints;
      const score = Math.round((keyPointsCovered / exercise.keyPoints.length) * 100);
      
      // Check sentence count (should be 1)
      const sentenceCount = (userAnswer.match(/[.!?]+/g) || []).length;
      
      let feedback;
      if (isCorrect && sentenceCount <= 1) {
        feedback = `Good! You covered the key points: ${keywordsFound.join(', ')}.`;
      } else if (isCorrect && sentenceCount > 1) {
        feedback = `Correct, but try to be more concise - aim for one sentence.`;
      } else {
        feedback = `Incomplete definition. Make sure to mention: ${exercise.keyPoints.join(', ')}. Example: ${exercise.sampleDefinition}`;
      }
      
      return {
        isCorrect: isCorrect,
        score: isCorrect ? score : Math.max(score, 40),
        feedback: feedback,
        keyPointsCovered: keywordsFound,
        keyPointsMissed: exercise.keyPoints.filter(k => !keywordsFound.includes(k)),
        sampleDefinition: exercise.sampleDefinition
      };
    }
  },
  
  // ============================================================================
  // 10. PROBLEM TYPE RECOGNITION
  // ============================================================================
  
  problem_type_recognition: {
    name: "Problem Type Recognition",
    description: "Identify which method/formula to use for a given problem",
    evaluationType: "automatic",
    
    schema: {
      type: "problem_type_recognition",
      problem: String,            // "Find the derivative of f(x) = x² + 3x"
      correctMethod: String,      // "Power Rule"
      alternatives: [String],     // ["Chain Rule", "Product Rule", "Quotient Rule"]
      explanation: String,        // Why this method is correct
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a problem type recognition question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Present a problem that could be solved multiple ways (but one is most appropriate)
- Identify the correct method/approach
- Provide 3-4 plausible alternative methods
- Explain why the correct method is best

Return this EXACT JSON structure:
{
  "problem": "the problem statement",
  "correctMethod": "the best method to use",
  "alternatives": ["alternative 1", "alternative 2", "alternative 3"],
  "explanation": "why this method is most appropriate"
}

EXAMPLE:
{
  "problem": "Find the derivative of f(x) = x² + 3x",
  "correctMethod": "Power Rule",
  "alternatives": ["Chain Rule", "Product Rule", "Quotient Rule"],
  "explanation": "This is a simple polynomial, so we use the Power Rule"
}`;
    },
    
    evaluate: (exercise, userAnswer) => {
      const answerNormalized = userAnswer.trim().toLowerCase();
      const correctNormalized = exercise.correctMethod.toLowerCase();
      
      const isCorrect = answerNormalized === correctNormalized ||
                       answerNormalized.includes(correctNormalized) ||
                       correctNormalized.includes(answerNormalized);
      
      return {
        isCorrect: isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: isCorrect
          ? `Correct! ${exercise.explanation}`
          : `Incorrect. The best method is "${exercise.correctMethod}". ${exercise.explanation}`,
        correctMethod: exercise.correctMethod,
        alternatives: exercise.alternatives
      };
    }
  },
  
  // ============================================================================
  // 11. CONCEPT COMPARISON
  // ============================================================================
  
  concept_comparison: {
    name: "Concept Comparison",
    description: "Compare two concepts on specific dimensions",
    evaluationType: "gpt-assisted",
    
    schema: {
      type: "concept_comparison",
      question: String,           // "Compare arrays and linked lists in terms of access time and memory"
      conceptA: String,
      conceptB: String,
      dimensions: [String],       // ["access time", "memory usage", "insertion"]
      correctComparisons: Object,
      minDimensions: Number,
      topic: String,
      difficulty: Number,
      // User interaction
      userAnswer: String,
      isCorrect: Boolean,
      feedback: String,
      score: Number
    },
    
    generatePrompt: (topic, difficulty, assignmentType) => {
      return `Generate a concept comparison question about "${topic}" for a ${assignmentType} exam.

DIFFICULTY: ${difficulty}/5

INSTRUCTIONS:
- Choose two related concepts to compare
- Specify 2-4 dimensions of comparison (e.g., efficiency, complexity, use cases)
- Provide correct comparisons for each dimension
- Set minDimensions to 2

Return this EXACT JSON structure:
{
  "question": "Compare [A] and [B] in terms of [dimension 1] and [dimension 2]",
  "conceptA": "first concept",
  "conceptB": "second concept",
  "dimensions": ["dimension 1", "dimension 2", "dimension 3"],
  "correctComparisons": {
    "dimension 1": "comparison for dimension 1",
    "dimension 2": "comparison for dimension 2",
    "dimension 3": "comparison for dimension 3"
  },
  "minDimensions": 2
}

EXAMPLE:
{
  "question": "Compare bubble sort and merge sort in terms of time complexity and stability",
  "conceptA": "bubble sort",
  "conceptB": "merge sort",
  "dimensions": ["time complexity", "space complexity", "stability"],
  "correctComparisons": {
    "time complexity": "bubble sort is O(n²), merge sort is O(n log n)",
    "space complexity": "bubble sort is O(1), merge sort is O(n)",
    "stability": "both are stable sorting algorithms"
  },
  "minDimensions": 2
}`;
    },
    
    evaluate: async (exercise, userAnswer, openai) => {
      const prompt = `Evaluate this concept comparison.

QUESTION: ${exercise.question}
CONCEPTS: ${exercise.conceptA} vs ${exercise.conceptB}
DIMENSIONS TO COMPARE: ${exercise.dimensions.join(', ')}

CORRECT COMPARISONS:
${Object.entries(exercise.correctComparisons).map(([dim, comp]) => 
  `- ${dim}: ${comp}`
).join('\n')}

STUDENT'S ANSWER: ${userAnswer}

CRITERIA:
- Did they compare at least ${exercise.minDimensions} dimensions?
- Are the comparisons accurate?
- Did they highlight the key differences?

Return ONLY this JSON:
{
  "score": 0-100,
  "isCorrect": true or false (true if score >= 70),
  "feedback": "detailed feedback on their comparison",
  "dimensionsCovered": ["dimensions they compared"],
  "dimensionsMissed": ["dimensions they didn't mention"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are an expert evaluator of technical comparisons. Return ONLY valid JSON."
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
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a Tier 2 exercise using GPT-4
 */
export async function generateTier2Exercise(templateType, topic, difficulty, assignmentType, openai) {
  const template = TIER2_TEMPLATES[templateType];
  
  if (!template) {
    throw new Error(`Unknown Tier 2 template type: ${templateType}`);
  }
  
  const prompt = template.generatePrompt(topic, difficulty, assignmentType);
  
  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content: "You are an expert educational content creator. Return ONLY valid JSON matching the requested structure exactly."
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
    createdAt: new Date()
  };
}

/**
 * Evaluate a Tier 2 exercise
 */
export async function evaluateTier2Exercise(exercise, userResponse, openai = null) {
  const template = TIER2_TEMPLATES[exercise.type];
  
  if (!template) {
    throw new Error(`Unknown Tier 2 exercise type: ${exercise.type}`);
  }
  
  // Check if GPT is required for this template
  const requiresGPT = ['short_answer_explain', 'short_answer_compare', 'concept_comparison'].includes(exercise.type);
  
  if (requiresGPT && !openai) {
    throw new Error(`Exercise type ${exercise.type} requires OpenAI client for evaluation`);
  }
  
  // Route to appropriate evaluation function
  switch (exercise.type) {
    case 'short_answer_define':
      return template.evaluate(exercise, userResponse.answer);
    
    case 'short_answer_explain':
      return await template.evaluate(exercise, userResponse.answer, openai);
    
    case 'short_answer_compare':
      return await template.evaluate(exercise, userResponse.answer, openai);
    
    case 'one_sentence_definition':
      return template.evaluate(exercise, userResponse.answer);
    
    case 'problem_type_recognition':
      return template.evaluate(exercise, userResponse.answer);
    
    case 'concept_comparison':
      return await template.evaluate(exercise, userResponse.answer, openai);
    
    default:
      throw new Error(`Evaluation not implemented for type: ${exercise.type}`);
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

EXAMPLE 1: Generate a "define" question

const exercise = await generateTier2Exercise(
  "short_answer_define",
  "Recursion",
  2,
  "practical",
  openaiClient
);

await Exercise.create(exercise);


EXAMPLE 2: Evaluate a definition (keyword-based, no GPT)

const evaluation = await evaluateTier2Exercise(
  exercise,
  { answer: "Recursion is when a function calls itself with a base case to stop." }
);

// Returns:
{
  isCorrect: true,
  score: 100,
  feedback: "Good! You covered the key points: function, calls itself, base case",
  keyPointsCovered: ["function", "calls itself", "base case"],
  keyPointsMissed: []
}


EXAMPLE 3: Evaluate an explanation (GPT-assisted)

const explainExercise = await generateTier2Exercise(
  "short_answer_explain",
  "Binary Search",
  3,
  "hybrid",
  openaiClient
);

const evaluation = await evaluateTier2Exercise(
  explainExercise,
  { answer: "Binary search works by repeatedly dividing the search space in half..." },
  openaiClient // GPT required for this type
);


EXAMPLE 4: Problem type recognition

const recognition = await generateTier2Exercise(
  "problem_type_recognition",
  "Calculus",
  2,
  "practical",
  openaiClient
);

const evaluation = await evaluateTier2Exercise(
  recognition,
  { answer: "Power Rule" }
);


EXAMPLE 5: Concept comparison (GPT-assisted)

const comparison = await generateTier2Exercise(
  "concept_comparison",
  "Data Structures",
  4,
  "hybrid",
  openaiClient
);

const evaluation = await evaluateTier2Exercise(
  comparison,
  { answer: "Arrays have O(1) access but O(n) insertion, while linked lists..." },
  openaiClient
);

*/

export default TIER2_TEMPLATES;
