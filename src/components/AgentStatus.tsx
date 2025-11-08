import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Brain, Calendar, Mail, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface AgentStatus {
  is_running: boolean;
  last_sync: string | null;
  notifications_sent: number;
  next_sync: string | null;
  next_check: string | null;
}

export function AgentStatus() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/agent/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.agent);
      }
    } catch (error) {
      console.error('Error fetching agent status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Loading Agent Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Agent Offline
          </CardTitle>
          <CardDescription>
            The agentic AI backend is not running. Start it with: <code>python backend/api.py</code>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={status.is_running ? 'border-green-200' : 'border-gray-200'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className={status.is_running ? 'h-5 w-5 text-green-600 animate-pulse' : 'h-5 w-5 text-gray-400'} />
            Agentic AI Status
          </CardTitle>
          <Badge variant={status.is_running ? 'default' : 'secondary'} className={status.is_running ? 'bg-green-600' : ''}>
            {status.is_running ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                ACTIVE
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                STOPPED
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Autonomous AI agent monitoring your calendar and sending proactive reminders
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Last Sync */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Last Sync</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatTime(status.last_sync)}
                </p>
              </div>
            </div>

            {/* Notifications Sent */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Reminders Sent</p>
                <p className="text-lg font-semibold text-purple-600">
                  {status.notifications_sent}
                </p>
              </div>
            </div>

            {/* Next Sync */}
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Next Sync</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatTime(status.next_sync)}
                </p>
              </div>
            </div>

            {/* Next Check */}
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Next Check</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatTime(status.next_check)}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          {status.is_running && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                How It Works
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>🔄 Syncs your Google Calendar every 5 minutes</li>
                <li>🧠 Detects exams within 7 days automatically</li>
                <li>📧 Sends proactive email reminders to prepare</li>
                <li>🤖 No manual action required - fully autonomous!</li>
              </ul>
            </div>
          )}

          {/* Refresh Button */}
          <Button 
            onClick={fetchStatus} 
            variant="outline" 
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

