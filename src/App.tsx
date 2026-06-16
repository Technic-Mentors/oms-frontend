import {
  BrowserRouter as Routers,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { globalTabManager } from "./utils/tabManager";
import { Login } from "./Pages/Login";
import { AdminDashboard } from "./Pages/AdminDashboard";
import { UserDashboard } from "./Pages/UserDashboard";

import { PrivateLayout } from "./Components/HOC/PrivateLayout/PrivateLayout";
import { People } from "./Pages/AdminPage/People";
import { AttendanceHub } from "./Pages/AdminPage/AttendanceHub";
import { UserAttendanceHub } from "./Pages/AdminPage/UserAttendanceHub";
import { UserLeave } from "./Pages/AdminPage/UserLeave";
import { UserTodo } from "./Pages/AdminPage/UserTodo";
import { UserProgress } from "./Pages/AdminPage/UserProgress";

import { Assemble } from "./Pages/AdminPage/Assemble";
import { HumanResources } from "./Pages/AdminPage/HumanResources";
import { Projects } from "./Pages/AdminPage/Projects";

import { PerformanceHub } from "./Pages/AdminPage/PerformanceHub";
import { SalesHub } from "./Pages/AdminPage/SalesHub";
import { Payments } from "./Pages/AdminPage/Payments";
import { Expenditures } from "./Pages/AdminPage/Expenditures";
import { Wages } from "./Pages/AdminPage/Wages";
import { Summary } from "./Pages/AdminPage/Summary";

import { Profile } from "./Pages/AdminPage/Profile";
import { PrivateRoute } from "./Components/PrivateRouteHOC/PrivateRoute";
import { EmployeePrivateLayout } from "./Components/HOC/PrivateLayout/EmployeePrivateLayout";
import { EmployeeDashboard } from "./Components/Employee/EmployeeDashboard";

import { TalentAcquisition } from "./Pages/AdminPage/TalentAcquisition";

import { Propulsive } from "./Pages/AdminPage/Propulsive";

import { EmployeeProfile } from "./Pages/AdminPage/EmployeeProfile";
import { SystemUserProfile } from "./Pages/AdminPage/SystemUserProfile";
import { Capital } from "./Pages/AdminPage/Capital";

import { Ledgers } from "./Pages/AdminPage/Ledgers";

import { useAppSelector } from "./redux/Hooks";
import { UserAssignedProjects } from "./Pages/AdminPage/UserAssignedProjects";
import { UserPropulsive } from "./Pages/AdminPage/UserPropulsive";
import { UserSalary } from "./Pages/AdminPage/UserSalary";
import { UserPayroll } from "./Pages/AdminPage/UserPayroll";
import { UserReports } from "./Pages/AdminPage/UserReports";
import { UsersManagementHub } from "./Pages/AdminPage/UsersManagementHub";

function App() {
  const { currentUser } = useAppSelector((state) => state?.officeState);
  
  // Global tab change listener to fix modal auto-open issue
  useEffect(() => {
    // Listen for global tab changes
    const handleGlobalTabChange = () => {
      globalTabManager.resetAllTriggers();
    };

    // Listen for route changes (URL changes)
    const handleRouteChange = () => {
      globalTabManager.resetAllTriggers();
    };

    // Listen for clicks on tab elements globally
    const handleGlobalClick = (e: MouseEvent) => {  // ← ONLY CHANGE HERE
      // Check if clicked element is a tab or inside a tab container
      const target = e.target as HTMLElement;
      const tabElement = target.closest('[role="tab"], .tab-button, button');
      if (tabElement) {
        // Check if it's likely a tab button
        const el = tabElement as HTMLElement;
        const isTab = tabElement.getAttribute('role') === 'tab' ||
                     Boolean(tabElement.closest('[role="tablist"]')) ||
                     (el.className || '').includes('tab') ||
                     ['EMPLOYEES', 'CUSTOMERS', 'SUPPLIERS', 'LEAVE', 'ATTENDANCE'].some(
                       text => (el.innerText || el.textContent || '').toUpperCase().includes(text)
                     );
        
        if (isTab) {
          // Small delay to ensure state updates first
          setTimeout(() => {
            globalTabManager.resetAllTriggers();
          }, 10);
        }
      }
    };

    // Add event listeners
    window.addEventListener('globalTabChange', handleGlobalTabChange);
    window.addEventListener('popstate', handleRouteChange);
    document.addEventListener('click', handleGlobalClick);
    
    // Cleanup - remove event listeners
    return () => {
      window.removeEventListener('globalTabChange', handleGlobalTabChange);
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);
// Add this useEffect RIGHT AFTER your existing useEffect or before it
useEffect(() => {
  // Check system preference for dark mode
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Optional: Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
  return (
    <Routers>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route
            element={
              currentUser?.role !== "user" ? (
                <PrivateLayout />
              ) : (
                <Navigate to="/User/dashboard" />
              )
            }
          >
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/system-user/profile"
              element={<SystemUserProfile />}
            />
            <Route path="/people" element={<People />} />
            <Route path="/human-resources" element={<HumanResources />} />
            <Route path="/dynamics" element={<Propulsive />} />

            <Route path="/attendance" element={<AttendanceHub />} />
            <Route path="/assets" element={<Capital />} />
            <Route path="/accounts" element={<Ledgers />} />

            <Route path="/configuration" element={<Assemble />} />
            <Route path="/projects" element={<Projects />} />

            <Route path="/performance" element={<PerformanceHub />} />
            <Route path="/sales" element={<SalesHub />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/expenses" element={<Expenditures />} />
            <Route path="/payroll" element={<Wages />} />

            <Route path="/talent-acquisition" element={<TalentAcquisition />} />

            <Route path="/reports" element={<Summary />} />

            <Route path="/users-management" element={<UsersManagementHub />} />

            <Route
              path="/User/dashboard-admin-view"
              element={<UserDashboard />}
            />
          </Route>
          <Route
            element={
              currentUser?.role === "user" ? (
                <EmployeePrivateLayout />
              ) : (
                <Navigate to="/" />
              )
            }
          >
            <Route path="/User/dashboard" element={<EmployeeDashboard />} />
            <Route path="/user/profile" element={<EmployeeProfile />} />
            <Route path="/users/attendance" element={<UserAttendanceHub />} />
            <Route path="/users/leaveRequests" element={<UserLeave />} />
            <Route path="/user/dynamics" element={<UserPropulsive />} />

            <Route
              path="/users/assignedprojects"
              element={<UserAssignedProjects />}
            />
            <Route path="/users/todo" element={<UserTodo />} />
            <Route path="/users/progress" element={<UserProgress />} />
            <Route path="/user/payroll" element={<UserPayroll />} />
            <Route path="/user/salarydetail" element={<UserSalary />} />

            <Route path="/user/reports" element={<UserReports />} />
          </Route>
        </Route>
      </Routes>
    </Routers>
  );
}

export default App;