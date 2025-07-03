
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Truck, 
  Heart, 
  Phone,
  AlertTriangle,
  Users
} from "lucide-react";

interface EmergencyActionsProps {
  zoneId: string;
  onClose: () => void;
  onAction: (action: string, zoneId: string) => void;
}

const EmergencyActions = ({ zoneId, onClose, onAction }: EmergencyActionsProps) => {
  const actions = [
    {
      title: "Call Police Force",
      description: "Deploy security personnel to manage crowd",
      icon: Shield,
      color: "blue",
      action: "Police Force Deployed"
    },
    {
      title: "Call Fire Department",
      description: "Emergency fire and rescue services",
      icon: Truck,
      color: "red",
      action: "Fire Department Dispatched"
    },
    {
      title: "Call Ambulance",
      description: "Medical assistance and paramedics",
      icon: Heart,
      color: "green",
      action: "Ambulance Dispatched"
    },
    {
      title: "Disaster Management",
      description: "Coordinate emergency response teams",
      icon: AlertTriangle,
      color: "orange",
      action: "Disaster Management Activated"
    },
    {
      title: "Emergency Hotline",
      description: "Contact emergency coordination center",
      icon: Phone,
      color: "purple",
      action: "Emergency Hotline Contacted"
    },
    {
      title: "Evacuation Protocol",
      description: "Initiate crowd evacuation procedures",
      icon: Users,
      color: "yellow",
      action: "Evacuation Protocol Initiated"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700';
      case 'red': return 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700';
      case 'green': return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700';
      case 'orange': return 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700';
      case 'purple': return 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Emergency Response - Zone {zoneId}</h2>
              <p className="text-gray-600 dark:text-gray-300">Select appropriate emergency action</p>
            </div>
            <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-200">✕</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((actionItem, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg dark:border-gray-600 ${getColorClasses(actionItem.color)}`}
                onClick={() => onAction(actionItem.action, zoneId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <actionItem.icon className="w-6 h-6" />
                    <CardTitle className="text-lg">{actionItem.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-80">{actionItem.description}</p>
                  <Button 
                    className="w-full mt-3" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(actionItem.action, zoneId);
                    }}
                  >
                    Deploy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Critical Zone Alert</h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              Zone {zoneId} requires immediate attention. Multiple emergency services may be needed for effective response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyActions;
