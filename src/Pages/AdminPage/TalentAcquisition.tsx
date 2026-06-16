import { useState } from "react";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";
import { Jobs } from "./Jobs";
import { Applicants } from "./Applicants";
import { Footer } from "../../Components/Footer";

// Define Tab Types
type TabType = "JOBS" | "APPLICANTS";
const entriesOptions = [5, 10, 15, 20, 30];

export const TalentAcquisition = () => {
  const [activeTab, setActiveTab] = useState<TabType>("JOBS");

  // Lifted states for Search and Pagination to match People.tsx
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);

  const [triggerAction, setTriggerAction] = useState<{
    tab: TabType;
    count: number;
  }>({ tab: "JOBS", count: 0 });

  const handleActionClick = (tab: TabType) => {
    setTriggerAction((prev) => ({
      tab,
      count: prev.tab === tab ? prev.count + 1 : 1,
    }));
  };
const handleTabChange = (tab: TabType) => {
  setActiveTab(tab);
  setTriggerAction({ tab, count: 0 });
};
  return (
    <div className="flex flex-col flex-grow shadow-lg p-1 sm:p-2 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        {/* 1) Title Section */}
        <TableTitle
          tileName="Talent Acquisition"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {activeTab === "JOBS" && (
                <CustomButton
                  label="Add Jobs"
                  handleToggle={() => handleActionClick("JOBS")}
                />
              )}
              {activeTab === "APPLICANTS" && (
                <CustomButton
                  label="Add Applicants"
                  handleToggle={() => handleActionClick("APPLICANTS")}
                />
              )}
            </div>
          }
        />

        {/* 2) Combined Navigation & Controls Section */}
        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          {/* Pills-style Tab Navigation */}
          <div className="flex w-full sm:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200">
            {(["JOBS", "APPLICANTS"] as TabType[]).map((tab) => (
              <button
                key={tab}
              onClick={() => handleTabChange(tab)}
                className={`flex-1 sm:flex-none px-2 sm:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg ${
                  activeTab === tab
                    ? "bg-white text-[#334155] shadow-sm"
                    : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search and Entries Controls */}
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
        <div className="flex-grow p-2 sm:p-4 overflow-auto">
          {activeTab === "JOBS" && (
            <Jobs
              triggerRecruit={
                triggerAction.tab === "JOBS" ? triggerAction.count : 0
              }
              externalSearch={searchTerm} // Pass this
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "APPLICANTS" && (
            <Applicants
              triggerRecruit={
                triggerAction.tab === "APPLICANTS" ? triggerAction.count : 0
              }
              externalSearch={searchTerm} // Pass this
              externalPageSize={selectedValue}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t-5 border-gray-200">
        <Footer />
      </div>
    </div>
  );
};
