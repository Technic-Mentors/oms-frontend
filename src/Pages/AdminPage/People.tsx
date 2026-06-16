import { useState, useEffect, useRef } from "react";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";

import { UsersDetails } from "./UsersDetails";
import { CustomerDetail } from "./CustomerDetail";
import { Suppliers } from "./Suppliers";

import { useSearchParams } from "react-router-dom";
import { Footer } from "../../Components/Footer";
import { dispatchGlobalTabChange } from "../../utils/tabManager";

type TabType = "EMPLOYEES" | "CUSTOMERS" | "SUPPLIERS";
const entriesOptions = [5, 10, 15, 20, 30];

export const People = () => {
  const [searchParams] = useSearchParams();
  const tabFromURL = searchParams.get("tab") as TabType | null;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);

  const [activeTab, setActiveTab] = useState<TabType>(
    tabFromURL === "CUSTOMERS" || tabFromURL === "SUPPLIERS"
      ? tabFromURL
      : "EMPLOYEES",
  );

  // Use a timestamp instead of increment for more reliable triggering
  const [triggerModal, setTriggerModal] = useState<{
    tab: TabType;
    timestamp: number | null;
  }>({ tab: "EMPLOYEES", timestamp: null });

  // Track previous tab to detect tab changes
  const prevTabRef = useRef<TabType>(activeTab);

  const handleActionClick = (tab: TabType) => {
    // Use timestamp to ensure unique trigger
    setTriggerModal({ tab, timestamp: Date.now() });
  };

  // Handle tab change with proper reset
 const handleTabChange = (tab: TabType) => {
  setTriggerModal({ tab, timestamp: null });
  dispatchGlobalTabChange();
  setActiveTab(tab);
};

  // Reset trigger after it has been used (when modal opens)
  useEffect(() => {
    if (triggerModal.timestamp !== null) {
      // Reset after 100ms to allow modal to open
      const timer = setTimeout(() => {
        setTriggerModal({ tab: "EMPLOYEES", timestamp: null });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [triggerModal.timestamp]);

  // Also reset when tab changes via URL
  useEffect(() => {
    if (
      tabFromURL === "EMPLOYEES" ||
      tabFromURL === "CUSTOMERS" ||
      tabFromURL === "SUPPLIERS"
    ) {
      if (tabFromURL !== activeTab) {
        setTriggerModal({ tab: "EMPLOYEES", timestamp: null });
        setActiveTab(tabFromURL);
      }
    }
  }, [tabFromURL]);

  // Get the trigger value for current tab
  const getTriggerValue = () => {
    if (triggerModal.tab === activeTab && triggerModal.timestamp !== null) {
      return triggerModal.timestamp;
    }
    return 0;
  };

  return (
    <div className="flex flex-col flex-grow shadow-lg p-1 sm:p-1 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        <TableTitle
          tileName="People"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {activeTab === "EMPLOYEES" && (
                <CustomButton
                  label="Add Employee"
                  handleToggle={() => handleActionClick("EMPLOYEES")}
                />
              )}
              {activeTab === "CUSTOMERS" && (
                <CustomButton
                  label="Add Customer"
                  handleToggle={() => handleActionClick("CUSTOMERS")}
                />
              )}
              {activeTab === "SUPPLIERS" && (
                <CustomButton
                  label="Add Supplier"
                  handleToggle={() => handleActionClick("SUPPLIERS")}
                />
              )}
            </div>
          }
        />

        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full sm:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200">
  {(["EMPLOYEES", "CUSTOMERS", "SUPPLIERS"] as TabType[]).map((tab) => (
    <button
      key={tab}
      onClick={() => handleTabChange(tab)}  // ← CHANGED THIS
      className={`flex-1 sm:flex-none px-2 sm:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg ${
        activeTab === tab
          ? "bg-white text-[#334155] shadow-md"
          : "text-[#64748B] hover:text-[#334155]"
      }`}
    >
      {tab.charAt(0) + tab.slice(1).toLowerCase()}
    </button>
  ))}
</div>

          <div className="flex items-center flex-grow justify-end gap-3 max-w-2xl">
            <div className="flex-grow">
              <TableInputField
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div className="flex items-center border border-gray-200 rounded-lg px-1 py-2 bg-white shadow-sm min-w-[110px]">
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

        <div className="flex-grow sm:p-4 overflow-auto">
          {activeTab === "EMPLOYEES" && (
            <UsersDetails
              key={`employees-${activeTab}`} // Add key to force remount with new props
              triggerAdd={getTriggerValue()}
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "CUSTOMERS" && (
            <CustomerDetail
              key={`customers-${activeTab}`} // Add key to force remount with new props
              triggerAdd={getTriggerValue()}
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "SUPPLIERS" && (
            <Suppliers
              key={`suppliers-${activeTab}`} // Add key to force remount with new props
              triggerAdd={getTriggerValue()}
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