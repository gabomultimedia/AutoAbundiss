import { useState, useEffect } from 'react';
import { 
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
  MessageSquare, 
  Tag, 
  Calendar, 
  TrendingUp
} from 'lucide-react';
import { conversationsAPI, promotionsAPI, calendarAPI } from '../lib/api';
import { useToast } from '../store/useToast';
import type { Conversation } from '../lib/schema';

interface DashboardStats {
  totalConversations: number;
  conversationsLast7Days: number;
  byIntent: Record<string, number>;
  totalPromotions: number;
  activePromotions: number;
  upcomingEvents: number;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    conversationsLast7Days: 0,
    byIntent: {},
    totalPromotions: 0,
    activePromotions: 0,
    upcomingEvents: 0,
  });
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar estadísticas de conversaciones
      const convStats = await conversationsAPI.getStats();
      
      // Cargar promociones
      const allPromotions = await promotionsAPI.getAll();
      const activePromotions = await promotionsAPI.getActive();
      
      // Cargar eventos del calendario
      const events = await calendarAPI.getEvents();
      
      // Cargar conversaciones recientes
      const recent = await conversationsAPI.getAll({ limit: 10 });
      
      setStats({
        totalConversations: convStats.total,
        conversationsLast7Days: convStats.last7Days,
        byIntent: convStats.byIntent,
        totalPromotions: allPromotions.length,
        activePromotions: activePromotions.length,
        upcomingEvents: events.length,
      });
      
      setRecentConversations(recent.data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error cargando dashboard',
        message: 'No se pudieron cargar las estadísticas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Conversaciones (7 días)',
      value: stats.conversationsLast7Days.toString(),
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Promociones activas',
      value: stats.activePromotions.toString(),
      icon: Tag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Eventos próximos',
      value: stats.upcomingEvents.toString(),
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total conversaciones',
      value: stats.totalConversations.toString(),
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const chartData = Object.entries(stats.byIntent).map(([intent, count]) => ({
    name: intent.charAt(0).toUpperCase() + intent.slice(1),
    value: count,
  }));

  const weeklyData = [
    { day: 'Lun', count: Math.floor(Math.random() * 50) + 10 },
    { day: 'Mar', count: Math.floor(Math.random() * 50) + 10 },
    { day: 'Mié', count: Math.floor(Math.random() * 50) + 10 },
    { day: 'Jue', count: Math.floor(Math.random() * 50) + 10 },
    { day: 'Vie', count: Math.floor(Math.random() * 50) + 10 },
    { day: 'Sáb', count: Math.floor(Math.random() * 30) + 5 },
    { day: 'Dom', count: Math.floor(Math.random() * 30) + 5 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen de la actividad de Abundiss Console
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Conversations Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Conversaciones por Semana
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    color: '#e6e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent Distribution Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribución de Intenciones
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    color: '#e6e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Conversaciones Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-sm font-medium text-muted-foreground">Chat ID</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Intención</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Mensaje</th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentConversations.map((conv) => (
                <tr key={conv.id} className="border-b border-border/50">
                  <td className="py-3 text-sm text-foreground">{conv.chat_id}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      conv.intent === 'cotiza' ? 'bg-blue-500/20 text-blue-300' :
                      conv.intent === 'agenda' ? 'bg-green-500/20 text-green-300' :
                      conv.intent === 'molesto' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {conv.intent}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-foreground max-w-xs truncate">
                    {conv.message}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {conv.created_at ? new Date(conv.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
