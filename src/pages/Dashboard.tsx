
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeZones } from "@/hooks/useRealTimeZones";
import { useEmergencyLogs } from "@/hooks/useEmergencyLogs";
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  Settings, 
  User, 
  AlertTriangle, 
  Eye,
  Grid3X3,
  Map,
  Clock,
  Activity,
  LogOut,
  Shield,
  Users,
  TrendingUp
} from "lucide-react";
import EnhancedEmergencyActions from "@/components/EnhancedEmergencyActions";
import EnhancedEmergencyLogs from "@/components/EnhancedEmergencyLogs";
import AdminCapacityManager from "@/components/AdminCapacityManager";
import InteractiveHeatmap from "@/components/InteractiveHeatmap";
import ZoneAnalytics from "@/components/ZoneAnalytics";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'heatmap'>('cards');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showEmergencyActions, setShowEmergencyActions] = useState<string | null>(null);
  const [showEmergencyLogs, setShowEmergencyLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const { zones, loading } = useRealTimeZones();
  const { createLog } = useEmergencyLogs();
  const { toast } = useToast();

  const processedZones = zones.map(zone => ({
    id: zone.id,
    name: `Zone ${zone.zone}`,
    zone: zone.zone,
    crowdLevel: zone.crowd_level || 'low',
    lastUpdated: zone.last_updated || 'Never',
    capacity: zone.capacity || 1000,
    current_count: zone.current_count || 0,
    status: zone.status || 'active',
    color: getCrowdColor(zone.crowd_level || 'low'),
    crowd_level: zone.crowd_level || 'low'
  }));

  // Monitor for critical zones
  useEffect(() => {
    const newCriticalAlerts = processedZones
      .filter(zone => zone.crowd_level === 'critical')
      .map(zone => zone.id);
    
    // Check for new critical zones
    const newAlerts = newCriticalAlerts.filter(id => !criticalAlerts.includes(id));
    if (newAlerts.length > 0) {
      newAlerts.forEach(zoneId => {
        const zone = processedZones.find(z => z.id === zoneId);
        if (zone) {
          // Browser notification for critical alerts
          if (Notification.permission === 'granted') {
            new Notification(`🚨 Critical Alert: ${zone.name}`, {
              body: 'Zone has reached critical capacity! Immediate attention required.',
              icon: '/favicon.ico'
            });
          }
          
          toast({
            title: `🚨 CRITICAL ALERT: ${zone.name}`,
            description: "Zone capacity is critical! Take immediate action.",
            variant: "destructive",
          });
        }
      });
    }
    
    setCriticalAlerts(newCriticalAlerts);
  }, [processedZones, criticalAlerts, toast]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  function getCrowdColor(level: string) {
    switch (level.toLowerCase()) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  }

  const getCrowdBadgeColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'orange': return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
      case 'red': return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const triggerEmergency = async () => {
    const confirmed = window.confirm('Are you sure you want to trigger the Emergency Protocol? This will alert all security personnel and initiate evacuation procedures.');
    if (confirmed) {
      await createLog('', 'Emergency Protocol Activated', 'Global emergency protocol initiated by dashboard operator');
      
      toast({
        title: "🚨 Emergency Protocol Activated!",
        description: "All security teams have been notified.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (zone: any) => {
    setSelectedZone(zone.id);
  };

  const handleTakeAction = (zone: any) => {
    setShowEmergencyActions(zone.id);
  };

  const handleEmergencyAction = async (action: string, zoneId: string) => {
    const zone = processedZones.find(z => z.id === zoneId);
    await createLog(zoneId, action, `Emergency response for ${zone?.name}: ${action}`);
    
    toast({
      title: `🚨 ${action} Dispatched`,
      description: `Emergency response sent to ${zone?.name}`,
      variant: "default",
    });
    
    setShowEmergencyActions(null);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  const getCapacityPercentage = (count: number, capacity: number) => {
    return capacity > 0 ? Math.round((count / capacity) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading live data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">DrishtiAI</h1>
              </div>
              <div className="hidden md:block h-6 w-px bg-slate-300 dark:bg-gray-600" />
              <h2 className="hidden md:block text-lg font-semibold text-gray-700 dark:text-gray-300">Live Event Monitoring Dashboard</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white">
                <Activity className="w-4 h-4 mr-2" />
                Live
              </Button>
              
              {/* Critical Alert Bell */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`dark:text-gray-300 dark:hover:text-white ${
                    criticalAlerts.length > 0 ? 'animate-pulse text-red-600 dark:text-red-400' : ''
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {criticalAlerts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {criticalAlerts.length}
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user?.email}
              </div>
              <Avatar>
                <AvatarFallback className="dark:bg-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <Bell className="w-4 h-4 mr-3" />
                  Alerts
                  {criticalAlerts.length > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white animate-pulse">
                      {criticalAlerts.length}
                    </Badge>
                  )}
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setShowEmergencyLogs(true)}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Emergency Logs
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setShowSettings(true)}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Admin Panel
                </Button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Live Event Monitoring Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">Real-time crowd monitoring across all zones</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-1">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="dark:text-gray-300"
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setShowHeatmap(true)}
                    className="dark:text-gray-300"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Heatmap
                  </Button>
                </div>
                
                <Button
                  onClick={triggerEmergency}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Trigger Emergency Protocol
                </Button>
              </div>
            </div>

            {/* Zone Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {processedZones.map((zone) => {
                const capacityPercentage = getCapacityPercentage(zone.current_count, zone.capacity);
                const isCritical = zone.crowdLevel === 'critical';
                const isHigh = zone.crowdLevel === 'high';
                
                return (
                  <Card 
                    key={zone.id} 
                    className={`hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-gray-700 dark:bg-gray-800 ${
                      isCritical ? 'animate-pulse shadow-red-200 dark:shadow-red-900/50 shadow-lg border-red-300 dark:border-red-600' : 
                      isHigh ? 'shadow-orange-200 dark:shadow-orange-900/50 border-orange-300 dark:border-orange-600' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          {zone.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCrowdBadgeColor(zone.color)}>
                            {zone.crowdLevel}
                          </Badge>
                          {isCritical && (
                            <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                          <span className={`font-medium ${
                            capacityPercentage >= 95 ? 'text-red-600 dark:text-red-400' :
                            capacityPercentage >= 80 ? 'text-orange-600 dark:text-orange-400' :
                            'text-gray-900 dark:text-white'
                          }`}>
                            {zone.current_count}/{zone.capacity} ({capacityPercentage}%)
                          </span>
                        </div>
                        
                        {/* Capacity Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              capacityPercentage >= 95 ? 'bg-red-500' :
                              capacityPercentage >= 80 ? 'bg-orange-500' :
                              capacityPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Updated: {new Date(zone.lastUpdated).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1"
                            onClick={() => handleViewDetails(zone)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1"
                            onClick={() => handleTakeAction(zone)}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Emergency
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {processedZones.length}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Active Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {processedZones.filter(z => z.crowdLevel === 'low').length}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Safe Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {processedZones.filter(z => z.crowdLevel === 'medium').length}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Moderate Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {processedZones.filter(z => z.crowdLevel === 'high').length}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">High Alert Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${
                processedZones.filter(z => z.crowdLevel === 'critical').length > 0 ? 'animate-pulse' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {processedZones.filter(z => z.crowdLevel === 'critical').length}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">Critical Zones</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Zone Analytics Modal */}
      {selectedZone && (
        <ZoneAnalytics 
          zone={processedZones.find(z => z.id === selectedZone)!}
          onClose={() => setSelectedZone(null)}
        />
      )}

      {/* Enhanced Emergency Actions Modal */}
      {showEmergencyActions && (
        <EnhancedEmergencyActions 
          zoneId={showEmergencyActions}
          zoneName={processedZones.find(z => z.id === showEmergencyActions)?.name || ''}
          onClose={() => setShowEmergencyActions(null)}
          onAction={handleEmergencyAction}
        />
      )}

      {/* Enhanced Emergency Logs Modal */}
      {showEmergencyLogs && (
        <EnhancedEmergencyLogs 
          onClose={() => setShowEmergencyLogs(false)}
        />
      )}

      {/* Admin Capacity Manager */}
      {showSettings && (
        <AdminCapacityManager 
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Interactive Heatmap */}
      {showHeatmap && (
        <InteractiveHeatmap 
          zones={processedZones}
          onZoneClick={handleViewDetails}
          onEmergencyAction={handleTakeAction}
          onClose={() => setShowHeatmap(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
