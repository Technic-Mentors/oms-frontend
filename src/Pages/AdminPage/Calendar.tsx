import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";
import { Pagination } from "../../Components/Pagination/Pagination";
import { ShowDataNumber } from "../../Components/Pagination/ShowDataNumber";
import { EditButton } from "../../Components/CustomButtons/EditButton";
import { DeleteButton } from "../../Components/CustomButtons/DeleteButton";
import { ViewButton } from "../../Components/CustomButtons/ViewButton";
import { useCallback, useEffect, useState } from "react";
import { AddCalendarSession } from "../../Components/CalendarModal/AddCalendarSession";
import { ActivateCalendarSession } from "../../Components/CalendarModal/ActivateCalendarSession";
import { EditCalendarSession } from "../../Components/CalendarModal/EditCalendarSession";
import { ViewCalendarSession } from "../../Components/CalendarModal/ViewCalendarSession";
import { ConfirmationModal } from "../../Components/Modal/ComfirmationModal";
import { RiInboxArchiveLine } from "react-icons/ri";

import { Loader } from "../../Components/LoaderComponent/Loader";

type CALENDART = "ADD" | "EDIT" | "VIEW" | "DELETE" | "ACTIVATE" | "";

type CalendarSession = {
  id?: number;
  session_name: string;
  year: string;
  month: string;
  calendarStatus?: string;
};

interface CalendarProps {
  externalSearch: string;
  externalPageSize: number;
  triggerModal: number;
  triggerActivateModal: number;
}

export const Calendar = ({
  externalSearch,
  externalPageSize,
  triggerModal,
  triggerActivateModal,
}: CalendarProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const { loader } = useAppSelector((state) => state.NavigateState);
  const dispatch = useAppDispatch();

  const [isOpenModal, setIsOpenModal] = useState<CALENDART>("");
  const [pageNo, setPageNo] = useState(1);
  const [calendarList, setCalendarList] = useState<CalendarSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<CalendarSession | null>(null);

  const token = currentUser?.token;

  // Sync "Add" modal with parent button trigger
  useEffect(() => {
    if (triggerModal > 0) {
      setIsOpenModal("ADD");
    }
  }, [triggerModal]);

  // Sync "Activate" modal with parent button trigger
  useEffect(() => {
    if (triggerActivateModal > 0) {
      setIsOpenModal("ACTIVATE");
    }
  }, [triggerActivateModal]);


  const handleToggleViewModal = (active: CALENDART) => {
    setIsOpenModal((prev) => (prev === active ? "" : active));
  };

const handleGetAllCalendar = useCallback(
  async (externalData?: CalendarSession[]): Promise<void> => {
    try {
      let mappedData: CalendarSession[];
      if (externalData) {
        mappedData = externalData;
      } else {
        const res = await axios.get(
          `${BASE_URL}/api/admin/getCalendarSession`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        mappedData = (res.data.data || res.data).map(
          (item: CalendarSession) => ({
            id: item.id,
            session_name: item.session_name,
            year: item.year,
            month: item.month,
            calendarStatus: item.calendarStatus,
            // Add this computed property
            isActive: item.calendarStatus === "Active", // Note: "Active" not "ACTIVE"
          }),
        );
      }
      setCalendarList(mappedData);
    } catch (error) {
      console.error("Error fetching calendar sessions:", error);
    }
  },
  [token],
);

  const handleDeleteCalendarSession = async () => {
    if (!selectedSession?.id) return;
    try {
      await axios.delete(
        `${BASE_URL}/api/admin/deleteCalendarSession/${selectedSession.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await handleGetAllCalendar();
      handleToggleViewModal("");
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };
const handleDeleteClick = (item: CalendarSession) => {
  // Check if calendarStatus is "Active" (not InActive)
  if (item.calendarStatus === "Active") {
    toast.error("Cannot delete an active calendar session. Please deactivate it first.", {
      toastId: "active-session-delete"
    });
    return;
  }
  setSelectedSession(item);
  handleToggleViewModal("DELETE");
};
  useEffect(() => {
    handleGetAllCalendar();
    document.title = "(OMS) CALENDAR";
    dispatch(navigationStart());
    setTimeout(() => {
      dispatch(navigationSuccess("CALENDAR"));
    }, 1000);
  }, [dispatch, handleGetAllCalendar]);

  const uniqueSessions = calendarList.reduce<CalendarSession[]>((acc, curr) => {
    if (!acc.find((s) => s.session_name === curr.session_name)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  const filteredCalendarList = uniqueSessions.filter((item) =>
    `${item.session_name}`.toLowerCase().includes(externalSearch.toLowerCase()),
  );

  const startIndex = (pageNo - 1) * externalPageSize;
  const endIndex = startIndex + externalPageSize;
  const paginatedCalendarList = filteredCalendarList.slice(
    startIndex,
    endIndex,
  );

  if (loader) return <Loader />;

  return (
    <div className="flex flex-col flex-grow bg-white overflow-hidden">
      {/* Main Table Area */}
      <div className="overflow-auto px-0.5 py-2">
        <div className="min-w-[800px]">
          <div className="px-0.5 pt-0.5">
            {/* Grid Header aligned with UsersDetails style */}
            <div className="grid grid-cols-[60px_1fr_auto] bg-blue-400 text-white rounded-lg items-center font-bold text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm">
              <span className="text-left">Sr#</span>
              <span className="text-left">Session Name</span>
              <span className="text-right w-[140px] pr-4">Actions</span>
            </div>
          </div>

          <div className="px-0.5 py-2">
            {paginatedCalendarList.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">No records available!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedCalendarList.map((item, index) => (
                  <div
                    key={item.id || index}
                    /* Grid Body aligned with Header */
                    className="grid grid-cols-[60px_1fr_auto] items-center px-3 py-2 gap-3 text-sm bg-white border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-colors shadow-sm"
                  >
                    <span className="text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>

                    {/* Icon removed from Session Name div */}
                    <div className="text-gray-800 truncate">
                      {item.session_name}
                    </div>

                    <div className="flex items-center justify-end gap-1 w-[140px]">
                      <ViewButton
                        handleView={() => {
                          setSelectedSession(item);
                          handleToggleViewModal("VIEW");
                        }}
                      />
                      <EditButton
                        handleUpdate={() => {
                          setSelectedSession(item);
                          handleToggleViewModal("EDIT");
                        }}
                      />
                 <DeleteButton
  handleDelete={() => handleDeleteClick(item)}
/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-row items-center justify-between p-3 border-t border-gray-100">
        <ShowDataNumber
          start={filteredCalendarList.length === 0 ? 0 : startIndex + 1}
          end={Math.min(endIndex, filteredCalendarList.length)}
          total={filteredCalendarList.length}
        />
         <Pagination
                 pageNo={pageNo}
                 totalNum={filteredCalendarList.length}
                 pageSize={externalPageSize}
                 handlePageClick={(targetPage) => setPageNo(targetPage)}
               />
      </div>

      {/* Modals */}
      {isOpenModal === "ADD" && (
        <AddCalendarSession
          setModal={() => handleToggleViewModal("")}
          refreshCalendar={handleGetAllCalendar}
        />
      )}
      {isOpenModal === "EDIT" && selectedSession && (
        <EditCalendarSession
          setModal={() => handleToggleViewModal("")}
          refreshCalendar={handleGetAllCalendar}
          selectedSession={selectedSession}
        />
      )}
      {isOpenModal === "VIEW" && selectedSession && (
        <ViewCalendarSession
          setModal={() => handleToggleViewModal("")}
          selectedSession={selectedSession}
          allSessions={calendarList}
        />
      )}
      {isOpenModal === "DELETE" && (
        <ConfirmationModal
          isOpen={() => {}}
          onClose={() => setIsOpenModal("")}
          onConfirm={handleDeleteCalendarSession}
        />
      )}
      {isOpenModal === "ACTIVATE" && (
        <ActivateCalendarSession
          setModal={() => handleToggleViewModal("")}
          refreshSessions={handleGetAllCalendar}
        />
      )}
    </div>
  );
};
