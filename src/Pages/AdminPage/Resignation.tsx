import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShowDataNumber } from "../../Components/Pagination/ShowDataNumber";
import { Pagination } from "../../Components/Pagination/Pagination";

import { ViewButton } from "../../Components/CustomButtons/ViewButton";
import { EditButton } from "../../Components/CustomButtons/EditButton";
import { DeleteButton } from "../../Components/CustomButtons/DeleteButton";

import { AddResignation } from "../../Components/ResignationModal/AddResignation";
import { UpdateResignation } from "../../Components/ResignationModal/UpdateResignation";
import { ViewResignation } from "../../Components/ResignationModal/ViewResignation";
import { ConfirmationModal } from "../../Components/Modal/ComfirmationModal";
import { Loader } from "../../Components/LoaderComponent/Loader";

import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";

import { BASE_URL } from "../../Content/URL";
import { RiInboxArchiveLine } from "react-icons/ri";

export type ResignationDataT = {
  id: number;
  employee_name: string;
  designation: string;
  resignation_date: string;
  note: string;
  approval_status: string;
  is_deleted?: number;
};

interface ResignationProps {
  triggerModal: number;
  externalSearch: string;
  externalPageSize: number;
}

export const Resignation = ({
  triggerModal,
  externalSearch,
  externalPageSize,
}: ResignationProps) => {
  const { loader } = useAppSelector((state) => state.NavigateState);
  const { currentUser } = useAppSelector((state) => state.officeState);
  const dispatch = useAppDispatch();

  const token = currentUser?.token;
  const isAdmin = currentUser?.role === "admin";

  const [isOpenModal, setIsOpenModal] = useState<
    "ADD" | "VIEW" | "EDIT" | "DELETE" | ""
  >("");
  const [allResignations, setAllResignations] = useState<ResignationDataT[]>(
    [],
  );
  const [selectedResignation, setSelectedResignation] =
    useState<ResignationDataT | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(1);

  const handleToggleViewModal = (active: typeof isOpenModal) => {
    setIsOpenModal((prev) => (prev === active ? "" : active));
  };

  const handleViewClick = (resignation: ResignationDataT) => {
    setSelectedResignation(resignation);
    handleToggleViewModal("VIEW");
  };

  const handleEditClick = (resignation: ResignationDataT) => {
    setSelectedResignation(resignation);
    handleToggleViewModal("EDIT");
  };

  const handleGetAllResignations = useCallback(
    async (updatedItem?: ResignationDataT) => {
      if (!token || !currentUser) return;
      try {
        const url = isAdmin
          ? `${BASE_URL}/api/admin/getResignations`
          : `${BASE_URL}/api/user/getMyResignations`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data: ResignationDataT[] = Array.isArray(res.data) ? res.data : [];
        if (updatedItem) {
          data = data.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
          );
        }
        setAllResignations(data.sort((a, b) => a.id - b.id));
      } catch (error) {
        console.error("Failed to fetch resignations:", error);
        setAllResignations([]);
      }
    },
    [token, currentUser, isAdmin],
  );

  const handleDeleteResignation = async () => {
    if (!selectedId || !token) return;
    try {
      await axios.delete(`${BASE_URL}/api/deleteResignation/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleGetAllResignations();
      setIsOpenModal("");
      setSelectedId(null);
    } catch (error) {
      console.error("Failed to delete resignation:", error);
    }
  };

  // Reset page number when search or page size changes
  useEffect(() => {
    setPageNo(1);
  }, [externalSearch, externalPageSize]);

  const filteredResignations = allResignations.filter(
    (res) =>
      res.employee_name.toLowerCase().includes(externalSearch.toLowerCase()) ||
      res.designation.toLowerCase().includes(externalSearch.toLowerCase()),
  );

  const totalItems = filteredResignations.length;
  const startIndex = (pageNo - 1) * externalPageSize;
  const endIndex = startIndex + externalPageSize;
  const paginatedResignations = filteredResignations.slice(
    startIndex,
    endIndex,
  );

  useEffect(() => {
    handleGetAllResignations();
    document.title = "(OMS) RESIGNATIONS";
    dispatch(navigationStart());
    setTimeout(() => dispatch(navigationSuccess("Resignation Request")), 500);
  }, [dispatch, handleGetAllResignations]);

  useEffect(() => {
    if (triggerModal > 0) setIsOpenModal("ADD");
  }, [triggerModal]);

  if (loader) return <Loader />;

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
    const statusStyles: Record<string, string> = {
      PENDING: "bg-orange-100 text-orange-600 border-orange-200",
      APPROVED: "bg-green-100 text-green-700 border-green-200",
      ACCEPTED: "bg-green-100 text-green-700 border-green-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
    };
    const currentStyle =
      statusStyles[upperStatus] || "bg-gray-100 text-gray-600 border-gray-200";
    return (
      <span
        className={`px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${currentStyle}`}
      >
        {upperStatus}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-grow bg-white overflow-hidden">
      <div className="overflow-auto px-3 sm:px-0">
        <div className="min-w-[1000px]">
          {/* Rounded Header */}
          <div className="px-0.5 pt-0.5">
            <div
              className={`grid ${isAdmin ? "grid-cols-[60px_1fr_1fr_1fr_1fr_auto]" : "grid-cols-[60px_1fr_1fr_1fr_auto]"} 
            bg-blue-400 text-white rounded-lg items-center font-bold text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm`}
            >
              <span className="text-left">Sr#</span>
              {isAdmin && <span className="text-left">Employee Name</span>}
              <span className="text-left">Current Position</span>
              <span className="text-left">Resignation Date</span>
              <span className="text-left">Status</span>
              <span className="text-right w-[140px] pr-4">Actions</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="px-0.5 sm:px-1 py-2">
            {paginatedResignations.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">No records available!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedResignations.map((res, index) => (
                  <div
                    key={res.id}
                    className={`grid ${isAdmin ? "grid-cols-[60px_1fr_1fr_1fr_1fr_auto]" : "grid-cols-[60px_1fr_1fr_1fr_auto]"} 
                  items-center px-3 py-2 gap-3 text-sm bg-white border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-colors shadow-sm`}
                  >
                    <span className="text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="truncate text-gray-800">
                          {res.employee_name}
                        </span>
                      </div>
                    )}

                    <div className="text-gray-600 truncate">
                      {res.designation}
                    </div>

                    <div className="text-gray-600 truncate">
                      {new Date(res.resignation_date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </div>

                    <div className="flex items-center">
                      {getStatusBadge(res.approval_status)}
                    </div>

<div className="flex items-center justify-end gap-1 w-[140px]">
  <ViewButton handleView={() => handleViewClick(res)} />

  {isAdmin && (
    <>
      {/* Edit button - shows toast for ACCEPTED status */}
      <div className={res.approval_status?.toUpperCase() === "ACCEPTED" ? "opacity-50 cursor-not-allowed" : ""}>
        <EditButton
          handleUpdate={() => {
            if (res.approval_status?.toUpperCase() === "ACCEPTED") {
              toast.error("Cannot edit an accepted resignation", {
                toastId: `edit-accepted-${res.id}`,
                position: "top-right",
                autoClose: 3000,
              });
              return;
            }
            handleEditClick(res);
          }}
        />
      </div>

      {/* Delete button - shows toast for ACCEPTED status */}
      <div className={res.approval_status?.toUpperCase() === "ACCEPTED" ? "opacity-50 cursor-not-allowed" : ""}>
        <DeleteButton
          handleDelete={() => {
            if (res.approval_status?.toUpperCase() === "ACCEPTED") {
              toast.error("Cannot delete an accepted resignation", {
                toastId: `delete-accepted-${res.id}`,
                position: "top-right",
                autoClose: 3000,
              });
              return;
            }
            setSelectedId(res.id);
            handleToggleViewModal("DELETE");
          }}
        />
      </div>
    </>
  )}
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
          start={totalItems === 0 ? 0 : startIndex + 1}
          end={Math.min(endIndex, totalItems)}
          total={totalItems}
        />
        <Pagination
          pageNo={pageNo}
          totalNum={filteredResignations.length}
          pageSize={externalPageSize}
          handlePageClick={(targetPage) => setPageNo(targetPage)}
        />
      </div>
      {/* Modals */}
      {isOpenModal === "ADD" && (
        <AddResignation
          setModal={() => handleToggleViewModal("")}
          handleRefresh={handleGetAllResignations}
        />
      )}

      {isOpenModal === "EDIT" && selectedResignation && (
        <UpdateResignation
          setModal={() => handleToggleViewModal("")}
          resignationData={{
            id: String(selectedResignation.id),
            employee_name: selectedResignation.employee_name,
            designation: selectedResignation.designation,
            note: selectedResignation.note,
            date: selectedResignation.resignation_date,
            approval_status: selectedResignation.approval_status,
          }}
          handleRefresh={handleGetAllResignations}
        />
      )}

      {isOpenModal === "VIEW" && selectedResignation && (
        <ViewResignation
          setModal={() => handleToggleViewModal("")}
          resignationData={{
            employee_name: selectedResignation.employee_name,
            designation: selectedResignation.designation,
            note: selectedResignation.note,
            resignation_date: selectedResignation.resignation_date,
            approval_status: selectedResignation.approval_status,
          }}
        />
      )}

      {isOpenModal === "DELETE" && (
        <ConfirmationModal
          isOpen={() => {}}
          onClose={() => handleToggleViewModal("")}
          onConfirm={handleDeleteResignation}
          message="Are you sure you want to delete this Resignation?"
        />
      )}
    </div>
  );
};
