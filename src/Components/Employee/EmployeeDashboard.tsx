import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserSlash, FaCalendarCheck, FaTasks } from "react-icons/fa";
import { FaLaptopCode, FaArrowRightLong } from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi2";
import { RiFileList3Fill, RiExternalLinkLine } from "react-icons/ri";
import { AiFillEdit } from "react-icons/ai";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import { Footer } from "../../Components/Footer";
import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";
import { BASE_URL } from "../../Content/URL";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

declare const toast: {
  error?: (message: string) => void;
} | undefined;

type DashboardDataT = {
  workingDays: number;
  presents: number;
  absents: number;
  holidays: number;
  totalTodos: number;
  totalProgress: number;
};

interface TodoItem {
  task: string;
  deadline: string;
  subText?: string;
}

interface Project {
  id: string | number;
  projectName: string;
  date: string;
  priority?: "High" | "Medium" | "Low";
  assignedBy?: string;
}

interface AttendanceTrend {
  month: string;
  percentage: number;
}

interface AttendanceRecord {
  date: string;
  attendanceStatus: string;
}

const CARD_CONFIG = [
  {
    key: "workingDays",
    titleName: "Working Days",
    icon: <FaLaptopCode size={18} className="text-indigo-500" />,
    iconBg: "bg-indigo-50",
    ring: "group-hover:ring-indigo-200",
    path: "/user/reports",
  },
  {
    key: "holidays",
    titleName: "Holidays",
    icon: <FaCalendarCheck size={18} className="text-amber-500" />,
    iconBg: "bg-amber-50",
    ring: "group-hover:ring-amber-200",
    path: "/user/reports",
  },
  {
    key: "presents",
    titleName: "Present",
    icon: <HiUserGroup size={18} className="text-emerald-500" />,
    iconBg: "bg-emerald-50",
    ring: "group-hover:ring-emerald-200",
    path: "/user/reports",
  },
  {
    key: "absents",
    titleName: "Absent / Leave",
    icon: <FaUserSlash size={18} className="text-orange-500" />,
    iconBg: "bg-orange-50",
    ring: "group-hover:ring-orange-200",
    path: "/users/leaveRequests",
  },
  {
    key: "totalTodos",
    titleName: "Todos",
    icon: <RiFileList3Fill size={18} className="text-fuchsia-500" />,
    iconBg: "bg-fuchsia-50",
    ring: "group-hover:ring-fuchsia-200",
    path: "/users/todo",
  },
  {
    key: "totalProgress",
    titleName: "Progress",
    icon: <AiFillEdit size={18} className="text-cyan-500" />,
    iconBg: "bg-cyan-50",
    ring: "group-hover:ring-cyan-200",
    path: "/users/progress",
  },
];

const getDeadlineStyle = (deadline: string) => {
  const d = new Date(deadline);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / 86400000;
  if (diff < 0) return "bg-red-50 text-red-600 ring-1 ring-red-100";
  if (diff < 5) return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
};

const getPriorityStyle = (priority?: string) => {
  if (priority === "High") return "bg-red-50 text-red-600 ring-1 ring-red-100";
  if (priority === "Medium") return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
};

// Animated counter hook
const useCountUp = (target: number, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
};

// Skeleton shimmer
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

// Stat card with animated count
const StatCard = ({
  card,
  value,
  loading,
  index,
  onClick,
}: {
  card: typeof CARD_CONFIG[0];
  value: number;
  loading: boolean;
  index: number;
  onClick: () => void;
}) => {
  const count = useCountUp(loading ? 0 : value, 900 + index * 80);
  return (
    <div
      onClick={onClick}
      className="group bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 transition-all duration-300 ring-2 ring-transparent ${card.ring}`}
      >
        {card.icon}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-10 mb-1" />
      ) : (
        <div className="text-[26px] font-semibold text-slate-800 leading-none mb-1 tabular-nums">
          {count}
        </div>
      )}
      <div className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
        {card.titleName}
      </div>
    </div>
  );
};

export const EmployeeDashboard = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.officeState);
  const navigate = useNavigate();

  const token = currentUser?.token;
  const userId = currentUser?.userId;
  const userName = currentUser?.name || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const [dashboardData, setDashboardData] = useState<DashboardDataT>({
    workingDays: 0,
    presents: 0,
    absents: 0,
    holidays: 0,
    totalTodos: 0,
    totalProgress: 0,
  });

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendanceTrendData, setAttendanceTrendData] = useState<AttendanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const avgAttendance =
    attendanceTrendData.length > 0
      ? Math.round(
          attendanceTrendData.reduce((s, i) => s + i.percentage, 0) /
            attendanceTrendData.length
        )
      : null;

  const fetchAttendanceTrend = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/user/getMyAttendances`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: AttendanceRecord[] = res.data || [];
      const monthlyMap: Record<string, { total: number; present: number }> = {};
      data.forEach((item) => {
        const date = new Date(item.date);
        const month = date.toLocaleString("default", { month: "short" });
        if (!monthlyMap[month]) monthlyMap[month] = { total: 0, present: 0 };
        monthlyMap[month].total += 1;
        if (item.attendanceStatus === "Present") monthlyMap[month].present += 1;
      });
      const formatted = Object.keys(monthlyMap).map((month) => ({
        month,
        percentage: Math.round(
          (monthlyMap[month].present / monthlyMap[month].total) * 100
        ),
      }));
      setAttendanceTrendData(formatted);
    } catch (error) {
      console.error("Attendance Trend Error", error);
    }
  }, [token]);

  useEffect(() => {
    document.title = "(OMS) EMPLOYEE DASHBOARD";
    dispatch(navigationStart());
    setTimeout(() => dispatch(navigationSuccess("EMPLOYEE DASHBOARD")), 800);
  }, [dispatch]);

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        let dashData: Partial<DashboardDataT> = {};
        let todoData: TodoItem[] = [];
        let projData: Project[] = [];

        try {
          const dashRes = await axios.get(`${BASE_URL}/api/user/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          dashData = dashRes.data || dashData;
        } catch (dashError) {
          console.error("Dashboard API failed:", dashError);
        }

        try {
          const todoRes = await axios.get(`${BASE_URL}/api/user/getTodo/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          todoData = todoRes.data || [];
        } catch (todoError) {
          console.error("Todo API failed:", todoError);
          todoData = [];
        }

        try {
          const projRes = await axios.get(`${BASE_URL}/api/user/getMyAssignProjects`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          projData = projRes.data || [];
        } catch (projError) {
          console.error("Projects API failed:", projError);
          projData = [];
        }

        setDashboardData({
          workingDays: Number(dashData.workingDays ?? 0) || 0,
          presents: Number(dashData.presents ?? 0) || 0,
          absents: Number(dashData.absents ?? 0) || 0,
          holidays: Number(dashData.holidays ?? 0) || 0,
          totalTodos: Number(dashData.totalTodos ?? 0) || 0,
          totalProgress: Number(dashData.totalProgress ?? 0) || 0,
        });

        setTodos(todoData);
        setProjects(projData);
        await fetchAttendanceTrend();
      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast?.error?.("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      }
    };
    fetchData();
  }, [token, userId, fetchAttendanceTrend]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeSlideUp 0.45s ease both;
        }
        .fade-up-1 { animation-delay: 0ms; }
        .fade-up-2 { animation-delay: 80ms; }
        .fade-up-3 { animation-delay: 160ms; }
        .fade-up-4 { animation-delay: 240ms; }
      `}</style>

      <div className="flex flex-col min-h-screen bg-[#f8f9fb] w-full overflow-y-auto">
        <div className="flex-grow px-3 md:px-8 py-7 space-y-6 mx-auto w-full max-w-screen-xl">

          {/*Top bar-*/}
          <div className="fade-up fade-up-1 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                {userName ? `Hello, ${userName.split(" ")[0]} 👋` : "Dashboard"}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">{today}</p>
            </div>
      
          </div>

          {/* Stat cards */}
          <div className="fade-up fade-up-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CARD_CONFIG.map((card, i) => (
              <StatCard
                key={card.key}
                card={card}
                value={dashboardData[card.key as keyof DashboardDataT]}
                loading={loading}
                index={i}
                onClick={() => card.path && navigate(card.path)}
              />
            ))}
          </div>

          {/* Attendance chart */}
          <div className="fade-up fade-up-3 bg-white border border-gray-100 rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Monthly Attendance Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Attendance % over the last 12 months</p>
              </div>
              {avgAttendance !== null && (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-600">{avgAttendance}% avg</span>
                </div>
              )}
            </div>
            <div className="px-4 pt-4 pb-2 h-[260px]">
              {loading ? (
                <div className="flex items-end gap-2 h-full px-4 pb-4">
                  {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50, 88, 72].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-gray-100 relative overflow-hidden"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${i * 100}ms` }} />
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={attendanceTrendData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                        padding: "8px 14px",
                      }}
                      cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }}
                      formatter={(value: ValueType | undefined) => {
                        const numericValue = typeof value === "number" ? value : 0;
                        return [`${numericValue}%`, "Attendance"] as [string, string];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPercentage)"
                      dot={{ r: 3.5, fill: "#fff", stroke: "#6366f1", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom two cards */}
          <div className="fade-up fade-up-4 grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Todo List */}
            <div className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-fuchsia-50 flex items-center justify-center">
                    <RiFileList3Fill size={14} className="text-fuchsia-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Todo List</span>
                </div>
                {!loading && (
                  <span className="bg-fuchsia-50 text-fuchsia-700 text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-fuchsia-100">
                    {todos.length}
                  </span>
                )}
              </div>

              <div className="px-6 py-3 flex-grow">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-2 border-b border-gray-50 mb-1">
                  <span>Task</span>
                  <span>Deadline</span>
                </div>

                {loading ? (
                  <div className="space-y-2.5 mt-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : todos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <RiFileList3Fill size={32} />
                    <p className="text-xs mt-2 text-slate-400">No todos yet</p>
                  </div>
                ) : (
                  <div>
                    {todos.slice(-5).map((todo, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none group/row"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/row:bg-indigo-400 transition-colors shrink-0" />
                          <p className="text-sm text-slate-700 font-medium truncate max-w-[200px]">
                            {todo.task}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getDeadlineStyle(todo.deadline)}`}>
                          {todo.deadline}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-50">
                <button
                  onClick={() => navigate("/users/todo")}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-[0.98] transition-all duration-200 py-2.5 rounded-xl"
                >
                  View all todos <FaArrowRightLong size={13} />
                </button>
              </div>
            </div>

            {/* Assigned Projects */}
            <div className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <FaTasks size={13} className="text-cyan-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Assigned Projects</span>
                </div>
                {!loading && (
                  <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-cyan-100">
                    {projects.length}
                  </span>
                )}
              </div>

              <div className="px-6 py-3 flex-grow">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-2 border-b border-gray-50 mb-1">
                  <span>Project</span>
                  <span>Priority</span>
                </div>

                {loading ? (
                  <div className="space-y-2.5 mt-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <FaTasks size={30} />
                    <p className="text-xs mt-2 text-slate-400">No projects assigned</p>
                  </div>
                ) : (
                  <div>
                    {projects.slice(0, 5).map((proj, i) => (
                      <div
                        key={proj.id || i}
                        className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none group/row"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/row:bg-cyan-400 transition-colors shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm text-slate-700 font-medium truncate">
                              {proj.projectName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(proj.date).toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                        {proj.priority && (
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ml-3 shrink-0 ${getPriorityStyle(proj.priority)}`}>
                            {proj.priority}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-50">
                <button
                  onClick={() => navigate("/users/assignedprojects")}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 active:scale-[0.98] transition-all duration-200 py-2.5 rounded-xl"
                >
                  Project details <RiExternalLinkLine size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};