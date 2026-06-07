import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import ChartCard from '../../components/charts/ChartCard';
import { useOverviewData, DURATION_OPTIONS } from '../../hooks/useOverviewData';
import { useUsers } from '../../hooks/useUsers';
import { useOpenTasks } from '../../hooks/useTasks';

const COLORS = {
  sage: 'var(--color-sage)',
  sageLight: 'var(--color-sage-light)',
  sageDark: 'var(--color-sage-dark)',
  charcoal: 'var(--color-charcoal)',
  muted: 'var(--color-text-muted)',
  bg: 'var(--color-surface)',
};

const VERIFICATION_COLORS = {
  Verified: '#10b981',   // Emerald
  Failed: '#ef4444',     // Red
  Unverified: '#9ca3af'  // Gray
};

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
    userDurationValue,
    taskDurationValue,
    setUserDuration,
    setTaskDuration,
    userTrends,
    taskTrends,
    categoryWorkers,
  } = useOverviewData();

  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: tasksData, isLoading: tasksLoading } = useOpenTasks(1, 5);

  const usersList = Array.isArray(usersData) ? usersData : (usersData?.data?.users || usersData?.users || []);
  
  // Verification Data Calculation
  const verificationCounts = { Verified: 0, Failed: 0, Unverified: 0 };
  usersList.forEach(user => {
    const status = user.identityVerification?.status?.toLowerCase();
    if (status === 'verified') verificationCounts.Verified++;
    else if (status === 'failed') verificationCounts.Failed++;
    else verificationCounts.Unverified++;
  });
  
  const verificationData = Object.entries(verificationCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);
  const recentUsers = [...usersList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const tasksList = tasksData?.tasks || tasksData?.data?.tasks || [];
  const recentTasks = [...tasksList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Duration selector widget for Users
  const UserDurationAction = (
    <div className="flex items-center gap-1 rounded-full border border-border/40 bg-white/40 p-1 backdrop-blur-sm">
      {DURATION_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setUserDuration(opt.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            userDurationValue === opt.value
              ? 'bg-sage text-white shadow-sm'
              : 'text-text-muted hover:bg-white/60 hover:text-charcoal'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // Duration selector widget for Tasks
  const TaskDurationAction = (
    <div className="flex items-center gap-1 rounded-full border border-border/40 bg-white/40 p-1 backdrop-blur-sm">
      {DURATION_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTaskDuration(opt.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            taskDurationValue === opt.value
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
          action={UserDurationAction}
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

        {/* 1.5 Task Growth & Budget Composed Chart - Spans full width */}
        <ChartCard
          title="Task Growth & Budget"
          subtitle="Daily task volume and total budget over time"
          action={TaskDurationAction}
          loading={isLoading}
          delay={0.15}
          className="lg:col-span-2 min-h-[400px]"
        >
          {taskTrends && taskTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={taskTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 12 }} 
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
                  tickFormatter={(val) => `${val} EGP`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px', color: COLORS.muted }}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="budget" 
                  name="Total Budget" 
                  barSize={30} 
                  fill={COLORS.sageLight} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name="New Tasks"
                  stroke={COLORS.sageDark}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.sageDark, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              No task data available for the selected duration.
            </div>
          )}
        </ChartCard>

        {/* 2. Task Categories Bar Chart */}
        <ChartCard
          title="Categories & Workers"
          subtitle="Number of workers assigned per category"
          loading={isLoading}
          delay={0.2}
          className="min-h-[380px]"
        >
          {categoryWorkers && categoryWorkers.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryWorkers} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
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
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: COLORS.muted, fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Workers" 
                  barSize={30} 
                  fill={COLORS.sageDark} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              Not enough category data.
            </div>
          )}
        </ChartCard>

        {/* 3. Identity Verification Status */}
        <ChartCard
          title="Identity Verification"
          subtitle="Breakdown of user verification statuses"
          loading={usersLoading}
          delay={0.3}
          className="min-h-[380px]"
        >
          {verificationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VERIFICATION_COLORS[entry.name]} />
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
              No verification data found.
            </div>
          )}
        </ChartCard>

        {/* 4. Recently Added Users */}
        <ChartCard
          title="Recently Added Users"
          subtitle="Newest registered members"
          loading={usersLoading}
          delay={0.4}
          className="min-h-[380px]"
        >
          {recentUsers.length > 0 ? (
            <div className="flex flex-col gap-4 mt-2 max-h-[280px] overflow-y-auto pr-2">
              {recentUsers.map(user => (
                <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl border border-black/5 bg-white/40 hover:bg-white/60 transition-colors">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name?.first || 'U'}+${user.name?.last || 'U'}&background=random`} alt={user.userName} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-semibold text-charcoal truncate">{user.name?.first} {user.name?.last}</h4>
                    <p className="text-xs text-text-muted truncate">@{user.userName} • {user.role}</p>
                  </div>
                  <div className="text-xs font-medium text-sage-dark bg-sage/10 px-2 py-1 rounded-md whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              No recent users found.
            </div>
          )}
        </ChartCard>

        {/* 5. Recently Added Tasks */}
        <ChartCard
          title="Recently Added Tasks"
          subtitle="Newest open tasks"
          loading={tasksLoading}
          delay={0.5}
          className="min-h-[380px]"
        >
          {recentTasks.length > 0 ? (
            <div className="flex flex-col gap-4 mt-2 max-h-[280px] overflow-y-auto pr-2">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center gap-4 p-3 rounded-xl border border-black/5 bg-white/40 hover:bg-white/60 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-sage-light/20 flex shrink-0 items-center justify-center text-sage-dark font-bold text-lg shadow-sm">
                    {task.title?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-semibold text-charcoal truncate">{task.title}</h4>
                    <p className="text-xs text-text-muted truncate">{task.budget} EGP • {task.location}</p>
                  </div>
                  <div className="text-xs font-medium text-charcoal bg-black/5 px-2 py-1 rounded-md whitespace-nowrap">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-muted">
              No recent tasks found.
            </div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

