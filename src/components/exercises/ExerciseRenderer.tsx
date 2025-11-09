import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { NumericalExercise } from './NumericalExercise';
import { ShortAnswerExercise } from './ShortAnswerExercise';
import { TrueFalseExercise } from './TrueFalseExercise';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ExerciseRendererProps {
  exercise: any;
  onSubmit: (answer: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ExerciseRenderer({ exercise, onSubmit, isSubmitting }: ExerciseRendererProps) {
  const handleSubmit = async (answer: any) => {
    // Wrap answer in appropriate format
    const response = { answer };
    await onSubmit(response);
  };

  // Route to appropriate component based on exercise type
  switch (exercise.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceExercise
          exercise={exercise}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );

    case 'numerical_problem':
      return (
        <NumericalExercise
          exercise={exercise}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );

    case 'short_answer_define':
    case 'short_answer_explain':
    case 'short_answer_compare':
    case 'one_sentence_definition':
    case 'scenario_application':
    case 'scenario_prediction':
    case 'error_identification':
    case 'concept_comparison':
    case 'problem_type_recognition':
      return (
        <ShortAnswerExercise
          exercise={exercise}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );

    case 'true_false_justify':
      return (
        <TrueFalseExercise
          exercise={exercise}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );

    case 'fill_in_blank':
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <p>Fill in the blank exercise component coming soon!</p>
            </div>
          </CardContent>
        </Card>
      );

    case 'mini_problem_set':
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <p>Mini problem set component coming soon!</p>
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Unknown exercise type: {exercise.type}</p>
            </div>
          </CardContent>
        </Card>
      );
  }
}

