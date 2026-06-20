import { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { RiInboxArchiveLine } from "react-icons/ri";

import { ShowDataNumber } from "../../Components/Pagination/ShowDataNumber";
import { Pagination } from "../../Components/Pagination/Pagination";
import { EditButton } from "../../Components/CustomButtons/EditButton";
import { DeleteButton } from "../../Components/CustomButtons/DeleteButton";
import { ViewButton } from "../../Components/CustomButtons/ViewButton";
import { AddTodo } from "../../Components/TodoModals/AddTodo";
import { UpdateTodo, TodoType } from "../../Components/TodoModals/UpdateTodo";
import { ViewTodo } from "../../Components/TodoModals/ViewTodo";
import { ConfirmationModal } from "../../Components/Modal/ComfirmationModal";
import { Loader } from "../../Components/LoaderComponent/Loader";
import { InputField } from "../../Components/InputFields/InputField";

import { BASE_URL } from "../../Content/URL";
import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import {
  navigationStart,
  navigationSuccess,
} from "../../redux/NavigationSlice";

type ALLTODOT = TodoType;
type TODOT = "Add" | "Edit" | "Delete" | "";

interface TodoProps {
  triggerModal: number;
  externalSearch: string;
  externalPageSize: number;
}

export const Todo = ({
  triggerModal,
  externalSearch,
  externalPageSize,
}: TodoProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const { loader } = useAppSelector((state) => state.NavigateState);
  const dispatch = useAppDispatch();
  const getMonthStartDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  };

  const getTodayDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const [allTodos, setAllTodos] = useState<ALLTODOT[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<ALLTODOT | null>(null);
  const [modalType, setModalType] = useState<TODOT>("");
  const [catchId, setCatchId] = useState<number | null>(null);
  const [pageNo, setPageNo] = useState(1);
  const [viewTodo, setViewTodo] = useState<ALLTODOT | null>(null);
  const [fromDate, setFromDate] = useState<string>(getMonthStartDate());
  const [toDate, setToDate] = useState<string>(getTodayDate());

  const token = currentUser?.token;
  const id = currentUser?.userId;

  const getAllTodos = useCallback(async () => {
    try {
      const res =
        currentUser?.role === "admin"
          ? await axios.get(`${BASE_URL}/api/admin/getTodos`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : await axios.get(`${BASE_URL}/api/user/getTodo/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

      const sortedTodos = res.data.sort(
        (a: TodoType, b: TodoType) => a.id - b.id,
      );
      setAllTodos(sortedTodos);
    } catch (error) {
      console.error(error);
    }
  }, [token, currentUser?.role, id]);

  useEffect(() => {
    getAllTodos();
    document.title = "(OMS) ALL Todos";
    dispatch(navigationStart());
    setTimeout(() => dispatch(navigationSuccess("TODOS")), 500);
  }, [dispatch, getAllTodos]);

  useEffect(() => {
    setPageNo(1);
  }, [externalSearch, externalPageSize]);

  useEffect(() => {
    if (triggerModal > 0) setModalType("Add");
  }, [triggerModal]);

  const filteredTodos = useMemo(() => {
    return allTodos.filter((todo) => {
      // 1. Text Search Filter
      const matchesSearch =
        todo.task.toLowerCase().includes(externalSearch.toLowerCase()) ||
        todo.employeeName
          ?.toLowerCase()
          .includes(externalSearch.toLowerCase()) ||
        todo.completionStatus
          ?.toLowerCase()
          .includes(externalSearch.toLowerCase());

      // 2. Date Range Filter (checking against startDate)
      const taskDateStr = todo.startDate
        ? new Date(todo.startDate).toISOString().split("T")[0]
        : "";

      let matchesDate = true;
      if (fromDate && toDate) {
        matchesDate = taskDateStr >= fromDate && taskDateStr <= toDate;
      } else if (fromDate) {
        matchesDate = taskDateStr >= fromDate;
      } else if (toDate) {
        matchesDate = taskDateStr <= toDate;
      }

      return matchesSearch && matchesDate;
    });
  }, [allTodos, externalSearch, fromDate, toDate]);

  const totalNum = filteredTodos.length;
  const startIndex = (pageNo - 1) * externalPageSize;
  const endIndex = startIndex + externalPageSize;
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  if (loader) return <Loader />;

  return (
    <div className="flex flex-col flex-grow bg-white overflow-hidden">
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
        <div className="min-w-[1000px]">
          {/* Header Section aligned with UsersDetails */}
          <div className="px-0.5 pt-0.5">
            <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] bg-blue-400 text-white rounded-lg items-center font-bold text-xs tracking-wider sticky top-0 z-10 gap-3 px-3 py-3 shadow-sm">
              <span className="text-left">Sr#</span>
              <span className="text-left">
                
              </span>
              <span className="text-left">Email</span>
              <span className="text-left">Task Detail</span>
              <span className="text-left">Start</span>
              <span className="text-left">End</span>
              <span className="text-left">Deadline</span>
              <span className="text-left">Status</span>
              <span className="text-right w-[140px] pr-4">Actions</span>
            </div>
          </div>

          {/* Body Section */}
          <div className="px-0.5 sm:px-1 py-2">
            {paginatedTodos.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border p-12 flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine size={48} className="mb-3 text-gray-300" />
                <p className="text-lg font-medium">No tasks available!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {paginatedTodos.map((todo, index) => (
                  <div
                    key={todo.id}
                    className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center px-3 py-2 gap-3 text-sm bg-white
                     border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-colors shadow-sm"
                  >
                    {/* Sr# */}
                    <span className="text-gray-500 font-medium">
                      {startIndex + index + 1}
                    </span>

                    {/* User Info (Admin) or ID */}
                    <div className="flex items-center gap-3 overflow-hidden">
                   
                    </div>

                    <div className="text-gray-600 truncate">
                      {todo.email || "-"}
                    </div>

                    {/* Task Detail */}
                    <div className="text-gray-600 truncate" title={todo.task}>
                      {todo.task}
                    </div>

                    {/* Start/End Dates */}
                    <div className="flex flex-col text-xs text-gray-600">
                      <span>{formatDate(todo.startDate)}</span>
                    </div>

                    <div
                      className="text-gray-600 truncate"
                      title={todo.endDate}
                    >
                      {formatDate(todo.endDate)}
                    </div>

                    {/* Deadline & Status Badge */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600">
                        {formatDate(todo.deadline)}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          todo.completionStatus === "Completed"
                            ? "bg-green-100 text-green-600 border border-green-200"
                            : todo.completionStatus === "Defer"
                              ? "bg-blue-100 text-blue-600 border border-blue-200"
                              : "bg-orange-100 text-orange-600 border border-orange-200"
                        }`}
                      >
                        {todo.completionStatus || "Pending"}
                      </span>
                    </div>

  {/* Actions */}
<div className="flex items-center justify-end gap-1 w-[140px]">
  <ViewButton handleView={() => setViewTodo(todo)} />
  
  {/* Permission-based Edit/Delete buttons */}
  {(() => {
    // Admin can edit/delete everything
    if (currentUser?.role === 'admin') {
      return (
        <>
          <EditButton
            handleUpdate={() => {
              setSelectedTodo(todo);
              setModalType("Edit");
            }}
          />
          <DeleteButton
            handleDelete={() => {
              setCatchId(todo.id);
              setModalType("Delete");
            }}
          />
        </>
      );
    }
    
    // Employee can only edit/delete their OWN created todos
    // (todos where they are the creator AND it's employee-created)
    if (
      todo.created_by_role === 'employee' && 
      todo.created_by === currentUser?.userId
    ) {
      return (
        <>
          <EditButton
            handleUpdate={() => {
              setSelectedTodo(todo);
              setModalType("Edit");
            }}
          />
          <DeleteButton
            handleDelete={() => {
              setCatchId(todo.id);
              setModalType("Delete");
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

      {/* Pagination Bar */}
      <div className="flex flex-row items-center justify-between p-1">
        <ShowDataNumber
          start={totalNum === 0 ? 0 : startIndex + 1}
          end={Math.min(endIndex, totalNum)}
          total={totalNum}
        />
        <Pagination
          pageNo={pageNo}
          totalNum={totalNum}
          pageSize={externalPageSize}
          handlePageClick={(targetPage) => setPageNo(targetPage)}
        />
      </div>

      {/* Modals */}
      {modalType === "Add" && (
        <AddTodo setModal={() => setModalType("")} getAllTodos={getAllTodos} />
      )}
      {modalType === "Edit" && selectedTodo && (
        <UpdateTodo
          setModal={() => setModalType("")}
          seleteTodo={selectedTodo}
          onUpdate={getAllTodos}
        />
      )}
      {viewTodo && (
        <ViewTodo
          setIsOpenModal={() => setViewTodo(null)}
          viewTodo={viewTodo}
        />
      )}
      {modalType === "Delete" && (
        <ConfirmationModal
          isOpen={() => setModalType("Delete")}
          onClose={() => setModalType("")}
          onConfirm={async () => {
            if (!catchId) return;
            await axios.patch(
              `${BASE_URL}/api/admin/deleteTodo/${catchId}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            );
            toast.success("Deleted successfully");
            getAllTodos();
            setModalType("");
          }}
        />
      )}
    </div>
  );
};
