
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyLog {
  id: string;
  zone_id: string | null;
  action_type: string;
  description: string | null;
  user_id: string | null;
  timestamp: string | null;
  status: string | null;
  resolved_at: string | null;
  zones?: {
    zone: string;
  };
}

export const useEmergencyLogs = () => {
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_logs')
        .select(`
          *,
          zones:zone_id (
            zone
          )
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching emergency logs:', error);
      toast({
        title: "Error loading logs",
        description: "Failed to fetch emergency logs from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLog = async (zoneId: string, actionType: string, description: string) => {
    try {
      const { error } = await supabase
        .from('emergency_logs')
        .insert({
          zone_id: zoneId || null,
          action_type: actionType,
          description: description,
          user_id: (await supabase.auth.getUser()).data.user?.id || null,
        });

      if (error) throw error;
      
      // Refetch logs to get the latest data
      await fetchLogs();
      
      toast({
        title: "Emergency Log Created",
        description: "Emergency action has been logged successfully.",
      });
    } catch (error) {
      console.error('Error creating emergency log:', error);
      toast({
        title: "Failed to Create Log",
        description: "Failed to create emergency log.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up real-time subscription for emergency logs
    const channel = supabase
      .channel('emergency-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_logs'
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    logs,
    loading,
    createLog,
    refetch: fetchLogs
  };
};
