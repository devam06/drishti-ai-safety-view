
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Activity,
  FileText,
  Download,
  Filter
} from "lucide-react";
import { useEmergencyLogs } from "@/hooks/useEmergencyLogs";

interface EnhancedEmergencyLogsProps {
  onClose: () => void;
}

const EnhancedEmergencyLogs = ({ onClose }: EnhancedEmergencyLogsProps) => {
  const { logs, loading } = useEmergencyLogs();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'dispatched': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('police')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (actionLower.includes('ambulance')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    if (actionLower.includes('fire')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    if (actionLower.includes('rescue')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (actionLower.includes('disaster')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Zone,Action,Status,Description\n"
      + logs.map(log => `${log.timestamp},${log.zones?.zone || 'N/A'},${log.action_type},${log.status},${log.description || ''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `emergency_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading emergency logs...</p>
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
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Response Logs</h2>
                <p className="text-gray-600 dark:text-gray-300">Track all emergency actions and responses ({logs.length} entries)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportLogs} className="dark:border-gray-600 dark:text-gray-200">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-200">✕</Button>
            </div>
          </div>
          
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Emergency Logs</h3>
              <p className="text-gray-500 dark:text-gray-400">Emergency actions will appear here when triggered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="hover:shadow-md transition-all duration-200 dark:bg-gray-700 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {log.zones?.zone || 'Zone N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getActionColor(log.action_type)}>
                          {log.action_type}
                        </Badge>
                        <Badge className={getStatusColor(log.status || 'active')}>
                          {log.status || 'active'}
                        </Badge>
                      </div>
                    </div>
                    {log.description && (
                      <div className="mt-2">
                        <p className="text-gray-800 dark:text-gray-200">{log.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Log Information</h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All emergency actions are automatically logged with timestamps and user information. Logs are stored securely and can be exported for reporting and analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmergencyLogs;
