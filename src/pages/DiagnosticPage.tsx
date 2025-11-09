import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function DiagnosticPage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
    };

    // Check Supabase URL
    diagnostics.supabaseUrl = supabase.supabaseUrl;

    // Check environment variables
    diagnostics.envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 50) + "...",
    };

    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    diagnostics.user = user ? {
      id: user.id,
      email: user.email,
    } : "Not logged in";

    // Try to fetch assignments
    if (user) {
      const { data, error, count } = await supabase
        .from("assignments")
        .select("*", { count: 'exact' })
        .eq("user_id", user.id);

      diagnostics.assignmentsQuery = {
        count: count,
        dataLength: data?.length,
        error: error?.message,
        sample: data?.slice(0, 3).map(a => ({
          id: a.id,
          title: a.title,
        })),
      };

      // Try without user_id filter
      const { data: allData, error: allError, count: allCount } = await supabase
        .from("assignments")
        .select("*", { count: 'exact' });

      diagnostics.allAssignments = {
        count: allCount,
        dataLength: allData?.length,
        error: allError?.message,
      };
    }

    setInfo(diagnostics);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frontend Diagnostic</h1>

        <div className="bg-card p-6 rounded-lg shadow">
          <pre className="whitespace-pre-wrap text-sm overflow-auto">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Expected Supabase URL: <strong>https://lcpexhkqaqftaqdtgebp.supabase.co</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Expected assignment count: <strong>44</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
