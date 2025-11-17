import OverallStatus from "../components/OverallStatus";
import StatusCard from "../components/StatusCard";
import MetricCard from "../components/MetricCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            System Status Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Real-time monitoring of all services and systems
          </p>
        </header>

        <div className="space-y-6">
          <OverallStatus status="operational" />

          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Requests" value="1.2M" change="12%" trend="up" />
              <MetricCard title="Avg Response Time" value="145ms" change="5%" trend="down" />
              <MetricCard title="Active Users" value="8,432" change="3%" trend="up" />
              <MetricCard title="Error Rate" value="0.02%" change="0.01%" trend="down" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Service Status
            </h2>
            <div className="space-y-3">
              <StatusCard 
                title="API Gateway" 
                status="operational" 
                uptime="99.99%" 
                responseTime="142ms" 
              />
              <StatusCard 
                title="Database Cluster" 
                status="operational" 
                uptime="99.98%" 
                responseTime="23ms" 
              />
              <StatusCard 
                title="Authentication Service" 
                status="operational" 
                uptime="100%" 
                responseTime="89ms" 
              />
              <StatusCard 
                title="Storage Service" 
                status="degraded" 
                uptime="99.85%" 
                responseTime="312ms" 
              />
              <StatusCard 
                title="Email Service" 
                status="operational" 
                uptime="99.95%" 
                responseTime="456ms" 
              />
              <StatusCard 
                title="CDN Network" 
                status="operational" 
                uptime="99.99%" 
                responseTime="67ms" 
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
