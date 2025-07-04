
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Map, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Maximize2
} from "lucide-react";

interface Zone {
  id: string;
  zone: string;
  crowd_level: string;
  current_count: number;
  capacity: number;
  status: string;
}

interface InteractiveHeatmapProps {
  zones: Zone[];
  onZoneClick: (zone: Zone) => void;
  onEmergencyAction: (zone: Zone) => void;
  onClose: () => void;
}

const InteractiveHeatmap = ({ zones, onZoneClick, onEmergencyAction, onClose }: InteractiveHeatmapProps) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const getZoneColor = (zone: Zone) => {
    const percentage = zone.capacity > 0 ? (zone.current_count / zone.capacity) * 100 : 0;
    
    if (percentage >= 95) return 'bg-red-500 border-red-600';
    if (percentage >= 80) return 'bg-orange-500 border-orange-600';
    if (percentage >= 50) return 'bg-yellow-500 border-yellow-600';
    return 'bg-green-500 border-green-600';
  };

  const getZoneIntensity = (zone: Zone) => {
    const percentage = zone.capacity > 0 ? (zone.current_count / zone.capacity) * 100 : 0;
    return Math.min(percentage / 100, 1);
  };

  const getCrowdLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    onZoneClick(zone);
  };

  // Create a grid layout for zones
  const gridCols = Math.ceil(Math.sqrt(zones.length));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Zone Heatmap</h2>
                  <p className="text-gray-600 dark:text-gray-300">Real-time crowd density visualization</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-200">✕</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap Grid */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 dark:text-white">
                      <Map className="w-5 h-5" />
                      <span>Zone Density Map</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="grid gap-2 p-4"
                      style={{ 
                        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                        minHeight: '400px'
                      }}
                    >
                      {zones.map((zone) => {
                        const intensity = getZoneIntensity(zone);
                        const isSelected = selectedZone?.id === zone.id;
                        
                        return (
                          <div
                            key={zone.id}
                            className={`
                              relative rounded-lg border-2 cursor-pointer transition-all duration-300 p-3 min-h-[100px]
                              ${getZoneColor(zone)}
                              ${isSelected ? 'ring-4 ring-blue-400 dark:ring-blue-600' : ''}
                              hover:scale-105 hover:shadow-lg
                              ${zone.crowd_level === 'critical' ? 'animate-pulse' : ''}
                            `}
                            style={{ 
                              opacity: 0.3 + (intensity * 0.7)
                            }}
                            onClick={() => handleZoneClick(zone)}
                          >
                            <div className="text-white text-center">
                              <div className="text-sm font-bold">{zone.zone}</div>
                              <div className="text-xs mt-1">
                                {zone.current_count}/{zone.capacity}
                              </div>
                              <div className="text-xs">
                                {Math.round((zone.current_count / zone.capacity) * 100)}%
                              </div>
                            </div>
                            
                            {zone.crowd_level === 'critical' && (
                              <div className="absolute top-1 right-1">
                                <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Legend */}
                <Card className="mt-4 dark:bg-gray-700 dark:border-gray-600">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 dark:text-white">Density Legend</h3>
                    <div className="flex flex-wrap items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm dark:text-gray-300">Low (0-50%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm dark:text-gray-300">Medium (50-80%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm dark:text-gray-300">High (80-95%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded animate-pulse"></div>
                        <span className="text-sm dark:text-gray-300">Critical (95%+)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Zone Details Panel */}
              <div className="space-y-4">
                {selectedZone ? (
                  <Card className="dark:bg-gray-700 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between dark:text-white">
                        <span>{selectedZone.zone}</span>
                        <Badge className={getCrowdLevelColor(selectedZone.crowd_level)}>
                          {selectedZone.crowd_level}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-sm dark:text-gray-300">Current Count</span>
                        </div>
                        <span className="font-semibold dark:text-white">{selectedZone.current_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Maximize2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                          <span className="text-sm dark:text-gray-300">Capacity</span>
                        </div>
                        <span className="font-semibold dark:text-white">{selectedZone.capacity}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                          <span className="text-sm dark:text-gray-300">Utilization</span>
                        </div>
                        <span className="font-semibold dark:text-white">
                          {Math.round((selectedZone.current_count / selectedZone.capacity) * 100)}%
                        </span>
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button
                          onClick={() => onZoneClick(selectedZone)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Analytics
                        </Button>
                        
                        {(selectedZone.crowd_level === 'high' || selectedZone.crowd_level === 'critical') && (
                          <Button
                            onClick={() => onEmergencyAction(selectedZone)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Emergency Actions
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="dark:bg-gray-700 dark:border-gray-600">
                    <CardContent className="p-6 text-center">
                      <Map className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Select a Zone</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click on any zone in the heatmap to view detailed information
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Statistics Summary */}
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Zones</span>
                      <Badge variant="outline" className="dark:border-gray-500">{zones.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Critical Zones</span>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {zones.filter(z => z.crowd_level === 'critical').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">High Zones</span>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        {zones.filter(z => z.crowd_level === 'high').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Safe Zones</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {zones.filter(z => z.crowd_level === 'low').length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
};

export default InteractiveHeatmap;
