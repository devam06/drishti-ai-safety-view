
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  Download,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown
} from "lucide-react";

interface ZoneAnalyticsProps {
  zone: {
    id: string;
    name: string;
    crowdLevel: string;
    lastUpdated: string;
    color: string;
  };
  onClose: () => void;
}

const ZoneAnalytics = ({ zone, onClose }: ZoneAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Generate mock historical data
  const generateHistoricalData = () => {
    const hours = [];
    const currentLevel = getCrowdLevelValue(zone.crowdLevel);
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      
      // Simulate realistic crowd patterns
      const baseLevel = currentLevel + (Math.random() - 0.5) * 20;
      const timeOfDay = hour.getHours();
      
      // Peak hours adjustment (9-11 AM, 2-4 PM, 6-8 PM)
      let adjustment = 0;
      if ((timeOfDay >= 9 && timeOfDay <= 11) || 
          (timeOfDay >= 14 && timeOfDay <= 16) || 
          (timeOfDay >= 18 && timeOfDay <= 20)) {
        adjustment = 15;
      }
      
      const level = Math.max(0, Math.min(100, baseLevel + adjustment));
      
      hours.push({
        time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: Math.round(level),
        capacity: Math.round(level * 1.2),
        alerts: level > 70 ? Math.floor(Math.random() * 3) : 0
      });
    }
    
    return hours;
  };

  const generateComparisonData = () => {
    const zones = ['A', 'B', 'C', 'D', 'E', 'F'];
    return zones.map(zoneId => ({
      zone: `Zone ${zoneId}`,
      current: zoneId === zone.id ? getCrowdLevelValue(zone.crowdLevel) : Math.random() * 100,
      average: Math.random() * 80,
      peak: Math.random() * 100
    }));
  };

  const generateCapacityData = () => {
    const current = getCrowdLevelValue(zone.crowdLevel);
    return [
      { name: 'Current', value: current, color: getCapacityColor(current) },
      { name: 'Available', value: 100 - current, color: '#e5e7eb' }
    ];
  };

  const historicalData = generateHistoricalData();
  const comparisonData = generateComparisonData();
  const capacityData = generateCapacityData();

  function getCrowdLevelValue(level: string): number {
    switch (level) {
      case 'Low': return 25;
      case 'Moderate': return 50;
      case 'High': return 75;
      case 'Critical': return 95;
      default: return 0;
    }
  }

  function getCapacityColor(value: number): string {
    if (value <= 25) return '#10b981';
    if (value <= 50) return '#f59e0b';
    if (value <= 75) return '#f97316';
    return '#ef4444';
  }

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Time,Level,Capacity,Alerts\n" +
      historicalData.map(row => `${row.time},${row.level},${row.capacity},${row.alerts}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zone_${zone.id}_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{zone.name} Analytics</h2>
              </div>
              <Badge className={`
                ${zone.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                ${zone.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                ${zone.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : ''}
                ${zone.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
              `}>
                {zone.crowdLevel}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportData} className="dark:border-gray-600 dark:text-gray-200">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-200">✕</Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 dark:bg-gray-700">
              <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-600">Overview</TabsTrigger>
              <TabsTrigger value="trends" className="dark:data-[state=active]:bg-gray-600">Trends</TabsTrigger>
              <TabsTrigger value="comparison" className="dark:data-[state=active]:bg-gray-600">Comparison</TabsTrigger>
              <TabsTrigger value="capacity" className="dark:data-[state=active]:bg-gray-600">Capacity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Current Level</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{zone.crowdLevel}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Capacity</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{getCrowdLevelValue(zone.crowdLevel)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Trend</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">Stable</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Last Updated</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{zone.lastUpdated}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <BarChart3 className="w-5 h-5" />
                    <span>Real-time Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={historicalData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                      <XAxis dataKey="time" className="dark:fill-gray-300" />
                      <YAxis className="dark:fill-gray-300" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="level" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">24-Hour Crowd Level Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                      <XAxis dataKey="time" className="dark:fill-gray-300" />
                      <YAxis className="dark:fill-gray-300" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={2} name="Crowd Level" />
                      <Line type="monotone" dataKey="capacity" stroke="#f59e0b" strokeWidth={2} name="Capacity Usage" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Alert Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={historicalData.filter(d => d.alerts > 0)}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                      <XAxis dataKey="time" className="dark:fill-gray-300" />
                      <YAxis className="dark:fill-gray-300" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="alerts" fill="#ef4444" name="Alerts" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Zone Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                      <XAxis dataKey="zone" className="dark:fill-gray-300" />
                      <YAxis className="dark:fill-gray-300" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Current Level" />
                      <Bar dataKey="average" fill="#10b981" name="Daily Average" />
                      <Bar dataKey="peak" fill="#ef4444" name="Peak Level" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capacity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <PieChartIcon className="w-5 h-5" />
                      <span>Current Capacity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={capacityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {capacityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {getCrowdLevelValue(zone.crowdLevel)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Capacity Utilization</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Capacity Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-blue-700 dark:text-blue-300">Maximum Capacity</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">1000 people</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-green-700 dark:text-green-300">Current Occupancy</span>
                      <span className="font-bold text-green-900 dark:text-green-100">
                        {Math.round(getCrowdLevelValue(zone.crowdLevel) * 10)} people
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-orange-700 dark:text-orange-300">Available Space</span>
                      <span className="font-bold text-orange-900 dark:text-orange-100">
                        {Math.round((100 - getCrowdLevelValue(zone.crowdLevel)) * 10)} people
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-red-700 dark:text-red-300">Safety Threshold</span>
                      <span className="font-bold text-red-900 dark:text-red-100">80%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {zone.crowdLevel === 'Critical' && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-800 dark:text-red-200">🚨 Critical Alert</h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                This zone has reached critical capacity. Immediate action required to prevent overcrowding.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneAnalytics;
