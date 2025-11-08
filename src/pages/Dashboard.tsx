import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, BookOpen, TrendingUp, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { AgentStatus } from "@/components/AgentStatus";

interface Assignment {
  id: string;
  title: string;
  type: string;
  exam_subtype: string;
  due_at: string;
  status: string;
}

interface StudySession {
  id: string;
  scheduled_at: string;
  topics: string[];
  focus: string;
  duration_min: number;
}

interface UserProgress {
  overall_readiness: number;
  weak_topics: string[];
  strong_topics: string[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

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
    await loadDashboardData(session.user.id);
  };

  const loadDashboardData = async (userId: string) => {
    try {
      const [assignmentsRes, sessionsRes, progressRes] = await Promise.all([
        supabase.from("assignments").select("*").eq("user_id", userId).order("due_at"),
        supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", userId)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at")
          .limit(5),
        supabase.from("user_progress").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (progressRes.data) {
        setProgress({
          overall_readiness: progressRes.data.overall_readiness || 0,
          weak_topics: progressRes.data.weak_topics || [],
          strong_topics: progressRes.data.strong_topics || [],
        });
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your study plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Study Companion</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Learning</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate("/calendar-sync")}>
              <Calendar className="h-4 w-4 mr-2" />
              Sync Calendar
            </Button>
            <Button onClick={() => navigate("/assignments/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back!</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              You have {sessions.length} upcoming study sessions
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Agentic AI Status */}
        <AgentStatus />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Overall Readiness */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Readiness</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress?.overall_readiness || 0}%</div>
              <Progress value={progress?.overall_readiness || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Keep studying to improve your score
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Next session{" "}
                {sessions[0] &&
                  new Date(sessions[0].scheduled_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
              </p>
            </CardContent>
          </Card>

          {/* Active Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground mt-2">Across all subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* Study Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Study Sessions</CardTitle>
            <CardDescription>Your personalized study schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming sessions yet</p>
                <Button className="mt-4" onClick={() => navigate("/assignments/new")}>
                  Create Your First Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{session.focus}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {session.duration_min} min
                        </span>
                      </div>
                      <p className="text-sm font-medium">{session.topics.join(", ")}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Start Session
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assignments</CardTitle>
            <CardDescription>Track your upcoming exams and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {assignment.type}/{assignment.exam_subtype}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Due: {new Date(assignment.due_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge>{assignment.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Insights */}
        {progress && (progress.weak_topics.length > 0 || progress.strong_topics.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Areas to Focus</CardTitle>
                <CardDescription>Topics that need more practice</CardDescription>
              </CardHeader>
              <CardContent>
                {progress.weak_topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {progress.weak_topics.map((topic) => (
                      <Badge key={topic} variant="destructive">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strong Topics</CardTitle>
                <CardDescription>You're excelling in these areas</CardDescription>
              </CardHeader>
              <CardContent>
                {progress.strong_topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keep practicing!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {progress.strong_topics.map((topic) => (
                      <Badge key={topic} className="bg-success text-success-foreground">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
