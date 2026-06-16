import { useState } from "react";
import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { CustomButton } from "../../Components/TableLayoutComponents/CustomButton";
import { TableInputField } from "../../Components/TableLayoutComponents/TableInputField";
import { AttendanceRule } from "./AttendanceRule";
import { Holidays } from "./Holidays";
import { AccessControl } from "./AccessControl";
import { BusinessVariables } from "./BusinessVariables";
import { ConfigOvertime } from "./ConfigOvertime";
import { useAppSelector } from "../../redux/Hooks";
import { Footer } from "../../Components/Footer";

// Define Tab Types
type TabType =
  | "ATTENDANCE_RULES"
  | "CONFIGURE_HOLIDAYS"
  | "ACCESS_CONTROL"
  | "BUSINESS_VARIABLE"
  | "CONFIGURE_OVERTIME"
  | "";
const entriesOptions = [5, 10, 15, 20, 30];

export const Assemble = () => {
  const [activeTab, setActiveTab] = useState<TabType>("ATTENDANCE_RULES");
  const { currentUser } = useAppSelector((state) => state.officeState);
  const isAdmin = currentUser?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(10);
  const [hasBusinessVariable, setHasBusinessVariable] = useState(false);
  const [hasOvertime, setHasOvertime] = useState(false);

  const [triggerModal, setTriggerModal] = useState<{
    tab: TabType;
    count: number;
  }>({ tab: "ATTENDANCE_RULES", count: 0 });

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
    <div className="flex flex-col flex-grow shadow-lg p-1 sm:p-1 rounded-lg bg-gray-100 overflow-hidden">
      <div className="min-h-screen w-full flex flex-col shadow-lg bg-white rounded-md">
        {/* 1. Main Title Section */}
        <TableTitle
          tileName="Configuration"
          rightElement={
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
              {isAdmin && activeTab === "ATTENDANCE_RULES" && (
                <CustomButton
                  label="Add Attendance Rule"
                  handleToggle={() => handleActionClick("ATTENDANCE_RULES")}
                />
              )}

              {isAdmin && activeTab === "CONFIGURE_HOLIDAYS" && (
                <CustomButton
                  label="Add Holiday"
                  handleToggle={() => handleActionClick("CONFIGURE_HOLIDAYS")}
                />
              )}

              {isAdmin && activeTab === "ACCESS_CONTROL" && (
                <CustomButton
                  label="Add Access Control"
                  handleToggle={() => handleActionClick("ACCESS_CONTROL")}
                />
              )}

              {isAdmin &&
                activeTab === "BUSINESS_VARIABLE" &&
                !hasBusinessVariable && (
                  <CustomButton
                    label="Add Business Variable"
                    handleToggle={() => handleActionClick("BUSINESS_VARIABLE")}
                  />
                )}

              {isAdmin &&
                activeTab === "CONFIGURE_OVERTIME" &&
                !hasOvertime && (
                  <CustomButton
                    label="Add Overtime"
                    handleToggle={() => handleActionClick("CONFIGURE_OVERTIME")}
                  />
                )}
            </div>
          }
        />

        <div className="px-4 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex w-full sm:w-auto p-1 bg-[#F1F5F9] rounded-xl border border-gray-200 overflow-x-auto no-scrollbar">
            {(
              [
                "ATTENDANCE_RULES",
                "CONFIGURE_HOLIDAYS",
                "ACCESS_CONTROL",
                "BUSINESS_VARIABLE",
                "CONFIGURE_OVERTIME",
              ] as TabType[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 sm:flex-none px-2 sm:px-6 py-1 text-sm font-bold transition-all duration-200 rounded-lg ${
                  activeTab === tab
                    ? "bg-white text-[#334155] shadow-sm"
                    : "text-[#64748B] hover:text-[#334155]"
                }`}
              >
                {tab === "ATTENDANCE_RULES"
                  ? "Attendance Rules"
                  : tab === "CONFIGURE_HOLIDAYS"
                    ? "Configure Holidays"
                    : tab === "ACCESS_CONTROL"
                      ? "Access Control"
                      : tab === "BUSINESS_VARIABLE"
                        ? "Business Variables"
                        : tab === "CONFIGURE_OVERTIME"
                          ? "Configure Overtime"
                          : ""}
              </button>
            ))}
          </div>

          {/* Search and Page Size Controls */}
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

        {/* 3. Content Area */}
        <div className="flex-grow sm:p-4 overflow-auto">
          {activeTab === "ATTENDANCE_RULES" && (
            <AttendanceRule
              triggerModal={
                triggerModal.tab === "ATTENDANCE_RULES" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}
          {activeTab === "CONFIGURE_HOLIDAYS" && (
            <Holidays
              triggerModal={
                triggerModal.tab === "CONFIGURE_HOLIDAYS"
                  ? triggerModal.count
                  : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "ACCESS_CONTROL" && (
            <AccessControl
              triggerModal={
                triggerModal.tab === "ACCESS_CONTROL" ? triggerModal.count : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
            />
          )}

          {activeTab === "BUSINESS_VARIABLE" && (
            <BusinessVariables
              triggerModal={
                triggerModal.tab === "BUSINESS_VARIABLE"
                  ? triggerModal.count
                  : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
              setHasBusinessVariable={setHasBusinessVariable}
            />
          )}

          {activeTab === "CONFIGURE_OVERTIME" && (
            <ConfigOvertime
              triggerModal={
                triggerModal.tab === "CONFIGURE_OVERTIME"
                  ? triggerModal.count
                  : 0
              }
              externalSearch={searchTerm}
              externalPageSize={selectedValue}
              setHasOvertime={setHasOvertime}
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
