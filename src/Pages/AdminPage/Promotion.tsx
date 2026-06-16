import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShowDataNumber } from "../../Components/Pagination/ShowDataNumber";
import { Pagination } from "../../Components/Pagination/Pagination";

import { EditButton } from "../../Components/CustomButtons/EditButton";
import { DeleteButton } from "../../Components/CustomButtons/DeleteButton";
import { ViewButton } from "../../Components/CustomButtons/ViewButton";

import { AddPromotion } from "../../Components/PromotionModal/AddPromotion";
import { UpdatePromotion } from "../../Components/PromotionModal/UpdatePromotion";
import { ViewPromotion } from "../../Components/PromotionModal/ViewPromotion";

import { ConfirmationModal } from "../../Components/Modal/ComfirmationModal";
import { Loader } from "../../Components/LoaderComponent/Loader";

import { BASE_URL } from "../../Content/URL";
import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";

import { RiInboxArchiveLine } from "react-icons/ri";

export type ALLPROMOTION = {
  id: number;
  employee_id: number;
  employee_name: string;
  current_designation: string;
  requested_designation: string;
  approval: string;
  note: string;
  date: string;
};

interface PromotionProps {
  triggerModal: number;
  externalSearch: string;
  externalPageSize: number;
}

export const Promotion = ({
  triggerModal,
  externalSearch,
  externalPageSize,
}: PromotionProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const { loader } = useAppSelector((state) => state.NavigateState);
  const dispatch = useAppDispatch();
  const token = currentUser?.token;

  const isAdmin = currentUser?.role === "admin";

  const [allPromotions, setAllPromotions] = useState<ALLPROMOTION[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<
    "ADD" | "VIEW" | "EDIT" | "DELETE" | ""
  >("");
  const [selectedPromotion, setSelectedPromotion] =
    useState<ALLPROMOTION | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [pageNo, setPageNo] = useState(1);

  const handleGetAllPromotions = useCallback(async () => {
    if (!token || !currentUser) return;
    try {
      const url =
        currentUser.role === "admin"
          ? `${BASE_URL}/api/admin/getPromotions`
          : `${BASE_URL}/api/user/getMyPromotions`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllPromotions(
        Array.isArray(res.data) ? res.data.sort((a, b) => a.id - b.id) : [],
      );
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      setAllPromotions([]);
    }
  }, [token, currentUser]);

  const handleDeletePromotion = async () => {
    if (!selectedId || !token) return;
    try {
      const url =
        currentUser.role === "admin"
          ? `${BASE_URL}/api/admin/deletePromotion/${selectedId}`
          : `${BASE_URL}/api/user/deletePromotion/${selectedId}`;

      await axios.patch(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      handleGetAllPromotions();
      setIsOpenModal("");
      setSelectedId(null);
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  useEffect(() => {
    handleGetAllPromotions();
    document.title = "(OMS) PROMOTION";
    dispatch(navigationStart());
    setTimeout(() => dispatch(navigationSuccess("Promotion")), 500);
  }, [dispatch, handleGetAllPromotions]);

  useEffect(() => {
    setPageNo(1);
  }, [externalSearch, externalPageSize]);

  useEffect(() => {
    if (triggerModal > 0) {
      setIsOpenModal("ADD");
    }
  }, [triggerModal]);

  if (loader) return <Loader />;

  const filteredPromotions = allPromotions.filter(
    (p) =>
      p.employee_name.toLowerCase().includes(externalSearch.toLowerCase()) ||
      p.current_designation
        .toLowerCase()
        .includes(externalSearch.toLowerCase()) ||
      p.requested_designation
        .toLowerCase()
        .includes(externalSearch.toLowerCase()),
  );

  const totalItems = filteredPromotions.length;
  const startIndex = (pageNo - 1) * externalPageSize;
  const endIndex = startIndex + externalPageSize;
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    const baseClasses =
      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm";
    const styles: Record<string, string> = {
      ACCEPTED: "bg-green-100 text-green-700 border-green-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
      PENDING: "bg-orange-100 text-orange-700 border-orange-200",
      DEFAULT: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <span className={`${baseClasses} ${styles[s] || styles.DEFAULT}`}>
        {status || "PENDING"}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-grow bg-white overflow-hidden">
      <div className="overflow-auto px-3 sm:px-0">
        <div className="min-w-[1000px]">
          {/* Header Section */}
          <div className="px-0.5 pt-0.5">
            <div
              className={`grid ${
                isAdmin
                  ? "grid-cols-[60px_1.5fr_1fr_1fr_120px_auto]"
                  : "grid-cols-[60px_1fr_1fr_120px_auto]"
              } bg-blue-400 text-white rounded-lg items-center font-bold text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm`}
            >
              <span className="text-left">Sr#</span>
              {isAdmin && <span className="text-left">Employee</span>}
              <span className="text-left">Current Position</span>
              <span className="text-left">Requested Position</span>
              <span className="text-left">Status</span>
              <span className="text-right w-[140px] pr-4">Actions</span>
            </div>
          </div>

          {/* Body Section */}
          <div className="px-0.5 sm:px-1 py-2">
            {paginatedPromotions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">
                  No records available at the moment!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedPromotions.map((promotion, index) => (
                  <div
                    key={promotion.id}
                    className={`grid ${
                      isAdmin
                        ? "grid-cols-[60px_1.5fr_1fr_1fr_120px_auto]"
                        : "grid-cols-[60px_1fr_1fr_120px_auto]"
                    } items-center px-3 py-2 gap-3 text-sm bg-white border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-colors shadow-sm`}
                  >
                    <span className="text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="truncate  text-gray-800">
                          {promotion.employee_name}
                        </span>
                      </div>
                    )}

                    <div className="text-gray-600 truncate">
                      {promotion.current_designation}
                    </div>

                    <div className="truncate font-medium text-gray-600">
                      {promotion.requested_designation}
                    </div>

                    <div className="flex items-center">
                      {getStatusBadge(promotion.approval)}
                    </div>
<div className="flex items-center justify-end gap-1 w-[140px]">
  <ViewButton
    handleView={() => {
      setSelectedPromotion(promotion);
      setIsOpenModal("VIEW");
    }}
  />

  {isAdmin && (
    <>
      {/* Edit button - shows toast for ACCEPTED status */}
      <EditButton
        handleUpdate={() => {
          if (promotion.approval === "accepted") {
            toast.error("Cannot edit an accepted promotion", {
              toastId: `edit-accepted-${promotion.id}`,
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }
          setSelectedPromotion(promotion);
          setIsOpenModal("EDIT");
        }}
      />

      {/* Delete button - shows toast for ACCEPTED status */}
      <DeleteButton
        handleDelete={() => {
          if (promotion.approval === "accepted") {
            toast.error("Cannot delete an accepted promotion", {
              toastId: `delete-accepted-${promotion.id}`,
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }
          setSelectedId(promotion.id);
          setIsOpenModal("DELETE");
        }}
      />
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

      {/* Footer Section */}
      <div className="flex flex-row items-center justify-between p-1 mt-auto">
        <ShowDataNumber
          start={totalItems === 0 ? 0 : startIndex + 1}
          end={Math.min(endIndex, totalItems)}
          total={totalItems}
        />
          <Pagination
                  pageNo={pageNo}
                  totalNum={filteredPromotions.length}
                  pageSize={externalPageSize}
                  handlePageClick={(targetPage) => setPageNo(targetPage)}
                />
      </div>

      {/* Modals remain unchanged */}
      {isOpenModal === "ADD" && (
        <AddPromotion
          setModal={() => setIsOpenModal("")}
          handleRefresh={handleGetAllPromotions}
        />
      )}
      {isOpenModal === "EDIT" && selectedPromotion && (
        <UpdatePromotion
          setModal={() => setIsOpenModal("")}
          promotionData={selectedPromotion}
          handleRefresh={handleGetAllPromotions}
        />
      )}
      {isOpenModal === "VIEW" && selectedPromotion && (
        <ViewPromotion
          setModal={() => setIsOpenModal("")}
          promotionData={selectedPromotion}
        />
      )}
      {isOpenModal === "DELETE" && (
        <ConfirmationModal
          isOpen={() => {}}
          onClose={() => setIsOpenModal("")}
          onConfirm={handleDeletePromotion}
          message="Are you sure you want to delete this promotion?"
        />
      )}
    </div>
  );
};
