
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Zone {
  id: string;
  zone: string;
  crowd_level: string;
  last_updated: string;
  capacity: number;
  current_count: number;
  status: string;
}

export const useRealTimeZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('zone');

      if (error) throw error;
      
      // Map the data to ensure all required fields are present with defaults
      const mappedZones = (data || []).map(zone => ({
        id: zone.id,
        zone: zone.zone,
        crowd_level: zone.crowd_level || 'low',
        last_updated: zone.last_updated || new Date().toISOString(),
        capacity: zone.Capacity || 1000,
        current_count: zone.current_count || 0,
        status: zone.status || 'active'
      }));
      
      setZones(mappedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error loading zones",
        description: "Failed to fetch zone data from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();

    // Set up real-time subscription
    const channel = supabase
      .channel('zones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zones'
        },
        (payload) => {
          console.log('Zone update received:', payload);
          fetchZones(); // Refetch all zones when any change occurs
          
          // Show toast for critical alerts
          if (payload.eventType === 'UPDATE' && payload.new?.crowd_level === 'critical') {
            toast({
              title: `🚨 Critical Alert: Zone ${payload.new.zone}`,
              description: "Immediate attention required!",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const updateZone = async (zoneId: string, updates: Partial<Zone>) => {
    try {
      const { error } = await supabase
        .from('zones')
        .update(updates)
        .eq('id', zoneId);

      if (error) throw error;
      
      toast({
        title: "Zone Updated",
        description: "Zone data has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating zone:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update zone data.",
        variant: "destructive",
      });
    }
  };

  return {
    zones,
    loading,
    updateZone,
    refetch: fetchZones
  };
};
