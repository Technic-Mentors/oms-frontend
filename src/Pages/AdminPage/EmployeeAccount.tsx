import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import { ShowDataNumber } from "../../Components/Pagination/ShowDataNumber";
import { Pagination } from "../../Components/Pagination/Pagination";
import { ViewButton } from "../../Components/CustomButtons/ViewButton";
import { Loader } from "../../Components/LoaderComponent/Loader";

import { AddEmployeeAccount } from "../../Components/EmployeeAccountModal/AddEmployeeAccount";
import { ViewEmployeeAccount } from "../../Components/EmployeeAccountModal/ViewEmployeeAccount";

import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";

import { BASE_URL } from "../../Content/URL";
import { RiInboxArchiveLine } from "react-icons/ri";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  contact: string;
  loginStatus: "Y" | "N";
  role: "user" | "admin";
  image?: string;
};

type EmployeeAccountRow = {
  id: number;
  name: string;
  email: string;
  contact: string;
  image?: string;
};

interface EmployeeAccountProps {
  triggerModal: number;
  externalSearch: string;
  externalPageSize: number;
}

export const EmployeeAccount = ({
  triggerModal,
  externalSearch,
  externalPageSize,
}: EmployeeAccountProps) => {
  const { loader } = useAppSelector((state) => state.NavigateState);
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;

  const dispatch = useAppDispatch();

  const [isOpenModal, setIsOpenModal] = useState<"ADDACCOUNT" | "VIEW" | "">(
    "",
  );
  const [employees, setEmployees] = useState<EmployeeAccountRow[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeAccountRow | null>(null);

  const [pageNo, setPageNo] = useState(1);

// Replace existing handleToggleModal:
const handleToggleModal = useCallback((active: "ADDACCOUNT" | "VIEW" | "") => {
  setIsOpenModal(active);
}, []);

  const fetchEmployees = useCallback(async () => {
  if (!currentUser || employees.length > 0) return;

    try {
      if (currentUser.role === "admin") {
        const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
          headers: { Authorization: token },
        });

        const mapped: EmployeeAccountRow[] = (res.data.users as ApiUser[])
          .filter((u) => u.loginStatus === "Y" && u.role === "user")
          .map((u) => ({
            id: Number(u.id),
            name: u.name,
            email: u.email,
            contact: u.contact,
            image: u.image,
          }));

        setEmployees(mapped);
      } else {
        setEmployees([
          {
            id: Number(currentUser.id ?? 0),
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
            contact: currentUser.contact ?? "",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  }, [token, currentUser]);

useEffect(() => {
  document.title = "(OMS) EMPLOYEE ACCOUNT";
  dispatch(navigationSuccess("EMPLOYEE ACCOUNT"));
}, [dispatch]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

// Replace lines 94-96 with this:
useEffect(() => {
  if (triggerModal > 0) {
    setIsOpenModal("ADDACCOUNT");
  }
}, [triggerModal]);


  // Reset page on search/limit change
  useEffect(() => {
    setPageNo(1);
  }, [externalSearch, externalPageSize]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(externalSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(externalSearch.toLowerCase()),
  );

  const startIndex = (pageNo - 1) * externalPageSize;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + externalPageSize,
  );

  if (loader) return <Loader />;

  return (
    <div className="flex flex-col flex-grow bg-white overflow-hidden">
      <div className="overflow-auto px-3 sm:px-0">
        {/* Width increased to 1000px to match UsersDetails for the extra columns */}
        <div className="min-w-[1000px]">
          {/* Header aligned with UsersDetails grid */}
          <div className="px-0.5 pt-0.5">
            <div
              className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_auto] 
            bg-blue-400 text-white rounded-lg items-center font-bold
            text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm"
            >
              <span className="text-left">Sr#</span>
              <span className="text-left">Name</span>
              <span className="text-left">Email</span>
              <span className="text-left">Contact</span>
              <span className="text-left">Role</span>
              <span className="text-right w-[140px] pr-4">Actions</span>
            </div>
          </div>

          <div className="px-0.5 sm:px-1 py-2">
            {paginatedEmployees.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">No records available!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedEmployees.map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_auto]
                  items-center px-3 py-2 gap-3 text-sm bg-white 
                  border border-gray-100 rounded-lg 
                  hover:bg-blue-50/30 transition-colors shadow-sm"
                  >
                    <span className="text-gray-500 font-medium">
                      {startIndex + idx + 1}
                    </span>

                    {/* Profile Section - Icons Removed */}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-gray-800 text-sm">
                        {emp.name}
                      </span>
                    </div>

                    <div className="text-gray-600 truncate">{emp.email}</div>

                    <div className="text-gray-600 truncate">{emp.contact}</div>
                    <div className="text-gray-600 truncate">Employee</div>

                    {/* Action Buttons aligned with UsersDetails width */}
                    <div className="flex items-center justify-end gap-1 w-[140px] pr-5">
                
<ViewButton
  handleView={() => {
    setSelectedEmployee(emp);
    setIsOpenModal("VIEW");
  }}
/>
                      {/* Note: Added placeholder spacing to maintain alignment if 
                        EmployeeAccount only uses ViewButton while UsersDetails has three. */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-row items-center justify-between p-1">
        <ShowDataNumber
          start={filteredEmployees.length === 0 ? 0 : startIndex + 1}
          end={Math.min(
            startIndex + externalPageSize,
            filteredEmployees.length,
          )}
          total={filteredEmployees.length}
        />
          <Pagination
          pageNo={pageNo}
          totalNum={filteredEmployees.length}
          pageSize={externalPageSize}
          handlePageClick={(targetPage) => setPageNo(targetPage)}
        />
      </div>

      {/* Modals */}
      {isOpenModal === "ADDACCOUNT" && (
        <AddEmployeeAccount
          setModal={() => handleToggleModal("")}
          refreshData={fetchEmployees}
        />
      )}

      {isOpenModal === "VIEW" && selectedEmployee && (
        <ViewEmployeeAccount
          setModal={() => handleToggleModal("")}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};
