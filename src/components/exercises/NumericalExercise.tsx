import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface NumericalExerciseProps {
  exercise: any;
  onSubmit: (answer: string) => Promise<void>;
  isSubmitting: boolean;
}

export function NumericalExercise({ exercise, onSubmit, isSubmitting }: NumericalExerciseProps) {
  const [answer, setAnswer] = useState('');
  const payload = exercise.payload;
  const answered = exercise.is_correct !== null;

  const handleSubmit = async () => {
    if (answer) {
      await onSubmit(answer);
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
      </CardHeader>
      <CardContent>
        {!answered ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer {payload.units && `(${payload.units})`}</Label>
              <Input
                id="answer"
                type="number"
                step="any"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!answer || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2 bg-muted p-4 rounded-md">
            <p><strong>Your Answer:</strong> {exercise.user_answer?.answer} {payload.units}</p>
            <p><strong>Correct Answer:</strong> {payload.correctAnswer} {payload.units}</p>
            {exercise.feedback && (
              <p className="text-sm mt-2 whitespace-pre-line">{exercise.feedback}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

