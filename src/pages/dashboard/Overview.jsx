import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import ChartCard from '../../components/charts/ChartCard';
import { useOverviewData, DURATION_OPTIONS } from '../../hooks/useOverviewData';

const COLORS = {
  sage: 'var(--color-sage)',
  sageLight: 'var(--color-sage-light)',
  charcoal: 'var(--color-charcoal)',
  muted: 'var(--color-text-muted)',
  bg: 'var(--color-surface)',
};

const PIE_COLORS = ['#7d8c5a', '#5e6b40', '#d97706', '#dc2626', '#8a8478'];
const RADIAL_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

// Custom Tooltip for aesthetic consistency
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-md">
        <p className="mb-2 text-sm font-semibold text-charcoal">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-muted">{entry.name}:</span>
            <span className="font-bold text-charcoal">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const {
    isLoading,
    durationValue,
    setDuration,
    userTrends,
    userStatus,
    tasksVsOffers,
    categoryWorkers,
  } = useOverviewData();

  // Duration selector widget
  const DurationAction = (
    <div className="flex items-center gap-1 rounded-full border border-border/40 bg-white/40 p-1 backdrop-blur-sm">
      {DURATION_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setDuration(opt.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            durationValue === opt.value
              ? 'bg-sage text-white shadow-sm'
              : 'text-text-muted hover:bg-white/60 hover:text-charcoal'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="System Overview"
        subtitle="Holistic insights and operational pulse of the marketplace."
      />

      <div className="grid gap-6 pb-12 lg:grid-cols-2">
        {/* 1. User Trends Area Chart - Spans full width */}
        <ChartCard
          title="User Registration Trends"
          subtitle="Growth trajectory of newly registered accounts"
          action={DurationAction}
          loading={isLoading}
          delay={0.1}
          className="lg:col-span-2 min-h-[400px]"
        >
          {userTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={userTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.sage} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.sage} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="New Users"
                  stroke={COLORS.sage}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              No data available for the selected duration.
            </div>
          )}
        </ChartCard>

        {/* 2. Tasks vs Offers Composed Chart */}
        <ChartCard
          title="Marketplace Traction"
          subtitle="Open task budgets vs. offer volume (Top 10 tasks)"
          loading={isLoading}
          delay={0.2}
          className="min-h-[380px]"
        >
          {tasksVsOffers.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={tasksVsOffers} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 11 }} 
                  angle={-20}
                  textAnchor="end"
                  dy={10}
                />
                <YAxis 
                  yAxisId="left" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 12 }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="left" 
                  dataKey="budget" 
                  name="Budget (EGP)" 
                  barSize={20} 
                  fill={COLORS.charcoal} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="offers" 
                  name="Offers Received" 
                  stroke={COLORS.sageLight} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: COLORS.bg, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              Not enough task data.
            </div>
          )}
        </ChartCard>

        {/* 3. User Status Pie Chart */}
        <ChartCard
          title="Account Status Distribution"
          subtitle="Proportion of users by operational status"
          loading={isLoading}
          delay={0.3}
          className="min-h-[380px]"
        >
          {userStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {userStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: COLORS.muted }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              No status data found.
            </div>
          )}
        </ChartCard>

        {/* 4. Category Workers Radial Chart */}
        <ChartCard
          title="Workforce Distribution"
          subtitle="Workers categorized by specialization"
          loading={isLoading}
          delay={0.4}
          className="lg:col-span-2 min-h-[420px]"
        >
          {categoryWorkers.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="90%" 
                barSize={16} 
                data={categoryWorkers.map((c, i) => ({ ...c, fill: RADIAL_COLORS[i % RADIAL_COLORS.length] }))}
              >
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 'bold' }}
                  background={{ fill: 'rgba(0,0,0,0.03)' }}
                  clockWise
                  dataKey="count"
                  cornerRadius={10}
                  animationDuration={1500}
                />
                <Legend 
                  iconSize={10} 
                  width={150} 
                  height={140} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  wrapperStyle={{
                    top: '50%',
                    right: 0,
                    transform: 'translate(0, -50%)',
                    lineHeight: '24px',
                    fontSize: '12px',
                    color: COLORS.charcoal
                  }} 
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              No category workforce data available.
            </div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

