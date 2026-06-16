import { useState } from "react";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";

import { ProjectsDetails } from "./ProjectsDetails";
import { ProjectsCatogries } from "../ProjectsCategories";
import { AssignProjects } from "./AssignProjects";
import { useAppSelector } from "../../redux/Hooks";
import { Footer } from "../../Components/Footer";

type TabType = "CATEGORY" | "DETAILS" | "ASSIGN";
const entriesOptions = [5, 10, 15, 20, 30];

export const Projects = () => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const isAdmin = currentUser?.role === "admin";

  // Lifted states for Search and Pagination UI consistency
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);
  const [activeTab, setActiveTab] = useState<TabType>("DETAILS");

  const [triggerModal, setTriggerModal] = useState<{
    tab: TabType;
    count: number;
  }>({ tab: "DETAILS", count: 0 });

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
  return (
    <div className="flex flex-col flex-grow shadow-lg p-0.5 sm:p-0.5 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        
        {/* 1. Header Section */}
        <TableTitle
          tileName="Projects"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {activeTab === "DETAILS" && isAdmin && (
                <CustomButton
                  label="Add Projects"
                  handleToggle={() => handleActionClick("DETAILS")}
                />
              )}

              {activeTab === "CATEGORY" && isAdmin && (
                <CustomButton
                  label="Add Categories"
                  handleToggle={() => handleActionClick("CATEGORY")}
                />
              )}

              {activeTab === "ASSIGN" && (
                <CustomButton
                  label="Assign Project"
                  handleToggle={() => handleActionClick("ASSIGN")}
                />
              )}
            </div>
          }
        />

        {/* 2. Sub-Header: Tabs, Search, and Page Size (The People.tsx UI) */}
        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          
          {/* Tab Navigation */}
          <div className="flex w-full sm:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200">
            {(["CATEGORY", "DETAILS", "ASSIGN"] as TabType[]).map((tab) => {
              // Hide admin-only tabs if user isn't admin
              if (!isAdmin && (tab === "DETAILS" || tab === "CATEGORY")) return null;

              return (
                <button
                  key={tab}
                onClick={() => handleTabChange(tab)}
                  className={`flex-1 sm:flex-none px-2 sm:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg ${
                    activeTab === tab
                      ? "bg-white text-[#334155] shadow-sm"
                      : "text-[#64748B] hover:text-[#334155]"
                  }`}
                >
                  {/* {tab === "DETAILS" ? "Project Details" : tab === "CATEGORY" ? "Project Categories" : "Assign Projects"} */}
                    {tab === "CATEGORY" ? "Project Categories" : tab === "DETAILS" ? "Project Details" : "Assign Projects"}
                </button>
              );
            })}
          </div>

          {/* Search and Entries Select */}
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
        <div className="flex-grow p-1 sm:p-4 overflow-auto">
          {activeTab === "DETAILS" && isAdmin && (
            <ProjectsDetails
              triggerModal={triggerModal.tab === "DETAILS" ? triggerModal.count : 0}
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "CATEGORY" && isAdmin && (
            <ProjectsCatogries
              triggerModal={triggerModal.tab === "CATEGORY" ? triggerModal.count : 0}
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "ASSIGN" && (
            <AssignProjects
              triggerModal={triggerModal.tab === "ASSIGN" ? triggerModal.count : 0}
              externalSearch={searchTerm}
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