import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error: any) {
      toast.error("Failed to load session");
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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Study Session</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Focus: {session.focus}</span>
              <span>Duration: {session.duration_min} min</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {session.topics.map((topic: string) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AI exercise generation coming soon!</p>
              <p className="text-sm mt-2">This session is scheduled for {new Date(session.scheduled_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
