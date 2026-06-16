import { useState } from "react";
import { EmployeeLifeline } from "./EmployeeLifeline";
import { EmployeeWithdraw } from "./EmployeeWithdraw";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";
import { Footer } from "../../Components/Footer";

type HRTab = "LIFELINE" | "WITHDRAW";
const entriesOptions = [5, 10, 15, 20, 30];

export const HumanResources = () => {
  const [activeTab, setActiveTab] = useState<HRTab>("LIFELINE");

  // Lifted states for search and pagination consistency
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);

  const [triggerModal, setTriggerModal] = useState<{
    tab: HRTab;
    count: number;
  }>({ tab: "LIFELINE", count: 0 });

  const handleAddClick = (tab: HRTab) => {
    setTriggerModal((prev) => ({
      tab,
      count: prev.tab === tab ? prev.count + 1 : 1,
    }));
  };
const handleTabChange = (tab: HRTab) => {
  setActiveTab(tab);
  setTriggerModal({ tab, count: 0 });
};
  return (
    <div className="flex flex-col flex-grow shadow-lg p-1 sm:p-2 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        {/* 1) Header Section */}
        <TableTitle
          tileName="Human Resources"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {activeTab === "LIFELINE" && (
                <CustomButton
                  label="Add Employee Lifeline"
                  handleToggle={() => handleAddClick("LIFELINE")}
                />
              )}
              {activeTab === "WITHDRAW" && (
                <CustomButton
                  label="Add Withdraw"
                  handleToggle={() => handleAddClick("WITHDRAW")}
                />
              )}
            </div>
          }
        />

        {/* 2) Search, Filters and Tab Navigation (People.tsx Style) */}
        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          {/* Tab Selection Pill */}
          <div className="flex w-full sm:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200">
            {(["LIFELINE", "WITHDRAW"] as HRTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 sm:flex-none px-2 sm:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg ${
                  activeTab === tab
                    ? "bg-white text-[#334155] shadow-sm"
                    : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                {tab === "LIFELINE" ? "Employee Lifeline" : "Employee Withdraw"}
              </button>
            ))}
          </div>

          {/* Search and Pagination Controls */}
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

        {/* 3) Content Area */}
        <div className="flex-grow p-1 sm:p-4 overflow-auto">
          {activeTab === "LIFELINE" ? (
            <EmployeeLifeline
              triggerAdd={
                triggerModal.tab === "LIFELINE" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          ) : (
            <EmployeeWithdraw
              triggerAdd={
                triggerModal.tab === "WITHDRAW" ? triggerModal.count : 0
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
