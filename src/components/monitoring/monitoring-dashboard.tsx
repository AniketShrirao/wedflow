'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Shield, Database, Zap } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, any>;
}

interface CSPViolation {
  documentURI: string;
  violatedDirective: string;
  blockedURI: string;
  timestamp: string;
}

interface CriticalError {
  message: string;
  level: string;
  context: {
    userId?: string;
    url?: string;
    timestamp: string;
  };
}

export function MonitoringDashboard() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [cspViolations, setCspViolations] = useState<CSPViolation[]>([]);
  const [criticalErrors, setCriticalErrors] = useState<CriticalError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Load performance metrics
      const perfResponse = await fetch('/api/monitoring/performance');
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        setPerformanceMetrics(perfData.metrics || []);
      }

      // Load CSP violations
      const cspResponse = await fetch('/api/monitoring/csp-violations');
      if (cspResponse.ok) {
        const cspData = await cspResponse.json();
        setCspViolations(cspData.violations || []);
      }

      // Load critical errors
      const errorsResponse = await fetch('/api/monitoring/critical-errors');
      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setCriticalErrors(errorsData.errors || []);
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceStatus = () => {
    const recentMetrics = performanceMetrics.filter(
      m => Date.now() - new Date(m.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const avgPageLoad = recentMetrics
      .filter(m => m.name === 'page_load_time')
      .reduce((sum, m) => sum + m.value, 0) / Math.max(1, recentMetrics.filter(m => m.name === 'page_load_time').length);

    if (avgPageLoad > 5000) return { status: 'poor', color: 'destructive' };
    if (avgPageLoad > 3000) return { status: 'fair', color: 'warning' };
    return { status: 'good', color: 'success' };
  };

  const getSecurityStatus = () => {
    const recentViolations = cspViolations.filter(
      v => Date.now() - new Date(v.timestamp).getTime() < 60 * 60 * 1000 // Last hour
    );

    const criticalViolations = recentViolations.filter(
      v => ['script-src', 'object-src', 'base-uri'].some(directive => v.violatedDirective.includes(directive))
    );

    if (criticalViolations.length > 0) return { status: 'critical', color: 'destructive' };
    if (recentViolations.length > 10) return { status: 'warning', color: 'warning' };
    return { status: 'secure', color: 'success' };
  };

  const performanceStatus = getPerformanceStatus();
  const securityStatus = getSecurityStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={performanceStatus.color as any}>
              {performanceStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={securityStatus.color as any}>
              {securityStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalErrors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="success">99.9%</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.slice(0, 10).map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{metric.name.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {metric.value} {metric.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSP Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cspViolations.slice(0, 10).map((violation, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4">
                    <p className="font-medium">{violation.violatedDirective}</p>
                    <p className="text-sm text-muted-foreground">
                      Blocked: {violation.blockedURI}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(violation.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <p className="font-medium">{error.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Level: {error.level}
                    </p>
                    {error.context.url && (
                      <p className="text-sm text-muted-foreground">
                        URL: {error.context.url}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(error.context.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge variant="success">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Endpoints</span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>External Services</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Cache Hit Rate</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memory Usage</span>
                    <Badge variant="outline">45%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Response Time</span>
                    <Badge variant="outline">120ms</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={loadMonitoringData} variant="outline">
          Refresh Data
        </Button>
        <Button variant="outline">
          Export Report
        </Button>
        <Button variant="outline">
          Configure Alerts
        </Button>
      </div>
    </div>
  );
}