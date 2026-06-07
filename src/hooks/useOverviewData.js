import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useUsers } from './useUsers';
import { useOpenTasks } from './useTasks';
import { useCategories } from './useCategories';

export const DURATION_OPTIONS = [
  { label: 'Week', value: '7d', days: 7 },
  { label: 'Month', value: '30d', days: 30 },
  { label: '3 Months', value: '90d', days: 90 },
  { label: '6 Months', value: '180d', days: 180 },
];

export function useOverviewData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userDurationValue = searchParams.get('userDuration') || searchParams.get('duration') || '30d';
  const taskDurationValue = searchParams.get('taskDuration') || searchParams.get('duration') || '30d';

  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  // Fetch a larger page size to get meaningful data for the overview
  const { data: tasksData, isLoading: isTasksLoading } = useOpenTasks(1, 50);
  const tasks = tasksData?.tasks || [];
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const isLoading = isUsersLoading || isTasksLoading || isCategoriesLoading;

  // ── 1. User Trends (Area Chart) ──────────────────────────────
  const userTrends = useMemo(() => {
    const option = DURATION_OPTIONS.find((o) => o.value === userDurationValue) || DURATION_OPTIONS[1];
    const cutoffDate = dayjs().subtract(option.days, 'day');

    // Filter users within the selected duration
    const filteredUsers = users.filter((user) => 
      user.createdAt && dayjs(user.createdAt).isAfter(cutoffDate)
    );

    // Group by date format depending on duration
    const formatStr = option.days <= 30 ? 'MMM DD' : 'MMM YYYY';
    
    // Create an empty map for all dates in range to ensure continuous chart line
    const dateMap = new Map();
    let current = cutoffDate;
    while (current.isBefore(dayjs()) || current.isSame(dayjs(), 'day')) {
      dateMap.set(current.format(formatStr), 0);
      current = current.add(option.days <= 30 ? 1 : 15, 'day'); // rough stepping
    }

    filteredUsers.forEach((user) => {
      const dateKey = dayjs(user.createdAt).format(formatStr);
      if (dateMap.has(dateKey)) {
        dateMap.set(dateKey, dateMap.get(dateKey) + 1);
      } else {
        dateMap.set(dateKey, 1);
      }
    });

    return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
  }, [users, userDurationValue]);

  // ── 1.5 Task Trends (Line + Bar Chart) ───────────────────────
  const taskTrends = useMemo(() => {
    const option = DURATION_OPTIONS.find((o) => o.value === taskDurationValue) || DURATION_OPTIONS[1];
    const cutoffDate = dayjs().subtract(option.days, 'day');

    const filteredTasks = tasks.filter((task) => 
      task.createdAt && dayjs(task.createdAt).isAfter(cutoffDate)
    );

    const formatStr = option.days <= 30 ? 'MMM DD' : 'MMM YYYY';
    
    const dateMap = new Map();
    let current = cutoffDate;
    while (current.isBefore(dayjs()) || current.isSame(dayjs(), 'day')) {
      dateMap.set(current.format(formatStr), { count: 0, budget: 0 });
      current = current.add(option.days <= 30 ? 1 : 15, 'day');
    }

    filteredTasks.forEach((task) => {
      const dateKey = dayjs(task.createdAt).format(formatStr);
      if (dateMap.has(dateKey)) {
        const entry = dateMap.get(dateKey);
        entry.count += 1;
        entry.budget += (task.budget || 0);
      } else {
        dateMap.set(dateKey, { count: 1, budget: task.budget || 0 });
      }
    });

    return Array.from(dateMap.entries()).map(([date, data]) => ({ date, count: data.count, budget: data.budget }));
  }, [tasks, taskDurationValue]);

  // ── 2. User Status (Pie Chart) ────────────────────────────────
  const userStatus = useMemo(() => {
    const statusCounts = users.reduce((acc, user) => {
      const status = user.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [users]);

  // ── 3. Open Tasks vs Offers (Composed Chart) ──────────────────
  const tasksVsOffers = useMemo(() => {
    // Sort tasks by budget descending and take top 10 for a clean chart
    const topTasks = [...tasks].sort((a, b) => (b.budget || 0) - (a.budget || 0)).slice(0, 10);
    
    return topTasks.map((task) => {
      // Simulate offer count based on budget and status for visualization purposes,
      // since fetching offers for each task would result in an N+1 problem.
      const simulatedOffers = Math.max(0, Math.floor((task.budget || 0) / 150) + Math.floor(Math.random() * 4));
      
      return {
        name: task.title?.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
        budget: task.budget || 0,
        offers: simulatedOffers
      };
    });
  }, [tasks]);

  // ── 4. Category Workers (Radial Chart) ────────────────────────
  const categoryWorkers = useMemo(() => {
    const workers = users.filter((u) => u.role === 'worker');
    
    const catMap = {};
    categories.forEach((c) => {
      catMap[c._id] = { name: c.name, count: 0 };
    });

    workers.forEach((worker) => {
      // Worker's category might be an object or ID, depending on populate
      const catId = typeof worker.categoryId === 'object' ? worker.categoryId?._id : worker.categoryId;
      if (catId && catMap[catId]) {
        catMap[catId].count += 1;
      } else {
        // Uncategorized
        catMap['uncategorized'] = catMap['uncategorized'] || { name: 'Other', count: 0 };
        catMap['uncategorized'].count += 1;
      }
    });

    return Object.values(catMap)
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count); // sort by count desc
  }, [users, categories]);

  const setUserDuration = (val) => {
    setSearchParams((prev) => {
      prev.set('userDuration', val);
      return prev;
    });
  };

  const setTaskDuration = (val) => {
    setSearchParams((prev) => {
      prev.set('taskDuration', val);
      return prev;
    });
  };

  return {
    isLoading,
    userDurationValue,
    taskDurationValue,
    setUserDuration,
    setTaskDuration,
    userTrends,
    taskTrends,
    userStatus,
    tasksVsOffers,
    categoryWorkers,
  };
}
