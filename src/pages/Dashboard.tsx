
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
  TrendingUp,
  Users,
  Clock,
  Activity,
  Phone,
  Shield,
  Truck,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import EmergencyActions from "@/components/EmergencyActions";
import EmergencyLogs from "@/components/EmergencyLogs";
import SettingsPanel from "@/components/SettingsPanel";

interface ZoneData {
  crowd_level: string;
  last_updated: string;
}

interface EmergencyLog {
  id: string;
  timestamp: string;
  zone: string;
  action: string;
  status: string;
  level: string;
}

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'heatmap'>('cards');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showEmergencyActions, setShowEmergencyActions] = useState<string | null>(null);
  const [showEmergencyLogs, setShowEmergencyLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyLog[]>([]);
  const [zonesData, setZonesData] = useState<Record<string, ZoneData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockData = {
    zoneA: { crowd_level: 'Low', last_updated: '2025-07-03 10:05:32' },
    zoneB: { crowd_level: 'Moderate', last_updated: '2025-07-03 10:04:15' },
    zoneC: { crowd_level: 'High', last_updated: '2025-07-03 10:03:45' },
    zoneD: { crowd_level: 'Critical', last_updated: '2025-07-03 10:02:10' },
    zoneE: { crowd_level: 'Low', last_updated: '2025-07-03 10:01:55' },
    zoneF: { crowd_level: 'Moderate', last_updated: '2025-07-03 10:00:30' }
  };

  const fetchZoneData = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      setZonesData(mockData);
      
      // Check for critical zones and show warnings
      Object.entries(mockData).forEach(([zoneName, data]: [string, any]) => {
        if (data?.crowd_level === 'Critical' || data?.crowd_level === 'High') {
          toast({
            title: `⚠️ Alert: ${zoneName.toUpperCase()}`,
            description: `Crowd level is ${data.crowd_level}. Immediate attention required!`,
            variant: data.crowd_level === 'Critical' ? 'destructive' : 'default',
          });
        }
      });
    } catch (err) {
      console.error('Error with mock data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZoneData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchZoneData, 30000);
    return () => clearInterval(interval);
  }, []);

  const zones = ['A', 'B', 'C', 'D', 'E', 'F'].map(id => {
    const zoneKey = `zone${id}`;
    const data = zonesData[zoneKey];
    return {
      id,
      name: `Zone ${id}`,
      crowdLevel: data?.crowd_level || 'No data available',
      lastUpdated: data?.last_updated || 'Never',
      color: getCrowdColor(data?.crowd_level || 'Low')
    };
  });

  function getCrowdColor(level: string) {
    switch (level) {
      case 'Low': return 'green';
      case 'Moderate': return 'yellow';
      case 'High': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  }

  const getCrowdBadgeColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'orange': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'red': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const triggerEmergency = () => {
    const confirmed = window.confirm('Are you sure you want to trigger the Emergency Protocol? This will alert all security personnel and initiate evacuation procedures.');
    if (confirmed) {
      const newLog: EmergencyLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        zone: 'All Zones',
        action: 'Emergency Protocol Activated',
        status: 'Active',
        level: 'Critical'
      };
      setEmergencyLogs(prev => [newLog, ...prev]);
      
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

  const closeDetails = () => {
    setSelectedZone(null);
  };

  const closeEmergencyActions = () => {
    setShowEmergencyActions(null);
  };

  const handleEmergencyAction = (action: string, zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    const newLog: EmergencyLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      zone: `Zone ${zoneId}`,
      action: action,
      status: 'Dispatched',
      level: zone?.crowdLevel || 'Unknown'
    };
    
    setEmergencyLogs(prev => [newLog, ...prev]);
    
    toast({
      title: `🚨 ${action} Dispatched`,
      description: `Emergency response sent to Zone ${zoneId}`,
      variant: "default",
    });
    
    closeEmergencyActions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading live data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">DrishtiAI</h1>
              </div>
              <div className="hidden md:block h-6 w-px bg-slate-300" />
              <h2 className="hidden md:block text-lg font-semibold text-gray-700">Live Event Monitoring Dashboard</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={fetchZoneData}>
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-slate-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-700">
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  <Bell className="w-4 h-4 mr-3" />
                  Alerts
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                  onClick={() => setShowEmergencyLogs(true)}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Emergency Logs
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Event Monitoring Dashboard</h1>
                <p className="text-gray-600">Real-time crowd monitoring across all zones</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-200 p-1">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('heatmap')}
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
              {zones.map((zone) => (
                <Card 
                  key={zone.id} 
                  className={`hover:shadow-lg transition-all duration-200 border-slate-200 ${
                    zone.crowdLevel === 'Critical' ? 'animate-pulse shadow-red-200 shadow-lg' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {zone.name}
                      </CardTitle>
                      <Badge className={getCrowdBadgeColor(zone.color)}>
                        {zone.crowdLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Updated: {zone.lastUpdated}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1"
                          onClick={() => handleViewDetails(zone)}
                        >
                          View Details
                        </Button>
                        {(zone.crowdLevel === 'High' || zone.crowdLevel === 'Critical') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                            onClick={() => handleTakeAction(zone)}
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {zones.filter(z => z.crowdLevel !== 'No data available').length}
                    </div>
                    <div className="text-sm text-blue-600">Active Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {zones.filter(z => z.crowdLevel === 'Low').length}
                    </div>
                    <div className="text-sm text-green-600">Safe Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-700">
                      {zones.filter(z => z.crowdLevel === 'Moderate').length}
                    </div>
                    <div className="text-sm text-yellow-600">Moderate Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {zones.filter(z => z.crowdLevel === 'High' || z.crowdLevel === 'Critical').length}
                    </div>
                    <div className="text-sm text-red-600">Alert Zones</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Zone Details Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Zone {selectedZone} Analytics</h2>
                <Button variant="outline" onClick={closeDetails}>✕</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-gray-600">Current Level</div>
                        <div className="text-xl font-bold">
                          {zones.find(z => z.id === selectedZone)?.crowdLevel}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-sm text-gray-600">Trend</div>
                        <div className="text-xl font-bold">Stable</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Real-time Insights</h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Last updated: {zones.find(z => z.id === selectedZone)?.lastUpdated}</li>
                    <li>• Monitoring status: Active</li>
                    <li>• Alert threshold: High density detected</li>
                  </ul>
                </div>
                
                {zones.find(z => z.id === selectedZone)?.crowdLevel === 'Critical' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">🚨 Critical Alert</h3>
                    <p className="text-sm text-red-700">
                      This zone has reached critical capacity. Immediate action required to prevent overcrowding.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Actions Modal */}
      {showEmergencyActions && (
        <EmergencyActions 
          zoneId={showEmergencyActions}
          onClose={closeEmergencyActions}
          onAction={handleEmergencyAction}
        />
      )}

      {/* Emergency Logs Modal */}
      {showEmergencyLogs && (
        <EmergencyLogs 
          logs={emergencyLogs}
          onClose={() => setShowEmergencyLogs(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
