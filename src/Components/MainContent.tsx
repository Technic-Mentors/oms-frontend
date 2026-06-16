import { BsBoxes } from "react-icons/bs";
import {
  RiImage2Fill,
  RiCopperCoinFill,
  RiShoppingBag3Fill,
  RiShieldCheckFill,
  RiBankFill,
} from "react-icons/ri";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/Hooks";
import { navigationStart, navigationSuccess } from "../redux/NavigationSlice";
import axios from "axios";
import { BASE_URL } from "../Content/URL";
import { OptionField } from "./InputFields/OptionField";
import { InputField } from "./InputFields/InputField";
import { Columns } from "./MenuCards/Colums";
import Card from "./DetailCards/Card";
import { toast } from "react-toastify";
import { Shapes, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CategoryT = { id: number; categoryName: string };

type ExpenseT = {
  id: number;
  expenseName: string ;
  categoryName: string;
  date: string;
  amount: number | string;
};

type UserT = {
  id: number;
  name?: string;
  email?: string;
  loginStatus: "Y" | "N";
  date?: string;
};

type TodoT = {
  id: number;
  employee_id: number;
  employeeName?: string;
  name: string;
  task: string;
  startDate: string;
  endDate: string;
  completionStatus: string;
  todoStatus: "Y" | "N";
  note: string;
  deadline: string;
};

type completionStatus = "New" | "Working" | "Completed";

type ProjectT = {
  id: string;
  projectName: string;
  completionStatus: completionStatus;
  projectCategory: string;
  startDate?: string;
  endDate?: string;
};

type SaleT = {
  id: number;
  invoiceNo: number;
  projectId: number;
  projectName: string;
  customerId: number;
  customerName: string;
  saleDate: string;
  QTY: number;
  UnitPrice: number;
};

type AllcustomerT = {
  id: number;
  customerStatus: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  companyName: string;
  companyAddress: string;
};

type AssetType = {
  id: number;
  asset_name: string;
  category_name: string;
  category_id?: string;
  description?: string;
  date?: string;
};

type AccountEntry = {
  id: number;
  debit: number;
  credit: number;
  payment_date: string;
};

type CustomerAccountEntry = {
  id: number;
  invoiceNo?: string;
  refNo: string;
  debit: number;
  credit: number;
  paymentMethod: string;
  paymentDate: string;
};

type SupplierAccountEntry = {
  id: number;
  invoiceNo?: string;
  refNo: string;
  debit: number;
  credit: number;
  paymentMethod: string;
  paymentDate: string;
};

type ProfitChartData = {
  name: string;
  profit: number;
};

type AttendanceT = {
  attendanceStatus: "Present" | "Absent" | "Leave";
};

type AttendanceChartT = {
  name: string;
  value: number;
  color: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const columsData = [
  { id: "New", title: "New Project" },
  { id: "Working", title: "Working Project" },
  { id: "Completed", title: "Completed Project" },
];

export const MainContent = () => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const dispatch = useAppDispatch();
  const token = currentUser?.token;

  const [allUsers, setAllUsers] = useState<UserT[]>([]);
  const [allCategory, setAllCategory] = useState<CategoryT[] | null>(null);
  const [allAssignProjects, setAllAssignProjects] = useState<ProjectT[]>([]);
  const [allTodos, setAllTodos] = useState<TodoT[]>([]);
  const [allExpenses, setAllExpenses] = useState<ExpenseT[]>([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState([]);
  const [allSales, setAllSales] = useState<SaleT[]>([]);
  const [allCustomers, setAllCustomers] = useState<AllcustomerT[]>([]);
  const [allAssets, setAllAssets] = useState<AssetType[]>([]);
  const [employeeAccounts, setEmpAccounts] = useState<AccountEntry[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<
    CustomerAccountEntry[]
  >([]);
  const [supplierAccounts, setSupplierAccounts] = useState<
    SupplierAccountEntry[]
  >([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceChartT[]>([]);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    categoryName: "",
    fromDate: "",
    toDate: "",
  });

  const getAllUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res?.data?.users);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleGetAssignProjects = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getProjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedProjects: ProjectT[] = res.data.map((p: ProjectT) => ({
        id: String(p.id),
        projectName: p.projectName,
        completionStatus: p.completionStatus,
        projectCategory: p.projectCategory,
        startDate: p.startDate,
        endDate: p.endDate,
      }));

      setAllAssignProjects(formattedProjects);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handlegetTodos = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getTodos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllTodos(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleGetExpenseCategory = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getExpenseCategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenseCategory(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleGetExpenses = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getExpense`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllExpenses(res.data.data);
    } catch (error) {
      console.log("Error fetching expenses:", error);
    }
  }, [token]);

  const handleGetTotalExpense = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getTotalExpense`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalExpenseAmount(Number(res.data.totalExpense));
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleGetProjectsCategory = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getCategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCategory(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleGetSales = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getSales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllSales(res.data);
    } catch (error) {
      console.log("Error fetching sales:", error);
    }
  }, [token]);

  const handleGetAllCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getAllCustomers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCustomers(res.data);
    } catch (error) {
      console.log("Error fetching customers:", error);
    }
  }, [token]);

  const handleGetAssets = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/assets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllAssets(res.data);
    } catch (error) {
      console.log("Failed to fetch assets for dashboard", error);
    }
  }, [token]);

  const getAttendanceStats = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getAllAttendances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: AttendanceT[] = res.data;

      const present = data.filter(
        (a) => a.attendanceStatus === "Present",
      ).length;
      const absent = data.filter((a) => a.attendanceStatus === "Absent").length;
      const leave = data.filter((a) => a.attendanceStatus === "Leave").length;

      setAttendanceData([
        { name: "Present", value: present, color: "#4cd47e" },
        { name: "Absent", value: absent, color: "#d84343" },
        { name: "Leave", value: leave, color: "#f59e0b" },
      ]);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  const totalAttendance = attendanceData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const presentValue =
    attendanceData.find((a) => a.name === "Present")?.value || 0;

  const presentPercent = totalAttendance
    ? Math.round((presentValue / totalAttendance) * 100)
    : 0;

  const getEmployeeAccounts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/getAllEmployeeAccounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEmpAccounts(res.data.accounts || []);
    } catch (error) {
      console.error("Emp Accounts fetch error", error);
    }
  }, [token]);

  const getCustomerAccounts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/getAllCustomerAccounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCustomerAccounts(res.data || []);
    } catch (error) {
      console.error("Customer Accounts fetch error", error);
    }
  }, [token]);

  const getSupplierAccounts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/getAllSupplierAccounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSupplierAccounts(res.data || []);
    } catch (error) {
      console.error("Supplier Accounts fetch error", error);
    }
  }, [token]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const newStatus = destination.droppableId as completionStatus;

    const previousProjects = [...allAssignProjects];

    setAllAssignProjects((prev) =>
      prev.map((project) =>
        project.id === draggableId
          ? { ...project, completionStatus: newStatus }
          : project,
      ),
    );

    try {
      await axios.patch(
        `${BASE_URL}/api/admin/updateProjectStatus/${draggableId}`,
        { completionStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Drag & Drop update failed:", error);
      setAllAssignProjects(previousProjects);
      toast.error("Failed to sync project status. Reverting...");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.title = "(OMS) Admin Dashboard";
    dispatch(navigationStart());
    setTimeout(() => dispatch(navigationSuccess("logIn")), 1000);
  }, [dispatch]);

  useEffect(() => {
    getAllUsers();
    handleGetAssignProjects();
    handlegetTodos();
    handleGetTotalExpense();
    handleGetExpenseCategory();
    handleGetProjectsCategory();
    handleGetSales();
    handleGetAllCustomers();
    handleGetAssets();
    handleGetExpenses();
    getEmployeeAccounts();
    getCustomerAccounts();
    getSupplierAccounts();
    getAttendanceStats();
  }, [
    getAllUsers,
    handleGetAssignProjects,
    handlegetTodos,
    handleGetTotalExpense,
    handleGetExpenseCategory,
    handleGetProjectsCategory,
    handleGetSales,
    handleGetAllCustomers,
    handleGetAssets,
    handleGetExpenses,
    getEmployeeAccounts,
    getCustomerAccounts,
    getSupplierAccounts,
    getAttendanceStats,
  ]);

  const activeUsers = allUsers.filter((user) => user.loginStatus === "Y");

  const today = new Date();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);

  const usersThisWeek = allUsers.filter((user) => {
    if (!user.date) return false;
    const d = new Date(user.date);
    return d >= startOfWeek;
  }).length;

  const usersLastWeek = allUsers.filter((user) => {
    if (!user.date) return false;
    const d = new Date(user.date);
    return d >= startOfLastWeek && d <= endOfLastWeek;
  }).length;

  const userGrowth =
    usersLastWeek === 0
      ? 100
      : Math.round(((usersThisWeek - usersLastWeek) / usersLastWeek) * 100);

  const activeTodos = allTodos.filter((todo) => todo.todoStatus === "Y");

  const latestTodo = activeTodos.length > 0 ? activeTodos[0] : null;

  const filteredProjects = allAssignProjects.filter((project) => {
    const matchesCategory =
      !formData.categoryName ||
      project.projectCategory === formData.categoryName;

    let matchesDate = true;

    if (formData.fromDate && formData.toDate) {
      const projectDate = project.startDate
        ? new Date(project.startDate)
        : null;
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (projectDate) {
        matchesDate = projectDate >= start && projectDate <= end;
      } else {
        matchesDate = false;
      }
    }

    return matchesCategory && matchesDate;
  });

  const projectStatusData = [
    {
      name: "New",
      value: allAssignProjects.filter((p) => p.completionStatus === "New")
        .length,
      color: "#93c5fd",
    },
    {
      name: "Working",
      value: allAssignProjects.filter((p) => p.completionStatus === "Working")
        .length,
      color: "#3b82f6", // Orange
    },
    {
      name: "Completed",
      value: allAssignProjects.filter((p) => p.completionStatus === "Completed")
        .length,
      color: "#16a34a", // Soft Pink/Coral
    },
  ];

  const trendData = useMemo(() => {
    const months: Record<
      string,
      { sales: number; expenses: number; sortKey: string; label: string }
    > = {};

    const processData = (
      dateStr: string,
      amount: number,
      type: "sales" | "expenses",
    ) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = date.getMonth();
      const sortKey = `${year}-${String(month + 1).padStart(2, "0")}`;

      const label = date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!months[sortKey]) {
        months[sortKey] = { sales: 0, expenses: 0, sortKey, label };
      }

      months[sortKey][type] += amount;
    };

    allSales.forEach((sale) => {
      const amount = (sale.QTY || 0) * (sale.UnitPrice || 0);
      processData(sale.saleDate, amount, "sales");
    });

    allExpenses.forEach((exp) => {
      processData(exp.date, Number(exp.amount) || 0, "expenses");
    });

    return Object.keys(months)
      .sort()
      .map((key) => ({
        name: months[key].label,
        sales: months[key].sales,
        expenses: months[key].expenses,
      }));
  }, [allSales, allExpenses]);

  const profitLossTrend = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};

    const addAmount = (dateStr: string, amount: number) => {
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      // Month-based key (e.g., "2026-01") taaki sorting sahi rahay
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!map[key]) {
        map[key] = { income: 0, expense: 0 };
      }

      if (amount >= 0) {
        map[key].income += amount;
      } else {
        map[key].expense += Math.abs(amount);
      }
    };

    // 1. Data Processing
    allSales.forEach((s) => addAmount(s.saleDate, s.QTY * s.UnitPrice));
    allExpenses.forEach((e) => addAmount(e.date, -Number(e.amount)));

    employeeAccounts.forEach((a) => {
      addAmount(a.payment_date, Number(a.debit || 0));
      addAmount(a.payment_date, -Number(a.credit || 0));
    });

    customerAccounts.forEach((a) => {
      addAmount(a.paymentDate, Number(a.debit || 0));
      addAmount(a.paymentDate, -Number(a.credit || 0));
    });

    supplierAccounts.forEach((a) => {
      addAmount(a.paymentDate, Number(a.debit || 0));
      addAmount(a.paymentDate, -Number(a.credit || 0));
    });

    // 2. Format for Recharts
    return Object.keys(map)
      .sort() // Monthly order ensure karne ke liye
      .map((key): ProfitChartData => {
        const [year, month] = key.split("-");
        // Display Name: "Jan" or "Jan 26"
        const name = new Date(Number(year), Number(month) - 1).toLocaleString(
          "default",
          {
            month: "short",
          },
        );

        return {
          name: name, // Ye XAxis dataKey="name" se link hoga
          profit: map[key].income - map[key].expense,
        };
      });
  }, [
    allSales,
    allExpenses,
    employeeAccounts,
    customerAccounts,
    supplierAccounts,
  ]);

  const revenueGrowth = useMemo(() => {
    if (trendData.length < 2) return 0;

    const currentMonth = trendData[trendData.length - 1];
    const previousMonth = trendData[trendData.length - 2];

    const currentProfit = currentMonth.sales - currentMonth.expenses;
    const previousProfit = previousMonth.sales - previousMonth.expenses;

    if (previousProfit === 0) return currentProfit > 0 ? 100 : 0;

    const growth =
      ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100;
    return parseFloat(growth.toFixed(2));
  }, [trendData]);

  const totalProjects = allAssignProjects.length;

  const newProjects = allAssignProjects.filter(
    (p) => p.completionStatus === "New",
  ).length;

  const workingProjects = allAssignProjects.filter(
    (p) => p.completionStatus === "Working",
  ).length;

  const completeProjects = allAssignProjects.filter(
    (p) => p.completionStatus === "Completed",
  ).length;

  const newPercent = totalProjects ? (newProjects / totalProjects) * 100 : 0;
  const workingPercent = totalProjects
    ? (workingProjects / totalProjects) * 100
    : 0;
  const completePercent = totalProjects
    ? (completeProjects / totalProjects) * 100
    : 0;

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isProfit = value >= 0;

      return (
        <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-lg">
          <p className="text-#60A5FA font-semibold  mb-1">{label}</p>
          <p className={isProfit ? "text-green-500" : "text-red-500"}>
            {isProfit ? "Profit: " : "Loss: "}
            {isProfit ? value : Math.abs(value)}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4 auto-rows-fr">
        {/* 1. EMPLOYEES - Sparkline */}

        <div
          onClick={() => navigate("/people?tab=EMPLOYEES")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Employees"
            totalNumber={activeUsers.length}
            footer={
              <div className="flex flex-col items-center w-full relative">
                {/* Fixed height container (h-10) ensures the Div size NEVER changes, 
         even if we make the icon huge.
      */}
                <div
                  className={`flex items-center justify-center h-10 w-full mb-1 ${
                    userGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {userGrowth >= 0 ? (
                    <TrendingUp
                      size={48}
                      strokeWidth={2}
                      className="opacity-80"
                    />
                  ) : (
                    <TrendingDown
                      size={48}
                      strokeWidth={2}
                      className="opacity-80"
                    />
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold ${
                    userGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {userGrowth >= 0 ? "+" : ""}
                  {userGrowth}%
                  <span className="text-slate-400 font-medium ml-1">
                    vs last week
                  </span>
                </span>
              </div>
            }
          />
        </div>

        {/* 2. PROJECTS - Progress Bar */}
        <div
          onClick={() => navigate("/projects")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Projects"
            totalNumber={allAssignProjects.length}
            footer={
              <div className="w-full space-y-2">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="bg-blue-300"
                    style={{ width: `${newPercent}%` }}
                  />

                  <div
                    className="bg-blue-500"
                    style={{ width: `${workingPercent}%` }}
                  />

                  <div
                    className="bg-green-600"
                    style={{ width: `${completePercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[8px] font-bold text-slate-400">
                  <span className="text-blue-300">● New</span>
                  <span className="text-blue-500">● Working</span>
                  <span className="text-green-600">● Completed</span>
                </div>
              </div>
            }
          />
        </div>

        {/* 3. TO DO - Task Label */}
        <div
          onClick={() => navigate("/performance")}
          className="group cursor-pointer"
        >
          <Card
            titleName="To Do"
            totalNumber={activeTodos.length}
            footer={
              <div className="text-center">
                <p className="text-[9px] text-slate-400 font-medium">
                  Latest Task:
                </p>

                <p className="text-[10px] font-bold text-slate-800 truncate">
                  {latestTodo ? latestTodo.task : "No Tasks"}
                </p>
              </div>
            }
          />
        </div>

        {/* 4. CATEGORIES - Icon Row */}
        <div
          onClick={() => navigate("/expenses?tab=CATEGORY")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Categories"
            totalNumber={expenseCategory.length}
            footer={
              <div className="flex gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                  <RiBankFill size={14} />
                </div>
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
                  <RiShieldCheckFill size={14} />
                </div>
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md">
                  <RiShoppingBag3Fill size={14} />
                </div>
              </div>
            }
          />
        </div>

        {/* 5. EXPENSES - Colored Chart Card */}
        <div
          onClick={() => navigate("/expenses")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Expenses"
            isCurrency
            totalNumber={totalExpenseAmount}
            footer={
              <div className="w-full">
                <p className="text-[8px] text-black mb-1">
                  {totalExpenseAmount.toLocaleString()}
                </p>
                <svg className="w-full h-6" viewBox="0 0 100 30">
                  <path
                    d="M0 25 L 20 20 L 40 28 L 60 15 L 80 20 L 100 10"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            }
          />
        </div>

        {/* 6. SALES - Bar Chart */}
        <div
          onClick={() => navigate("/sales?tab=SALE")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Sales"
            totalNumber={allSales.length}
            footer={
              <div className="flex items-end justify-center gap-1 h-8 w-full">
                {[30, 60, 40, 90, 50, 70, 40].map((h, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 w-1.5 rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            }
          />
        </div>

        {/* 7. CUSTOMERS - Avatars */}
        <div
          onClick={() => navigate("/people?tab=CUSTOMERS")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Customers"
            totalNumber={allCustomers.length}
            footer={
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white bg-slate-300 overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i}`}
                      alt="user"
                    />
                  </div>
                ))}
              </div>
            }
          />
        </div>

        {/* 8. ASSETS - Green Icon Card */}
        <div
          onClick={() => navigate("/assets")}
          className="group cursor-pointer"
        >
          <Card
            titleName="Assets"
            totalNumber={allAssets.length}
            footer={
              <div className="flex gap-2 text-emerald-700">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                  <RiCopperCoinFill size={16} />
                </div>
                <div className="p-1.5 bg-blue-100 text-green-600 rounded-md">
                  <RiImage2Fill size={16} />
                </div>
                <div className="p-1.5 bg-blue-100 text-orange-600 rounded-md">
                  <BsBoxes size={16} />
                </div>
              </div>
            }
          />
        </div>
      </div>

      <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Projects</h2>
        </div>

        <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <form
            className="flex flex-col md:flex-row items-end gap-4 w-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex-1 min-w-0 w-full">
              <OptionField
                labelName="CATEGORY"
                name="categoryName"
                icon={<Shapes className="w-4 h-4 text-black" />}
                handlerChange={handleChange}
                value={formData.categoryName}
                optionData={allCategory?.map((category) => ({
                  id: category.id,
                  label: category.categoryName,
                  value: category.categoryName,
                }))}
                inital="All Categories"
              />
            </div>

            <div className="flex-1 min-w-0 text-black w-full">
              <InputField
                type="date"
                className="[color-scheme:light] ..."
                labelName="FROM"
                name="fromDate"
                icon={<Calendar className="w-4 h-4 text-black" />}
                value={formData.fromDate}
                handlerChange={handleChange}
              />
            </div>

            <div className="flex-1 min-w-0 text-black w-full">
              <InputField
                type="date"
                className="[color-scheme:light] ..."
                labelName="TO"
                name="toDate"
                icon={<Calendar className="w-4 h-4 text-black" />}
                value={formData.toDate}
                handlerChange={handleChange}
              />
            </div>
          </form>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-6">
            {columsData.map((column) => (
              <div key={column.id} className="min-h-[400px]">
                <Columns
                  colum={column}
                  allProject={filteredProjects.filter(
                    (project) => project.completionStatus === column.id,
                  )}
                />
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Profit Loss Trend Chart */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Attendance Pie */}
        {/* ATTENDANCE SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Attendance Trend
          </h2>

          <div className="flex flex-col items-center">
            {/* DONUT CHART CONTAINER */}
            <div className="relative w-48 h-48 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%" // Slightly thinner donut
                    outerRadius="90%"
                    paddingAngle={2} // Adds small gaps between segments
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* CENTER TEXT OVERLAY */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-extrabold text-slate-800">
                  {presentPercent}%
                </p>
                <p className="text-slate-400 text-sm font-medium">Attendance</p>
              </div>
            </div>

            {/* DATA LIST GRID (Matching your reference image) */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-md">
              {attendanceData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700">
                      {item.name}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {item.value}%
                    </span>
                  </div>
                  {/* Progress Bar under the text */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Profitability Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-black font-semibold mb-4">Profitability Trend</h2>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitLossTrend}>
                <defs>
                  <linearGradient
                    id="profitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#profitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Expenses Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4">
            Financial Overview: Sales vs Expenses Trend
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  {/* Sales: Ab ise Green karein */}
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>

                  {/* Expenses: Ab ise Red karein */}
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#8b7464" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    color: "#1e293b",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{
                    color: "#1e293b",
                    marginBottom: "4px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#1ecc92" // Green for Sales
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444" // Red for Expenses
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 mb-4">
            Project Status Distribution
          </h2>
          <div className="w-full h-[260px] sm:h-[300px] md:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  dataKey="value"
                  label
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profit & Loss Overview (Bar Chart) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Revenue Overview
            </h2>
            <p
              className={`text-sm flex items-center gap-1 ${revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}
              {revenueGrowth >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="text-slate-400">last month</span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-300 rounded-sm"></div> Expense
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Income
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  backgroundColor: "#fff", // Ensure background is solid
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#334155", fontWeight: "bold" }} // This fixes the "blur"
                itemStyle={{ fontSize: "14px" }}
              />
              <Bar
                dataKey="expenses"
                fill="#93c5fd" // Light Blue
                radius={[4, 4, 0, 0]}
                barSize={12}
                name="Expense"
              />
              <Bar
                dataKey="sales"
                fill="#2563eb" // Deep Blue (Income)
                radius={[4, 4, 0, 0]}
                barSize={12}
                name="Income"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
