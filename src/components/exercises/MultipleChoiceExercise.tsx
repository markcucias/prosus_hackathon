import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MultipleChoiceExerciseProps {
  exercise: any;
  onSubmit: (answer: string) => Promise<void>;
  isSubmitting: boolean;
}

export function MultipleChoiceExercise({ exercise, onSubmit, isSubmitting }: MultipleChoiceExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const payload = exercise.payload;
  const answered = exercise.is_correct !== null;

  const handleSubmit = async () => {
    if (selectedAnswer) {
      await onSubmit(selectedAnswer);
    }
  };

  return (
    <Card className={answered ? (exercise.is_correct ? 'border-green-500' : 'border-red-500') : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{payload.topic || exercise.topic}</Badge>
            <Badge variant="secondary">Difficulty: {exercise.difficulty}/5</Badge>
          </div>
          {answered && (
            <div className="flex items-center gap-2">
              {exercise.is_correct ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        <CardTitle className="text-lg mt-4">{payload.question}</CardTitle>
        {answered && payload.explanation && (
          <CardDescription className="mt-2">
            <strong>Explanation:</strong> {payload.explanation}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!answered ? (
          <>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {payload.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={String.fromCharCode(65 + index)} // A, B, C, D
                      id={`option-${index}`}
                    />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full mt-6"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </>
        ) : (
          <div className="space-y-2 bg-muted p-4 rounded-md">
            <p><strong>Your Answer:</strong> {exercise.user_answer?.answer || 'No answer submitted'}</p>
            <p><strong>Correct Answer:</strong> {payload.correctAnswer}</p>
            {exercise.feedback && (
              <p className="text-sm mt-2">{exercise.feedback}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

