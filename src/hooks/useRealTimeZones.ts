
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

  const calculateCrowdLevel = (currentCount: number, capacity: number): string => {
    const percentage = capacity > 0 ? (currentCount / capacity) * 100 : 0;
    
    if (percentage >= 95) return 'critical';
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('zone');

      if (error) throw error;
      
      // Map the data to ensure all required fields are present with defaults
      const mappedZones = (data || []).map(zone => {
        const capacity = (zone as any).Capacity || (zone as any).capacity || 1000;
        const currentCount = (zone as any).current_count || 0;
        const calculatedCrowdLevel = calculateCrowdLevel(currentCount, capacity);
        
        return {
          id: zone.id,
          zone: zone.zone,
          crowd_level: calculatedCrowdLevel,
          last_updated: zone.last_updated || new Date().toISOString(),
          capacity: capacity,
          current_count: currentCount,
          status: (zone as any).status || 'active'
        };
      });
      
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

  const updateZone = async (zoneId: string, updates: Partial<Zone>) => {
    try {
      // Calculate new crowd level if capacity or current_count is being updated
      let newCrowdLevel = updates.crowd_level;
      if (updates.capacity !== undefined || updates.current_count !== undefined) {
        const currentZone = zones.find(z => z.id === zoneId);
        if (currentZone) {
          const newCapacity = updates.capacity ?? currentZone.capacity;
          const newCurrentCount = updates.current_count ?? currentZone.current_count;
          newCrowdLevel = calculateCrowdLevel(newCurrentCount, newCapacity);
        }
      }

      // Map the updates to match database column names
      const dbUpdates: any = {};
      if (updates.capacity !== undefined) dbUpdates.Capacity = updates.capacity;
      if (updates.current_count !== undefined) dbUpdates.current_count = updates.current_count;
      if (newCrowdLevel !== undefined) dbUpdates.crowd_level = newCrowdLevel;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      
      const { error } = await supabase
        .from('zones')
        .update(dbUpdates)
        .eq('id', zoneId);

      if (error) throw error;
      
      // Refetch zones to get the latest data
      await fetchZones();
      
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

  const createZone = async (zoneName: string, capacity: number) => {
    try {
      const crowdLevel = calculateCrowdLevel(0, capacity);
      
      const { error } = await supabase
        .from('zones')
        .insert({
          zone: zoneName,
          Capacity: capacity,
          current_count: 0,
          crowd_level: crowdLevel,
          status: 'active',
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refetch zones to get the latest data
      await fetchZones();
      
      toast({
        title: "Zone Created",
        description: `Zone "${zoneName}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating zone:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create new zone.",
        variant: "destructive",
      });
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

  return {
    zones,
    loading,
    updateZone,
    createZone,
    refetch: fetchZones
  };
};
