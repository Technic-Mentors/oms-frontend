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
    icon: <FaLaptopCode size={20} className="text-indigo-600" />,
    iconBg: "bg-indigo-50",
    path: "/user/reports",
  },
  {
    key: "holidays",
    titleName: "Holidays",
    icon: <FaCalendarCheck size={20} className="text-yellow-600" />,
    iconBg: "bg-yellow-50",
    path: "/user/reports",
  },
  {
    key: "presents",
    titleName: "Present",
    icon: <HiUserGroup size={20} className="text-green-600" />,
    iconBg: "bg-green-50",
    path: "/user/reports",
  },
  {
    key: "absents",
    titleName: "Absent / Leave",
    icon: <FaUserSlash size={20} className="text-orange-600" />,
    iconBg: "bg-orange-50",
    path: "/users/leaveRequests",
  },
  {
    key: "totalTodos",
    titleName: "Todos",
    icon: <RiFileList3Fill size={20} className="text-fuchsia-600" />,
    iconBg: "bg-fuchsia-50",
    path: "/users/todo",
  },
  {
    key: "totalProgress",
    titleName: "Progress",
    icon: <AiFillEdit size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-50",
    path: "/users/progress",
  },
];

const getDeadlineStyle = (deadline: string) => {
  const d = new Date(deadline);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / 86400000;
  if (diff < 0) return "bg-red-50 text-red-700";
  if (diff < 5) return "bg-amber-50 text-amber-800";
  return "bg-green-50 text-green-700";
};

const getPriorityStyle = (priority?: string) => {
  if (priority === "High") return "bg-red-50 text-red-700";
  if (priority === "Medium") return "bg-amber-50 text-amber-800";
  return "bg-green-50 text-green-700";
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
    if (!token || !userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, todoRes, projRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/user/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/user/getTodo/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/user/getMyAssignProjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDashboardData(dashRes.data);
        setTodos(todoRes.data || []);
        setProjects(projRes.data || []);
        await fetchAttendanceTrend();
      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, userId, fetchAttendanceTrend]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full overflow-y-auto">
      <div className="flex-grow px-3 md:px-8 py-6 space-y-6 mx-auto w-full max-w-screen-xl">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">{today}</p>
          </div>
          {initials && (
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold flex items-center justify-center select-none">
              {initials}
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CARD_CONFIG.map((card) => (
            <div
              key={card.key}
              onClick={() => card.path && navigate(card.path)}
              className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-gray-200 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <div className="text-2xl font-semibold text-slate-800 leading-none mb-1">
                {dashboardData[card.key as keyof DashboardDataT]}
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                {card.titleName}
              </div>
            </div>
          ))}
        </div>

        {/* Attendance chart */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Monthly Attendance Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Attendance % over the last 12 months</p>
            </div>
            {avgAttendance !== null && (
              <span className="text-sm font-semibold text-indigo-600">{avgAttendance}% avg</span>
            )}
          </div>
          <div className="px-4 pt-4 pb-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={attendanceTrendData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
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
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    fontSize: "12px",
                  }}
                  formatter={(value: ValueType | undefined) => {
                    const numericValue = typeof value === "number" ? value : 0;
                    return [`${numericValue}%`, "Attendance"] as [string, string];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPercentage)"
                  dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Todo List */}
          <div className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <RiFileList3Fill size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">Todo List</span>
              </div>
              {!loading && (
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
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
                <div className="space-y-2 animate-pulse mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-50 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div>
                  {todos.slice(-5).map((todo, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none"
                    >
                      <p className="text-sm text-slate-700 font-medium truncate max-w-[65%]">
                        {todo.task}
                      </p>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getDeadlineStyle(todo.deadline)}`}
                      >
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
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors py-2.5 rounded-xl"
              >
                View all todos <FaArrowRightLong size={13} />
              </button>
            </div>
          </div>

          {/* Assigned Projects */}
          <div className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <FaTasks size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">Assigned Projects</span>
              </div>
              {!loading && (
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
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
                <div className="space-y-2 animate-pulse mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-50 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div>
                  {projects.slice(0, 5).map((proj, i) => (
                    <div
                      key={proj.id || i}
                      className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">
                          {proj.projectName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(proj.date).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      {proj.priority && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ml-3 shrink-0 ${getPriorityStyle(proj.priority)}`}
                        >
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
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors py-2.5 rounded-xl"
              >
                Project details <RiExternalLinkLine size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};