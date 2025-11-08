import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function NewAssignment() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "exam" as "exam" | "essay" | "presentation" | "quiz",
    exam_subtype: "hybrid" as "theoretical" | "practical" | "hybrid" | "quiz",
    due_at: "",
    topics: "",
    sessionDuration: "60",
    preferredTime: "evening",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from("assignments")
        .insert({
          user_id: user.id,
          title: formData.title,
          type: formData.type,
          exam_subtype: formData.exam_subtype,
          due_at: formData.due_at,
          topics: formData.topics.split(",").map((t) => t.trim()).filter(Boolean),
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Generate study plan (simple: one session per day until due date)
      const dueDate = new Date(formData.due_at);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const sessionCount = Math.min(Math.max(1, daysUntilDue), 7); // Max 7 sessions

      const sessions = [];
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = new Date(today);
        sessionDate.setDate(sessionDate.getDate() + i + 1);
        
        // Set time based on preference
        const hour = formData.preferredTime === "morning" ? 9 : formData.preferredTime === "afternoon" ? 14 : 19;
        sessionDate.setHours(hour, 0, 0, 0);

        const focus = i < sessionCount / 2 ? "concepts" : i < (sessionCount * 0.75) ? "practice" : "review";

        sessions.push({
          user_id: user.id,
          assignment_id: assignment.id,
          scheduled_at: sessionDate.toISOString(),
          duration_min: parseInt(formData.sessionDuration),
          topics: formData.topics.split(",").map((t) => t.trim()).filter(Boolean),
          focus,
        });
      }

      const { error: sessionsError } = await supabase.from("study_sessions").insert(sessions);
      if (sessionsError) throw sessionsError;

      toast.success(`Created ${assignment.title} with ${sessions.length} study sessions!`);
      navigate(`/assignments/${assignment.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Assignment</CardTitle>
            <CardDescription>
              Add a new exam, essay, or project and we'll create a personalized study plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="Machine Learning Final Exam"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === "exam" && (
                  <div className="space-y-2">
                    <Label htmlFor="exam_subtype">Exam Format</Label>
                    <Select
                      value={formData.exam_subtype}
                      onValueChange={(value: any) => setFormData({ ...formData, exam_subtype: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theoretical">Theoretical</SelectItem>
                        <SelectItem value="practical">Practical</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="quiz">Quiz-style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="due_at">Due Date & Time</Label>
                  <Input
                    id="due_at"
                    type="datetime-local"
                    value={formData.due_at}
                    onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics">Topics (comma-separated)</Label>
                <Input
                  id="topics"
                  placeholder="Neural Networks, SVMs, Decision Trees"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Separate multiple topics with commas
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
                  <Select
                    value={formData.sessionDuration}
                    onValueChange={(value) => setFormData({ ...formData, sessionDuration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Study Time</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9 AM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (2 PM)</SelectItem>
                      <SelectItem value="evening">Evening (7 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment & Study Plan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
