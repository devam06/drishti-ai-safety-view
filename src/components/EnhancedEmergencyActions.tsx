
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Phone, 
  Ambulance, 
  ShieldAlert, 
  Flame, 
  Users, 
  Zap,
  ArrowRight,
  Clock
} from "lucide-react";

interface EmergencyAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  urgency: 'high' | 'critical';
  color: string;
}

interface EnhancedEmergencyActionsProps {
  zoneId: string;
  zoneName: string;
  onClose: () => void;
  onAction: (action: string, zoneId: string) => void;
}

const EmergencyActions = ({ zoneId, zoneName, onClose, onAction }: EnhancedEmergencyActionsProps) => {
  const emergencyActions: EmergencyAction[] = [
    {
      id: 'police',
      name: 'Police Force',
      description: 'Deploy police units for crowd control and security',
      icon: <ShieldAlert className="w-5 h-5" />,
      urgency: 'high',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'ambulance',
      name: 'Ambulance Services',
      description: 'Medical emergency response and first aid',
      icon: <Ambulance className="w-5 h-5" />,
      urgency: 'critical',
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      id: 'fire',
      name: 'Fire Department',
      description: 'Fire safety and emergency evacuation assistance',
      icon: <Flame className="w-5 h-5" />,
      urgency: 'critical',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'rescue',
      name: 'Rescue Teams',
      description: 'Specialized rescue operations and crowd extraction',
      icon: <Users className="w-5 h-5" />,
      urgency: 'high',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'disaster',
      name: 'Disaster Management',
      description: 'Coordinate disaster response and resource allocation',
      icon: <Zap className="w-5 h-5" />,
      urgency: 'critical',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'evacuation',
      name: 'Evacuation Protocol',
      description: 'Initiate systematic evacuation procedures',
      icon: <ArrowRight className="w-5 h-5" />,
      urgency: 'critical',
      color: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ];

  const handleAction = (action: EmergencyAction) => {
    const confirmed = window.confirm(
      `Are you sure you want to dispatch ${action.name} to ${zoneName}?\n\n${action.description}\n\nThis action will be logged and cannot be undone.`
    );
    
    if (confirmed) {
      onAction(action.name, zoneId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Response</h2>
                <p className="text-gray-600 dark:text-gray-300">Select emergency services for {zoneName}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-200">✕</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {emergencyActions.map((action) => (
              <Card key={action.id} className="hover:shadow-lg transition-all duration-200 dark:bg-gray-700 dark:border-gray-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {action.name}
                      </CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={action.urgency === 'critical' ? 
                        'border-red-500 text-red-700 dark:text-red-400' : 
                        'border-orange-500 text-orange-700 dark:text-orange-400'
                      }
                    >
                      {action.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{action.description}</p>
                  <Button
                    onClick={() => handleAction(action)}
                    className={`w-full ${action.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Dispatch {action.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Emergency Protocol Information</h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              All emergency actions are logged with timestamps and user information. Emergency services will be notified immediately upon dispatch. Ensure you have proper authorization before triggering emergency protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyActions;
