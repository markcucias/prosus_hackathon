import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
  type: string;
  exam_subtype: string;
  due_at: string;
  topics: string[];
  status: string;
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

        <Card>
          <CardHeader>
            <CardTitle>Study Plan</CardTitle>
            <CardDescription>
              {sessions.length} sessions scheduled to help you prepare
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
