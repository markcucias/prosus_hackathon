import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = 'http://localhost:5001';

export default function CalendarSync() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [unprocessed, setUnprocessed] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, assignments: 0 });

  const syncCalendar = async () => {
    setLoading(true);
    try {
      toast.info("Fetching events from your Google Calendar...");
      
      const response = await fetch(`${BACKEND_URL}/api/calendar/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days_ahead: 90 })
      });

      if (!response.ok) throw new Error('Failed to sync calendar');

      const data = await response.json();
      
      if (data.success) {
        setStats({
          total: data.stats.total_events,
          assignments: data.stats.unprocessed_assignments
        });
        
        toast.success(`Synced ${data.stats.total_events} events!`);
        
        // Fetch unprocessed assignments
        await fetchUnprocessed();
      }
    } catch (error: any) {
      console.error('Calendar sync error:', error);
      toast.error(error.message || 'Failed to sync calendar. Make sure backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnprocessed = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/assignments/unprocessed`);
      const data = await response.json();
      
      if (data.success) {
        setUnprocessed(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching unprocessed:', error);
    }
  };

  const syncToSupabase = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in first');
        return;
      }

      toast.info("Creating assignments in your study plan...");

      const response = await fetch(`${BACKEND_URL}/api/assignments/sync-to-supabase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: user.email })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Created ${data.reminders?.length || 0} assignments!`);
        
        // Show reminders
        if (data.reminders && data.reminders.length > 0) {
          data.reminders.forEach((reminder: any) => {
            toast.info(reminder.message, { duration: 8000 });
          });
        }

        // Refresh to clear unprocessed
        await fetchUnprocessed();
        
        // Navigate back to dashboard
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync assignments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Google Calendar Integration
              </CardTitle>
              <CardDescription>
                Automatically detect assignments from your calendar and create personalized study plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Make sure the Python backend is running:</strong><br />
                  Open terminal in <code>backend/</code> folder and run: <code>python api.py</code>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button onClick={syncCalendar} disabled={loading} size="lg">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Syncing...' : 'Sync Google Calendar'}
                </Button>

                {unprocessed.length > 0 && (
                  <Button onClick={syncToSupabase} disabled={loading} variant="default" size="lg">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create {unprocessed.length} Assignment{unprocessed.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>

              {stats.total > 0 && (
                <div className="flex gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Events Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.assignments}</div>
                    <div className="text-sm text-muted-foreground">Assignments Detected</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unprocessed Assignments */}
          {unprocessed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Assignments</CardTitle>
                <CardDescription>
                  These assignments were found in your calendar. Click "Create Assignments" to add them to your study plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unprocessed.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.details}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {new Date(assignment.datetime).toLocaleDateString()}
                          </Badge>
                          <Badge variant="secondary">
                            {new Date(assignment.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Assignment</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-sm">
                  <strong>Sync Calendar:</strong> Fetches events from your Google Calendar
                </li>
                <li className="text-sm">
                  <strong>Detect Assignments:</strong> Automatically identifies exams, quizzes, and deadlines using keywords
                </li>
                <li className="text-sm">
                  <strong>Create Study Plan:</strong> Generates personalized study sessions leading up to each assignment
                </li>
                <li className="text-sm">
                  <strong>Proactive Reminders:</strong> Sends notifications a week before exams asking for materials
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignment Detection Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['exam', 'test', 'quiz', 'midterm', 'final', 'assignment', 'homework', 'project', 'presentation', 'essay', 'paper', 'due', 'deadline'].map((keyword) => (
                  <Badge key={keyword} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

