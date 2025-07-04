
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EmergencyLog {
  id: string;
  zone_id: string;
  action_type: string;
  description: string;
  timestamp: string;
  status: string;
  resolved_at: string | null;
  zones?: {
    zone: string;
  };
}

export const useEmergencyLogs = () => {
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_logs')
        .select(`
          *,
          zones (zone)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching emergency logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLog = async (zoneId: string, actionType: string, description?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('emergency_logs')
        .insert({
          zone_id: zoneId,
          action_type: actionType,
          description: description,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Emergency Action Logged",
        description: `${actionType} has been dispatched and logged.`,
      });
    } catch (error) {
      console.error('Error creating emergency log:', error);
      toast({
        title: "Logging Failed",
        description: "Failed to log emergency action.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();

      // Set up real-time subscription
      const channel = supabase
        .channel('emergency-logs-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emergency_logs'
          },
          () => {
            fetchLogs(); // Refetch logs when new log is added
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    logs,
    loading,
    createLog,
    refetch: fetchLogs
  };
};
