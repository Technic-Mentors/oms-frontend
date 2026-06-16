import { useState } from "react";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";
import { Promotion } from "./Promotion";
import { Resignation } from "./Resignation";
import { useAppSelector } from "../../redux/Hooks";
import { Footer } from "../../Components/Footer";

// Define Tab Types
type TabType = "PROMOTION" | "RESIGNATION" | "";
const entriesOptions = [5, 10, 15, 20, 30];

export const Propulsive = () => {
  const [activeTab, setActiveTab] = useState<TabType>("PROMOTION");
  const { currentUser } = useAppSelector((state) => state.officeState);
  const isAdmin = currentUser?.role === "admin";

  // Lifted states for Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);

  // Trigger state for Add buttons
  const [triggerModal, setTriggerModal] = useState<{
    tab: TabType;
    count: number;
  }>({ tab: "PROMOTION", count: 0 });

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
    <div className="flex flex-col flex-grow shadow-lg p-1 sm:p-2 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        {/* 1. Main Title Section */}
        <TableTitle
          tileName="Dynamics"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {!isAdmin && activeTab === "PROMOTION" && (
                <CustomButton
                  label="Add Promotion"
                  handleToggle={() => handleActionClick("PROMOTION")}
                />
              )}

              {activeTab === "RESIGNATION" && (
                <CustomButton
                  label="Add Resignation"
                  handleToggle={() => handleActionClick("RESIGNATION")}
                />
              )}

             
            </div>
          }
        />

        {/* 2. Controls Section (Tabs + Search + Page Size) */}
        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          {/* Tab Navigation Pill Style */}
          <div className="flex w-full lg:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200">
            {(["PROMOTION", "RESIGNATION"] as TabType[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex-1 lg:flex-none px-2 sm:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg ${
                    activeTab === tab
                      ? "bg-white text-[#334155] shadow-sm"
                      : "text-[#64748B] hover:text-[#334155]"
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ),
            )}
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

        {/* 3. Content Area */}
        <div className="flex-grow p-2 sm:p-4 overflow-auto">
          {activeTab === "PROMOTION" && (
            <Promotion
              triggerModal={
                triggerModal.tab === "PROMOTION" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "RESIGNATION" && (
            <Resignation
              triggerModal={
                triggerModal.tab === "RESIGNATION" ? triggerModal.count : 0
              }
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
