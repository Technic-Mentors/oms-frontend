import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { ShowDataNumber } from "../../Components/Pagination/ShowDataNumber";
import { Pagination } from "../../Components/Pagination/Pagination";
import { InputField } from "../../Components/InputFields/InputField";
import { OptionField } from "../../Components/InputFields/OptionField";
import { Loader } from "../../Components/LoaderComponent/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPrint } from "@fortawesome/free-solid-svg-icons";
import { RiInboxArchiveLine } from "react-icons/ri";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";
import { BASE_URL } from "../../Content/URL";

export type ALLPROGRESST = {
  id: number;
  employee_id: number;
  employeeName: string;
  email: string;
  projectId: number;
  projectName: string;
  date: string;
  note: string;
};

interface ProgressReportsProps {
  externalSearch: string;
  externalPageSize: number;
}

export interface BusinessVarType {
  id: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  logo?: string;
}

export const ProgressReports = ({
  externalSearch,
  externalPageSize,
}: ProgressReportsProps) => {
  const dispatch = useAppDispatch();
  const { loader } = useAppSelector((state) => state.NavigateState);
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;
  const isAdmin = currentUser?.role === "admin";

  const currentDate = new Date().toLocaleDateString("sv-SE");

  // Input states
  const [reportData, setReportData] = useState({
    startDate: currentDate,
    endDate: currentDate,
    employeeId: "",
  });
  const [businessVar, setBusinessVar] = useState<BusinessVarType | null>(null);

  // Filter states
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: currentDate,
    endDate: currentDate,
    employeeId: "",
  });

  const [allProgress, setAllProgress] = useState<ALLPROGRESST[]>([]);
  const [pageNo, setPageNo] = useState(1);

  const getProgressReport = useCallback(async () => {
    if (!token || !currentUser) return;
    try {
      dispatch(navigationStart());
      const url =
        currentUser.role === "admin"
          ? `${BASE_URL}/api/admin/getProgress`
          : `${BASE_URL}/api/user/getMyProgress`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllProgress(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load progress report", error);
    } finally {
      dispatch(navigationSuccess("PROGRESS REPORTS"));
    }
  }, [token, currentUser, dispatch]);

  const fetchBusinessVariable = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/business-variables`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.length > 0) {
        setBusinessVar(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch business variable:", err);
    }
  }, [token]);

  useEffect(() => {
    document.title = "(OMS) PROGRESS REPORTS";
    getProgressReport();
    fetchBusinessVariable();
  }, [getProgressReport, fetchBusinessVariable]);

  useEffect(() => {
    setPageNo(1);
  }, [externalSearch, externalPageSize]);

  const employeeOptions = useMemo(() => {
    const map = new Map<number, string>();
    allProgress.forEach((p) => map.set(p.employee_id, p.employeeName));
    return Array.from(map.entries()).map(([id, name]) => ({
      id,
      label: name,
      value: id,
    }));
  }, [allProgress]);

  const handleSearch = () => {
    setAppliedFilters({
      startDate: reportData.startDate,
      endDate: reportData.endDate,
      employeeId: reportData.employeeId,
    });
    setPageNo(1);
  };

  const filteredProgress = useMemo(() => {
    return allProgress.filter((item) => {
      const itemDate = item.date.slice(0, 10);
      const inDateRange =
        itemDate >= appliedFilters.startDate &&
        itemDate <= appliedFilters.endDate;

      const matchesEmployee = appliedFilters.employeeId
        ? item.employee_id === Number(appliedFilters.employeeId)
        : true;

      const matchesSearch =
        item.employeeName
          ?.toLowerCase()
          .includes(externalSearch.toLowerCase()) ||
        item.projectName
          ?.toLowerCase()
          .includes(externalSearch.toLowerCase()) ||
        item.note?.toLowerCase().includes(externalSearch.toLowerCase());

      return inDateRange && matchesEmployee && matchesSearch;
    });
  }, [allProgress, appliedFilters, externalSearch]);

  const totalItems = filteredProgress.length;
  const startIndex = (pageNo - 1) * externalPageSize;
  const paginatedData = filteredProgress.slice(
    startIndex,
    startIndex + externalPageSize,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setReportData((prev) => ({ ...prev, [name]: value }));
  };

  const printDiv = () => {
    if (filteredProgress.length === 0) {
      toast.error("Report is empty. Nothing to print!", {
        toastId: "empty-report-print",
      });
      return;
    }

    const printStyles = `
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
    .print-header { text-align: center; margin-bottom: 10px; }
    
    /* Line height and icon alignment */
    .business-info { line-height: 1.2; margin-bottom: 10px; color: #555; font-size: 9pt; }
    .info-item { display: inline-flex; align-items: center; margin: 0 10px; }
    .info-icon { width: 12px; height: 12px; margin-right: 5px; fill: #666; }
    
    .report-meta { text-align: left; margin-bottom: 5px; font-size: 9pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    th, td { border: 1px solid #333; padding: 4px 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
  `;

    const tableRows = filteredProgress
      .map(
        (item, index) => `
      <tr>
        <td style="width: 50px;">${index + 1}</td>
        <td>${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
        <td>${item.employeeName}</td>
        <td>${item.projectName}</td>
        <td>${item.note}</td>
      </tr>
    `,
      )
      .join("");

    const printWindow = window.open("", "_blank");

    // SVG Icons
    const addressIcon = `
    <svg class="info-icon" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>`;
    const phoneIcon = `<svg class="info-icon" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;

    printWindow?.document.write(`
    <html>
      <head>
        <title>Progress Report</title>
        <style>${printStyles}</style>
      </head>
      <body>
        <div class="print-header" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
          <div class="header-details" style="text-align: center;">
            <h2 style="margin: 0; font-size: 30px; font-weight: bold;">
              ${businessVar?.name ?? "Office Management System"}
            </h2>
            
            <div class="business-info" style="margin-top: 5px; font-size: 14px;">
              <span class="info-item" style="display: block; margin-bottom: 3px;">
                ${phoneIcon} ${businessVar?.contact ?? "N/A"}
              </span>
              <span class="info-item" style="display: block;">
                ${addressIcon} ${businessVar?.address ?? "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding-top: 10px;">
          <h3 style="margin: 0;">Progress Report</h3>
        </div>

        <div class="report-meta" style="margin-top: 10px; font-size: 13px;">
          <strong>From:</strong> ${appliedFilters.startDate} &nbsp;&nbsp;
          <strong>To:</strong> ${appliedFilters.endDate}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Sr#</th>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Project Title</th>
              <th>Progress Note</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);

    printWindow?.document.close();

    setTimeout(() => {
      printWindow?.focus();
      printWindow?.print();
      printWindow?.close();
    }, 500);
  };

  const handleEmailReport = async () => {
    try {
      if (!filteredProgress.length) {
        toast.error("No data available to send");
        return;
      }

      const columns = [
        { label: "Sr#", key: "__index" },
        { label: "Date", key: "date" },
        { label: "Employee", key: "employeeName" },
        { label: "Project", key: "projectName" },
        { label: "Note", key: "note" },
      ];

      // ✅ Ensure employee is selected (for admin)
      if (currentUser?.role === "admin" && !appliedFilters.employeeId) {
        toast.error("Please select an employee");
        return;
      }

      // ✅ Get email of selected employee
      const selectedEmployeeId =
        currentUser?.role === "admin"
          ? appliedFilters.employeeId
          : currentUser?.id;

      const selectedEmployeeData = allProgress.find(
        (item) => item.employee_id === Number(selectedEmployeeId),
      );

      let emailToSend = selectedEmployeeData?.email;

      // ✅ Fallback (for user login case)
      if (!emailToSend && currentUser?.email) {
        emailToSend = currentUser.email;
      }

      if (!emailToSend) {
        toast.error("No email found for selected employee");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/admin/send-report`,
        {
          email: emailToSend, // ✅ single email
          reportData: filteredProgress,
          business: businessVar,
          columns,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Progress report sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send progress report");
    }
  };

  if (loader) return <Loader />;

  return (
    <div className="flex flex-col flex-grow bg-white overflow-hidden">
      {/* --- TOP FILTERS --- */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
            <InputField
              labelName="From"
              type="date"
              name="startDate"
              value={reportData.startDate}
              handlerChange={handleChange}
            />
            <InputField
              labelName="To"
              type="date"
              name="endDate"
              value={reportData.endDate}
              handlerChange={handleChange}
            />
            {currentUser?.role === "admin" && (
              <OptionField
                labelName="Employee"
                name="employeeId"
                value={reportData.employeeId}
                optionData={employeeOptions}
                inital="Select Employee"
                handlerChange={handleChange}
              />
            )}
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={handleSearch}
              className="bg-slate-700 text-white px-6 py-3 rounded-lg shadow flex-1 lg:flex-none flex items-center justify-center transition"
            >
              <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
            </button>
            <button
              onClick={printDiv}
              className="bg-blue-400 text-white px-6 py-3 rounded-lg shadow flex-1 lg:flex-none flex items-center justify-center transition"
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" /> Print
            </button>
            {isAdmin && (
              <button
                onClick={handleEmailReport}
                disabled={filteredProgress.length === 0}
                className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow flex-1 lg:flex-none flex items-center justify-center transition"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Email Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="overflow-auto px-3 sm:px-0 flex-grow">
        <div className="min-w-[1000px]">
          <div className="px-0.5 pt-0.5">
            <div className="grid grid-cols-[60px_1.2fr_1.5fr_1.5fr_2.5fr] bg-blue-400 text-white rounded-lg items-center font-bold text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm">
              <span className="text-left">Sr#</span>
              <span className="text-left">Date</span>
              <span className="text-left">Employee</span>
              <span className="text-left">Project</span>
              <span className="text-left">Progress Note</span>
            </div>
          </div>

          <div className="px-0.5 sm:px-1 py-2" id="progressDiv">
            {paginatedData.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">
                  No records available at the moment!
                </p>
                <p className="text-sm">
                  Try adjusting your date range or search term.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedData.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[60px_1.2fr_1.5fr_1.5fr_2.5fr] items-center px-3 py-2 gap-3 text-sm bg-white border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-colors shadow-sm"
                  >
                    <span className="text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>
                    <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="truncate text-gray-800">
                      {item.employeeName}
                    </div>
                    <div className="text-gray-700 font-medium truncate">
                      {item.projectName}
                    </div>
                    <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex flex-row items-center justify-between p-2 border-t border-gray-100">
        <ShowDataNumber
          start={totalItems === 0 ? 0 : startIndex + 1}
          end={Math.min(startIndex + externalPageSize, totalItems)}
          total={totalItems}
        />
        <Pagination
          pageNo={pageNo}
          totalNum={filteredProgress.length}
          pageSize={externalPageSize}
          handlePageClick={(targetPage) => setPageNo(targetPage)}
        />
      </div>
    </div>
  );
};