import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { sessionService } from "@/lib/services/sessionService";
import { exerciseService } from "@/lib/services/exerciseService";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadSessionAndExercises();
  }, [id]);

  const loadSessionAndExercises = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("study_sessions")
        .select("*, assignments(*)")
        .eq("id", id)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .eq("session_id", id)
        .order("created_at", { ascending: true });

      if (exercisesError) throw exercisesError;
      
      if (exercisesData && exercisesData.length > 0) {
        setExercises(exercisesData);
      }
    } catch (error: any) {
      toast.error("Failed to load session");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const generateExercises = async () => {
    if (!id) return;
    
    setGenerating(true);
    try {
      toast.info("Generating personalized exercises...");
      console.log("Starting exercise generation for session:", id);
      
      const result = await sessionService.generateExercisesForSession(id);
      console.log("Generation result:", result);
      
      await loadSessionAndExercises();
      console.log("Exercises loaded, count:", exercises.length);
      
      toast.success(`Exercises generated! ${result?.length || 0} questions ready.`);
    } catch (error: any) {
      console.error("Exercise generation error:", error);
      toast.error(error.message || "Failed to generate exercises. Check console for details.");
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async (exerciseId: string, userResponse: any) => {
    setSubmittingId(exerciseId);
    try {
      const result = await exerciseService.submitAnswer(exerciseId, userResponse);
      
      // Update the exercise in state
      setExercises(prev =>
        prev.map(ex =>
          ex.id === exerciseId
            ? { ...ex, ...result.exercise }
            : ex
        )
      );

      if (result.evaluation.isCorrect) {
        toast.success("Correct! Great job! 🎉");
      } else {
        toast.info("Not quite right. Check the feedback below.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit answer");
    } finally {
      setSubmittingId(null);
    }
  };

  const completeSession = async () => {
    if (!id) return;
    try {
      await sessionService.complete(id);
      toast.success("Session completed! Great work! 🎓");
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to complete session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const answeredCount = exercises.filter(ex => ex.is_correct !== null).length;
  const progressPercent = exercises.length > 0 ? (answeredCount / exercises.length) * 100 : 0;
  const allCompleted = exercises.length > 0 && answeredCount === exercises.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Session Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Study Session</CardTitle>
                <CardDescription className="mt-2">
                  {session.assignments?.title} • {session.focus} focus
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {session.duration_min} min
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {session.topics.map((topic: string) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
              
              {exercises.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{answeredCount} / {exercises.length} completed</span>
                  </div>
                  <Progress value={progressPercent} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        {exercises.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
              <p className="text-muted-foreground mb-6">
                Generate personalized exercises tailored to your learning needs
              </p>
              <Button onClick={generateExercises} disabled={generating} size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                {generating ? "Generating..." : "Generate Exercises"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {exercises.map((exercise, index) => (
              <div key={exercise.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Question {index + 1} of {exercises.length}
                  </span>
                </div>
                <ExerciseRenderer
                  exercise={exercise}
                  onSubmit={(response) => submitAnswer(exercise.id, response)}
                  isSubmitting={submittingId === exercise.id}
                />
              </div>
            ))}

            {/* Complete Session Button */}
            {allCompleted && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                <CardContent className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">All Exercises Completed!</h3>
                  <p className="text-muted-foreground mb-6">
                    Great job! You've completed all exercises in this session.
                  </p>
                  <Button onClick={completeSession} size="lg">
                    Complete Session & Return Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
