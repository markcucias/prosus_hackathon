import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ShortAnswerExerciseProps {
  exercise: any;
  onSubmit: (answer: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ShortAnswerExercise({ exercise, onSubmit, isSubmitting }: ShortAnswerExerciseProps) {
  const [answer, setAnswer] = useState('');
  const payload = exercise.payload;
  const answered = exercise.is_correct !== null;

  const handleSubmit = async () => {
    if (answer.trim()) {
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
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {payload.estimatedTime || 5} min
            </Badge>
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
        <CardTitle className="text-lg mt-4">{payload.question || payload.problem}</CardTitle>
        {payload.instructions && (
          <CardDescription className="mt-2">{payload.instructions}</CardDescription>
        )}
        {payload.conceptA && payload.conceptB && (
          <CardDescription className="mt-2">
            Compare: <strong>{payload.conceptA}</strong> vs <strong>{payload.conceptB}</strong>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!answered ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {payload.minKeyPoints && `Aim to cover at least ${payload.minKeyPoints} key points`}
                {payload.maxSentences && ` in ${payload.maxSentences} sentences or less`}
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 bg-muted p-4 rounded-md">
              <p><strong>Your Answer:</strong></p>
              <p className="whitespace-pre-wrap">{exercise.user_answer?.answer}</p>
            </div>
            
            {(payload.sampleAnswer || payload.correctMethod || payload.correctAnswer) && (
              <div className="space-y-2 bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                <p><strong>{payload.correctMethod ? 'Correct Method:' : 'Sample Answer:'}</strong></p>
                <p className="whitespace-pre-wrap">{payload.sampleAnswer || payload.correctMethod || payload.correctAnswer}</p>
                {payload.reasoning && (
                  <>
                    <p className="mt-2"><strong>Reasoning:</strong></p>
                    <p className="whitespace-pre-wrap">{payload.reasoning}</p>
                  </>
                )}
              </div>
            )}

            {exercise.feedback && (
              <div className="space-y-2 bg-muted p-4 rounded-md">
                <p><strong>Feedback:</strong></p>
                <p className="whitespace-pre-wrap">{exercise.feedback}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

