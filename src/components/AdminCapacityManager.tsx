
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Save, 
  AlertTriangle,
  Users,
  TrendingUp,
  Shield,
  Plus
} from "lucide-react";
import { useRealTimeZones } from "@/hooks/useRealTimeZones";
import { useToast } from "@/hooks/use-toast";

interface AdminCapacityManagerProps {
  onClose: () => void;
}

const AdminCapacityManager = ({ onClose }: AdminCapacityManagerProps) => {
  const { zones, updateZone, createZone, loading } = useRealTimeZones();
  const [capacityUpdates, setCapacityUpdates] = useState<Record<string, number>>({});
  const [countUpdates, setCountUpdates] = useState<Record<string, number>>({});
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCapacity, setNewZoneCapacity] = useState(1000);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize capacity updates with current values
    const initialCapacities: Record<string, number> = {};
    const initialCounts: Record<string, number> = {};
    zones.forEach(zone => {
      initialCapacities[zone.id] = zone.capacity;
      initialCounts[zone.id] = zone.current_count;
    });
    setCapacityUpdates(initialCapacities);
    setCountUpdates(initialCounts);
  }, [zones]);

  const handleCapacityChange = (zoneId: string, capacity: number) => {
    setCapacityUpdates(prev => ({ ...prev, [zoneId]: capacity }));
  };

  const handleCountChange = (zoneId: string, count: number) => {
    setCountUpdates(prev => ({ ...prev, [zoneId]: count }));
  };

  const handleSave = async (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    const newCapacity = capacityUpdates[zoneId];
    const newCount = countUpdates[zoneId];

    await updateZone(zoneId, {
      capacity: newCapacity,
      current_count: newCount
    });

    toast({
      title: "Zone Updated",
      description: `${zone.zone} capacity and count have been updated.`,
    });
  };

  const handleCreateZone = async () => {
    if (!newZoneName.trim()) {
      toast({
        title: "Invalid Zone Name",
        description: "Please enter a valid zone name.",
        variant: "destructive",
      });
      return;
    }

    if (newZoneCapacity <= 0) {
      toast({
        title: "Invalid Capacity",
        description: "Capacity must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    await createZone(newZoneName.trim(), newZoneCapacity);
    setNewZoneName('');
    setNewZoneCapacity(1000);
    setShowAddZone(false);
  };

  const getCapacityPercentage = (count: number, capacity: number) => {
    return capacity > 0 ? Math.round((count / capacity) * 100) : 0;
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600 dark:text-red-400';
    if (percentage >= 80) return 'text-orange-600 dark:text-orange-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getCrowdLevel = (percentage: number) => {
    if (percentage >= 95) return 'critical';
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  const getCrowdBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 animate-pulse';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 animate-pulse';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading zone data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zone Management</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage zone capacities and add new zones</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowAddZone(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Zone
              </Button>
              <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-200">✕</Button>
            </div>
          </div>

          {/* Add Zone Form */}
          {showAddZone && (
            <Card className="mb-6 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300">Add New Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zoneName" className="text-sm font-medium dark:text-gray-300">
                      Zone Name
                    </Label>
                    <Input
                      id="zoneName"
                      type="text"
                      placeholder="Enter zone name"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="dark:bg-gray-600 dark:border-gray-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zoneCapacity" className="text-sm font-medium dark:text-gray-300">
                      Zone Capacity
                    </Label>
                    <Input
                      id="zoneCapacity"
                      type="number"
                      min="1"
                      value={newZoneCapacity}
                      onChange={(e) => setNewZoneCapacity(parseInt(e.target.value) || 1000)}
                      className="dark:bg-gray-600 dark:border-gray-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateZone}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Zone
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddZone(false);
                      setNewZoneName('');
                      setNewZoneCapacity(1000);
                    }}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {zones.map((zone) => {
              const currentCapacity = capacityUpdates[zone.id] || zone.capacity;
              const currentCount = countUpdates[zone.id] || zone.current_count;
              const percentage = getCapacityPercentage(currentCount, currentCapacity);
              const crowdLevel = getCrowdLevel(percentage);
              
              return (
                <Card key={zone.id} className="hover:shadow-lg transition-all duration-200 dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {zone.zone}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getCrowdBadgeColor(crowdLevel)}>
                          {crowdLevel}
                        </Badge>
                        <span className={`text-sm font-bold ${getCapacityColor(percentage)}`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`capacity-${zone.id}`} className="text-sm font-medium dark:text-gray-300">
                          Zone Capacity
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            id={`capacity-${zone.id}`}
                            type="number"
                            min="1"
                            value={currentCapacity}
                            onChange={(e) => handleCapacityChange(zone.id, parseInt(e.target.value) || 0)}
                            className="dark:bg-gray-600 dark:border-gray-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`count-${zone.id}`} className="text-sm font-medium dark:text-gray-300">
                          Current Count
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            id={`count-${zone.id}`}
                            type="number"
                            min="0"
                            value={currentCount}
                            onChange={(e) => handleCountChange(zone.id, parseInt(e.target.value) || 0)}
                            className="dark:bg-gray-600 dark:border-gray-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Capacity Utilization</span>
                        <span className={`text-sm font-semibold ${getCapacityColor(percentage)}`}>
                          {currentCount} / {currentCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 95 ? 'bg-red-500' :
                            percentage >= 80 ? 'bg-orange-500' :
                            percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {percentage >= 80 && (
                      <div className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm text-orange-700 dark:text-orange-300">
                          {percentage >= 95 ? 'Critical capacity reached!' : 'High capacity warning!'}
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={() => handleSave(zone.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Admin Notice</h3>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Crowd levels are automatically calculated: 80%+ capacity = High (blinking), 95%+ capacity = Critical (blinking). 
              All changes are logged and synced in real-time across all connected devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCapacityManager;
