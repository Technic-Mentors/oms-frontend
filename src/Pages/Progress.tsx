import { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../redux/Hooks";
import { navigationStart, navigationSuccess } from "../redux/NavigationSlice";
import { toast } from "react-toastify";

// Components
import { Pagination } from "../Components/Pagination/Pagination";
import { ShowDataNumber } from "../Components/Pagination/ShowDataNumber";
import { EditButton } from "../Components/CustomButtons/EditButton";
import { DeleteButton } from "../Components/CustomButtons/DeleteButton";
import { ViewButton } from "../Components/CustomButtons/ViewButton";
import { Loader } from "../Components/LoaderComponent/Loader";
import { InputField } from "../Components/InputFields/InputField";

// Modals
import { AddProgress } from "../Components/ProgressModal/AddProgress";
import { EditProgress } from "../Components/ProgressModal/EditProgress";
import { ViewProgress } from "../Components/ProgressModal/ViewProgress";
import { ConfirmationModal } from "../Components/Modal/ComfirmationModal";

// Icons & Utils
import { BASE_URL } from "../Content/URL";
import { RiInboxArchiveLine } from "react-icons/ri";

export type ALLPROGRESST = {
  id: number;
  employee_id: number;
  employeeName: string;
  email: string;
  projectId: number;
  projectName: string;
  date: string;
  note: string;
  created_by: number;
  created_by_role: 'admin' | 'employee';
};

interface ProgressProps {
  triggerModal: number;
  externalSearch: string;
  externalPageSize: number;
}

export const Progress = ({
  triggerModal,
  externalSearch,
  externalPageSize,
}: ProgressProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const { loader } = useAppSelector((state) => state.NavigateState);
  const dispatch = useAppDispatch();
  const token = currentUser?.token;
  const userId = currentUser?.userId; // 👈 Same as Todo

  const getStartOfMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  };

  const getCurrentDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [allProgress, setAllProgress] = useState<ALLPROGRESST[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<
    "ADD" | "EDIT" | "DELETE" | ""
  >("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [viewProgressData, setViewProgressData] = useState<ALLPROGRESST | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<ALLPROGRESST | null>(
    null,
  );
  const [pageNo, setPageNo] = useState(1);
  const [fromDate, setFromDate] = useState<string>(getStartOfMonth());
  const [toDate, setToDate] = useState<string>(getCurrentDate());

  const handleGetAllProgress = useCallback(async () => {
    if (!token || !currentUser) return;
    try {
      const url =
        currentUser.role === "admin"
          ? `${BASE_URL}/api/admin/getProgress`
          : `${BASE_URL}/api/user/getMyProgress`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllProgress(
        Array.isArray(res.data) ? res.data.sort((a, b) => a.id - b.id) : [],
      );
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      setAllProgress([]);
    }
  }, [token, currentUser]);

  useEffect(() => {
    handleGetAllProgress();
    document.title = "(OMS) PROGRESS";
    dispatch(navigationStart());
    setTimeout(() => dispatch(navigationSuccess("progress")), 500);
  }, [dispatch, handleGetAllProgress]);

  useEffect(() => {
    if (triggerModal > 0) setIsOpenModal("ADD");
  }, [triggerModal]);

  useEffect(() => {
    setPageNo(1);
  }, [externalSearch, externalPageSize]);

  const filteredProgress = useMemo(() => {
    return allProgress.filter((p) => {
      const matchesSearch =
        p.employeeName?.toLowerCase().includes(externalSearch.toLowerCase()) ||
        p.projectName?.toLowerCase().includes(externalSearch.toLowerCase()) ||
        p.note?.toLowerCase().includes(externalSearch.toLowerCase()) ||
        p.email?.toLowerCase().includes(externalSearch.toLowerCase());

      const progressDateStr = p.date?.split("T")[0];

      let matchesDate = true;

      if (fromDate && toDate) {
        matchesDate = progressDateStr >= fromDate && progressDateStr <= toDate;
      } else if (fromDate) {
        matchesDate = progressDateStr >= fromDate;
      } else if (toDate) {
        matchesDate = progressDateStr <= toDate;
      }

      return matchesSearch && matchesDate;
    });
  }, [allProgress, externalSearch, fromDate, toDate]);

  const totalItems = filteredProgress.length;
  const startIndex = (pageNo - 1) * externalPageSize;
  const endIndex = startIndex + externalPageSize;
  const paginatedProgress = filteredProgress.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  const handleDeleteProgress = async () => {
    if (!selectedId || !token) return;
    try {
      await axios.patch(
        `${BASE_URL}/api/admin/deleteProgress/${selectedId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Progress deleted successfully");
      handleGetAllProgress();
      setSelectedId(null);
      setIsOpenModal("");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete progress");
    }
  };

  if (loader) return <Loader />;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-3 py-4">
        <div className="w-full sm:w-[220px]">
          <InputField
            labelName="From"
            type="date"
            value={fromDate}
            handlerChange={(e) => {
              setFromDate(e.target.value);
              setPageNo(1);
            }}
            className="!shadow-none border-gray-300 focus:ring-blue-400"
          />
        </div>

        <div className="w-full sm:w-[220px]">
          <InputField
            labelName="To"
            type="date"
            value={toDate}
            handlerChange={(e) => {
              setToDate(e.target.value);
              setPageNo(1);
            }}
            className="!shadow-none border-gray-300 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="overflow-auto px-3 sm:px-0">
        <div className="min-w-[900px]">
          {/* HEADER SECTION */}
          <div className="px-0.5 pt-0.5">
            <div
              className={`grid ${
                currentUser?.role === "admin" 
                  ? "grid-cols-[60px_1.5fr_1.5fr_1.5fr_1.5fr_auto]"
                  : "grid-cols-[60px_1.5fr_1.5fr_auto]"
              } 
              bg-blue-400 text-white rounded-lg items-center font-bold text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm`}
            >
              <span>Sr#</span>
              {currentUser?.role === "admin" && <span>Employee</span>}
              {currentUser?.role === "admin" && <span>Email</span>}
              <span>Project Name</span>
              <span className="text-center">Submission Date</span>
              <span className="text-right pr-10">Actions</span>
            </div>
          </div>

          {/* BODY SECTION */}
          <div className="px-0.5 py-2">
            {paginatedProgress.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">No progress records found!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedProgress.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid ${
                      currentUser?.role === "admin"
                        ? "grid-cols-[60px_1.5fr_1.5fr_1.5fr_1.5fr_auto]"
                        : "grid-cols-[60px_1.5fr_1.5fr_auto]"
                    } 
                    items-center p-2 gap-3 text-sm bg-white border border-gray-100 rounded-lg hover:bg-blue-50/30
                     transition-colors shadow-sm`}
                  >
                    <span className="pl-4 text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>

                    {currentUser?.role === "admin" && (
                      <>
                        <div className="flex items-center gap-2 text-gray-700">
                          {item.employeeName}
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          {item.email}
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="truncate">{item.projectName}</span>
                    </div>

                    <div className="flex items-center justify-center text-gray-600">
                      <span>{formatDate(item.date)}</span>
                    </div>

                    {/* Actions - EXACTLY SAME LOGIC AS TODO */}
                    <div className="flex items-center justify-end gap-1 w-[140px]">
                      <ViewButton
                        handleView={() => {
                          setViewProgressData(item);
                          setIsViewModalOpen(true);
                        }}
                      />
                      
                      {(() => {
                        // Admin can edit/delete everything
                        if (currentUser?.role === 'admin') {
                          return (
                            <>
                              <EditButton
                                handleUpdate={() => {
                                  setSelectedProgress(item);
                                  setIsOpenModal("EDIT");
                                }}
                              />
                              <DeleteButton
                                handleDelete={() => {
                                  setSelectedId(item.id);
                                  setIsOpenModal("DELETE");
                                }}
                              />
                            </>
                          );
                        }
                        
                        // Employee can only edit/delete their OWN created progress
                        // (progress where they are the creator AND it's employee-created)
                        if (
                          item.created_by_role === 'employee' && 
                          item.created_by === currentUser?.userId
                        ) {
                          return (
                            <>
                              <EditButton
                                handleUpdate={() => {
                                  setSelectedProgress(item);
                                  setIsOpenModal("EDIT");
                                }}
                              />
                              <DeleteButton
                                handleDelete={() => {
                                  setSelectedId(item.id);
                                  setIsOpenModal("DELETE");
                                }}
                              />
                            </>
                          );
                        }
                        
                        // If no conditions met, show nothing (only View button)
                        return null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER SECTION - Pagination */}
      <div className="flex flex-row items-center justify-between p-2">
        <ShowDataNumber
          start={totalItems === 0 ? 0 : startIndex + 1}
          end={Math.min(endIndex, totalItems)}
          total={totalItems}
        />
        <Pagination
          pageNo={pageNo}
          totalNum={filteredProgress.length}
          pageSize={externalPageSize}
          handlePageClick={(targetPage) => setPageNo(targetPage)}
        />
      </div>

      {/* MODALS */}
      {isOpenModal === "ADD" && (
        <AddProgress
          setModal={() => setIsOpenModal("")}
          handleRefresh={handleGetAllProgress}
        />
      )}

      {isOpenModal === "EDIT" && selectedProgress && (
        <EditProgress
          setModal={() => setIsOpenModal("")}
          progressData={selectedProgress}
          handleRefresh={handleGetAllProgress}
        />
      )}

      {isViewModalOpen && viewProgressData && (
        <ViewProgress
          setIsOpenModal={() => setIsViewModalOpen(false)}
          viewProgress={viewProgressData}
        />
      )}

      {isOpenModal === "DELETE" && (
        <ConfirmationModal
          isOpen={() => {}}
          onClose={() => setIsOpenModal("")}
          onConfirm={handleDeleteProgress}
        />
      )}
    </div>
  );
};