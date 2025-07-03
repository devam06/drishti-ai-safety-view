
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  Settings, 
  User, 
  AlertTriangle, 
  Eye,
  Grid3X3,
  Map
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'heatmap'>('cards');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zones = [
    { 
      id: 'A', 
      name: 'Zone A', 
      crowdLevel: 'Low', 
      color: 'green', 
      lastUpdated: '2 min ago',
      count: 45,
      capacity: 200 
    },
    { 
      id: 'B', 
      name: 'Zone B', 
      crowdLevel: 'Moderate', 
      color: 'yellow', 
      lastUpdated: '1 min ago',
      count: 120,
      capacity: 180 
    },
    { 
      id: 'C', 
      name: 'Zone C', 
      crowdLevel: 'High', 
      color: 'orange', 
      lastUpdated: '30 sec ago',
      count: 165,
      capacity: 200 
    },
    { 
      id: 'D', 
      name: 'Zone D', 
      crowdLevel: 'Critical', 
      color: 'red', 
      lastUpdated: '15 sec ago',
      count: 190,
      capacity: 180 
    },
    { 
      id: 'E', 
      name: 'Zone E', 
      crowdLevel: 'Moderate', 
      color: 'yellow', 
      lastUpdated: '3 min ago',
      count: 95,
      capacity: 150 
    },
    { 
      id: 'F', 
      name: 'Zone F', 
      crowdLevel: 'Low', 
      color: 'green', 
      lastUpdated: '1 min ago',
      count: 32,
      capacity: 120 
    },
  ];

  const getCrowdBadgeVariant = (level: string) => {
    switch (level) {
      case 'Low': return 'default';
      case 'Moderate': return 'secondary';
      case 'High': return 'destructive';
      case 'Critical': return 'destructive';
      default: return 'default';
    }
  };

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
      alert('Emergency Protocol Activated! All security teams have been notified.');
    }
  };

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
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Logout
              </Button>
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
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  <FileText className="w-4 h-4 mr-3" />
                  Emergency Logs
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
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
                <Card key={zone.id} className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
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
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-medium">{zone.count}/{zone.capacity}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            zone.color === 'green' ? 'bg-green-500' :
                            zone.color === 'yellow' ? 'bg-yellow-500' :
                            zone.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(zone.count / zone.capacity) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Updated: {zone.lastUpdated}
                        </span>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          View Details
                        </Button>
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
                    <div className="text-2xl font-bold text-blue-700">687</div>
                    <div className="text-sm text-blue-600">Total Attendees</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">2</div>
                    <div className="text-sm text-green-600">Safe Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-700">2</div>
                    <div className="text-sm text-yellow-600">Moderate Zones</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700">2</div>
                    <div className="text-sm text-red-600">Alert Zones</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
