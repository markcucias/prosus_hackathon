import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Clock, BookOpen, Upload, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
  type: string;
  exam_subtype: string;
  due_at: string;
  topics: string[];
  status: string;
  materials_uploaded: boolean;
  notification_sent: boolean;
}

interface StudySession {
  id: string;
  scheduled_at: string;
  topics: string[];
  focus: string;
  duration_min: number;
  status: string;
}

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, [id]);

  const checkAuthAndLoad = async () => {
    // Check if user is authenticated first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please log in to view this assignment");
      navigate("/auth");
      return;
    }

    if (id) await loadAssignment();
  };

  const loadAssignment = async () => {
    try {
      const [assignmentRes, sessionsRes] = await Promise.all([
        supabase.from("assignments").select("*").eq("id", id).single(),
        supabase.from("study_sessions").select("*").eq("assignment_id", id).order("scheduled_at"),
      ]);

      if (assignmentRes.error) {
        console.error("Assignment load error:", assignmentRes.error);
        if (assignmentRes.error.code === 'PGRST116') {
          toast.error("Assignment not found");
        } else if (assignmentRes.error.message.includes('policy')) {
          toast.error("Access denied - please check your permissions");
        } else {
          toast.error(`Failed to load assignment: ${assignmentRes.error.message}`);
        }
        navigate("/");
        return;
      }

      if (sessionsRes.error) {
        console.error("Sessions load error:", sessionsRes.error);
        // Sessions might not exist yet, so just log warning but don't fail
        console.warn("Could not load study sessions:", sessionsRes.error.message);
      }

      setAssignment(assignmentRes.data);
      setSessions(sessionsRes.data || []);
    } catch (error: any) {
      console.error("Unexpected error loading assignment:", error);
      toast.error("Failed to load assignment");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterials = async () => {
    if (!materials.trim()) {
      toast.error("Please enter some study materials or instructions");
      return;
    }

    setUploading(true);
    try {
      // Update assignment to mark materials as uploaded
      const { error } = await supabase
        .from("assignments")
        .update({
          materials_uploaded: true,
          materials_uploaded_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Materials saved! You can now create your study plan.");

      // Update local state
      if (assignment) {
        setAssignment({
          ...assignment,
          materials_uploaded: true,
        });
      }
    } catch (error: any) {
      console.error("Error uploading materials:", error);
      toast.error("Failed to save materials");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStudyPlan = async () => {
    setCreatingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to create a study plan");
        return;
      }

      // Call backend API to create study sessions
      const response = await fetch(`http://localhost:5001/api/assignments/${id}/create-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create study plan");
      }

      toast.success(`Created ${data.sessions_created} study sessions!`);

      // Reload assignment and sessions
      await loadAssignment();
    } catch (error: any) {
      console.error("Error creating study plan:", error);
      toast.error(error.message || "Failed to create study plan");
    } finally {
      setCreatingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {assignment.type} / {assignment.exam_subtype}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(assignment.due_at).toLocaleString()}
                  </span>
                </CardDescription>
              </div>
              <Badge>{assignment.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium mb-2">Topics Covered:</h4>
              <div className="flex flex-wrap gap-2">
                {assignment.topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Upload Section */}
        {!assignment.materials_uploaded && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <CardTitle>Upload Study Materials</CardTitle>
              </div>
              <CardDescription>
                Add your lecture notes, slides, or any materials you'll use to prepare. The AI will use this to create personalized study sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="materials" className="text-sm font-medium mb-2 block">
                  Study Materials or Instructions
                </label>
                <Textarea
                  id="materials"
                  placeholder="Paste your lecture notes, key topics, formulas, or any instructions here...

Examples:
- Main topics: Neural Networks, Backpropagation, CNN
- Focus on practical applications
- Review chapter 3-5 from textbook
- Practice coding exercises"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleUploadMaterials}
                disabled={uploading || !materials.trim()}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save Materials
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Materials Uploaded - Create Study Plan */}
        {assignment.materials_uploaded && sessions.length === 0 && (
          <Card className="mb-6 border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle>Materials Uploaded!</CardTitle>
              </div>
              <CardDescription>
                Ready to create your personalized study plan? Click below to generate AI-powered study sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateStudyPlan}
                disabled={creatingPlan}
                className="w-full"
                size="lg"
              >
                {creatingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Study Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create AI Study Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Study Plan</CardTitle>
            <CardDescription>
              {sessions.length > 0
                ? `${sessions.length} sessions scheduled to help you prepare`
                : assignment.materials_uploaded
                ? "Click 'Create AI Study Plan' to generate sessions"
                : "Upload materials first to generate your study plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No study sessions yet</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const isPast = new Date(session.scheduled_at) < new Date();
                  return (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isPast ? "opacity-60" : "hover:bg-muted/50"
                      } transition-colors`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={session.focus === "review" ? "default" : "outline"}>
                            {session.focus}
                          </Badge>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {session.duration_min} min
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {session.topics.join(", ") || "General review"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                      {!isPast && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sessions/${session.id}`)}
                        >
                          Start Session
                        </Button>
                      )}
                      {isPast && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
