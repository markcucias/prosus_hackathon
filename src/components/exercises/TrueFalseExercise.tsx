import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle } from 'lucide-react';

interface TrueFalseExerciseProps {
  exercise: any;
  onSubmit: (answer: { choice: boolean; justification: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function TrueFalseExercise({ exercise, onSubmit, isSubmitting }: TrueFalseExerciseProps) {
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [justification, setJustification] = useState('');
  const payload = exercise.payload;
  const answered = exercise.is_correct !== null;

  const handleSubmit = async () => {
    if (selectedChoice && justification.trim()) {
      await onSubmit({
        choice: selectedChoice === 'true',
        justification: justification.trim()
      });
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
        <CardTitle className="text-lg mt-4">True or False?</CardTitle>
        <CardDescription className="mt-2 text-base font-normal">
          {payload.statement}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!answered ? (
          <>
            <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice}>
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true-option" />
                  <Label htmlFor="true-option" className="cursor-pointer flex-1">
                    <span className="font-semibold">True</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false-option" />
                  <Label htmlFor="false-option" className="cursor-pointer flex-1">
                    <span className="font-semibold">False</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <div className="mt-4">
              <Label htmlFor="justification" className="text-sm font-medium mb-2 block">
                Justify your answer:
              </Label>
              <Textarea
                id="justification"
                placeholder="Explain why you chose this answer..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Provide a brief explanation (2-3 sentences)
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedChoice || !justification.trim() || isSubmitting}
              className="w-full mt-6"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p><strong>Your Answer:</strong> {exercise.user_answer?.answer?.choice ? 'True' : 'False'}</p>
              <p><strong>Your Justification:</strong> {exercise.user_answer?.answer?.justification || 'No justification provided'}</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-md space-y-2">
              <p><strong>Correct Answer:</strong> {payload.correctAnswer ? 'True' : 'False'}</p>
              <p><strong>Explanation:</strong> {payload.justification || payload.explanation || 'No explanation provided'}</p>
            </div>
            {exercise.feedback && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <p className="text-sm"><strong>AI Feedback:</strong> {exercise.feedback}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
