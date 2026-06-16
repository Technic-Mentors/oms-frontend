// Wages.tsx
import { useState } from "react";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";
import { useAppSelector } from "../../redux/Hooks";
import { Footer } from "../../Components/Footer";

// Import your tab components
import { Calendar } from "./Calendar";
import { SalaryCycle } from "./SalaryCycle";
import { OverTime } from "./OverTime";
// import { AdvanceSalary } from "./AdvanceSalary";
import { Loan } from "./Loan";
import { ConfigEmpSalary } from "./ConfigEmpSalary";

type TabType =
  | "CALENDAR"
  | "SALARY_CYCLE"
  | "OVERTIME"
  | "ADVANCE_SALARY"
  | "LOAN_MANAGEMENT"
  | "CONFIG_SALARIES";

const entriesOptions = [5, 10, 15, 20, 30];

export const Wages = () => {
  const [activeTab, setActiveTab] = useState<TabType>("CALENDAR");
  const { currentUser } = useAppSelector((state) => state.officeState);
  const isAdmin = currentUser?.role === "admin";

  // Lifted states for UI consistency with People.tsx
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);

  const [triggerModal, setTriggerModal] = useState<{
    tab: TabType;
    count: number;
  }>({
    tab: "CALENDAR",
    count: 0,
  });

  const [triggerActivateModal, setTriggerActivateModal] = useState(0);

  const handleActionClick = (tab: TabType) => {
    setTriggerModal((prev) => ({
      tab,
      count: prev.tab === tab ? prev.count + 1 : 1,
    }));
  };
const handleTabChange = (tab: TabType) => {
  setActiveTab(tab);
  setTriggerModal({ tab, count: 0 });
};
  const handleActivateClick = () => {
    setTriggerActivateModal((prev) => prev + 1);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "CALENDAR", label: "Calendar" },
    { id: "SALARY_CYCLE", label: "Salary Cycle" },
    { id: "OVERTIME", label: "Overtime" },
    // { id: "ADVANCE_SALARY", label: "Advance Salary" },
    { id: "LOAN_MANAGEMENT", label: "Loan" },
    { id: "CONFIG_SALARIES", label: "Configure Salary" },
  ];

  return (
    <div className="flex flex-col flex-grow shadow-lg p-1 sm:p-2 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        {/* 1. Main Title Section */}
        <TableTitle
          tileName="Payroll"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {isAdmin && (
                <CustomButton
                  label={`Add ${tabs.find((t) => t.id === activeTab)?.label}`}
                  handleToggle={() => handleActionClick(activeTab)}
                />
              )}

              {isAdmin && activeTab === "CALENDAR" && (
                <button
                  onClick={handleActivateClick}
                  className="bg-green-500 text-white 
      px-2 py-1 sm:px-4 sm:py-1.5 
      text-[15px] sm:text-sm font-medium
      rounded-lg sm:rounded-xl shadow-md
      hover:opacity-95 active:scale-95 transition-all duration-300 
      flex items-center gap-2"
                >
                  Activate Calendar Session
                </button>
              )}
            </div>
          }
        />

        {/* 2. Navigation and Filter Section (Styled like People.tsx) */}
        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          {/* Tab Navigation */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap w-full lg:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 lg:flex-none px-2 lg:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-[#334155] shadow-sm"
                    : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Pagination */}
          <div className="flex items-center flex-grow justify-end gap-3 max-w-2xl">
            <div className="flex-grow">
              <TableInputField
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm min-w-[110px]">
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(Number(e.target.value))}
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer w-full"
              >
                {entriesOptions.map((num) => (
                  <option key={num} value={num}>
                    {num} per page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Content Area */}
        <div className="flex-grow p-2 sm:p-4 overflow-auto">
          {activeTab === "CALENDAR" && (
            <Calendar
              triggerModal={
                triggerModal.tab === "CALENDAR" ? triggerModal.count : 0
              }
              triggerActivateModal={triggerActivateModal}
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}
          {activeTab === "SALARY_CYCLE" && (
            <SalaryCycle
              triggerModal={
                triggerModal.tab === "SALARY_CYCLE" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}
          {activeTab === "OVERTIME" && (
            <OverTime
              triggerModal={
                triggerModal.tab === "OVERTIME" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}
          {/* {activeTab === "ADVANCE_SALARY" && (
            <AdvanceSalary
              triggerModal={
                triggerModal.tab === "ADVANCE_SALARY" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )} */}
          {activeTab === "LOAN_MANAGEMENT" && (
            <Loan
              triggerModal={
                triggerModal.tab === "LOAN_MANAGEMENT" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}
          {activeTab === "CONFIG_SALARIES" && (
            <ConfigEmpSalary
              triggerModal={
                triggerModal.tab === "CONFIG_SALARIES" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}
        </div>
      </div>

      <div className="mt-auto border-t-5 border-gray-200">
        <Footer />
      </div>
    </div>
  );
};
