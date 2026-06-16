import React, { useState, useEffect } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { OptionField } from "../InputFields/OptionField";
import { useAppSelector } from "../../redux/Hooks";
import { Title } from "../Title";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/URL";

type UpdateLEAVET = {
  id: number;
  name: string;
  leaveSubject: string;
  leaveStatus: string;
  leaveReason: string;
  fromDate: string;
  toDate: string;
};

type UpdateLeaveProps = {
  setModal: () => void;
  EditLeave: UpdateLEAVET | null;
  refreshLeaves: () => Promise<void>;
};

const optionData = [
  { id: 1, label: "Approved", value: "Approved" },
  { id: 2, label: "Rejected", value: "Rejected" },
  { id: 3, label: "Pending", value: "Pending" },
];
const currentDate = new Date().toLocaleDateString("sv-SE", {
  timeZone: "Asia/Karachi",
});

export const UpdateLeave = ({
  setModal,
  EditLeave,
  refreshLeaves,
}: UpdateLeaveProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);

  const [updateLeave, setUpdateLeave] = useState({
    leaveSubject: "",
    fromDate: "",
    toDate: "",
    leaveReason: "",
  status: "Pending",
  });

  const [submitting, setSubmitting] = useState(false);
  const [attendanceConflict, setAttendanceConflict] = useState<{
    message: string;
    date: string;
    clockIn: string;
    attendanceStatus: string;
  } | null>(null);

  useEffect(() => {
    if (EditLeave) {
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("sv-SE", {
          timeZone: "Asia/Karachi",
        });
      };

      setUpdateLeave({
        leaveSubject: EditLeave.leaveSubject || "",
        fromDate: EditLeave.fromDate
          ? formatDate(EditLeave.fromDate)
          : currentDate,
        toDate: EditLeave.toDate ? formatDate(EditLeave.toDate) : currentDate,
        leaveReason: EditLeave.leaveReason || "",
       status: EditLeave.leaveStatus || "Pending",
      });
      setAttendanceConflict(null);
    }
  }, [EditLeave]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name } = e.target;
    let value = e.target.value;

    value = value.replace(/^\s+/, "");

    if (name === "leaveSubject") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
      value = value.slice(0, 50);
    }

    if (name === "leaveReason") {
      value = value.slice(0, 250);
    }

    setUpdateLeave((prev) => ({ ...prev, [name]: value }));
    
    // Clear conflict when status changes from approved
    if (name === "status" && value !== "approved") {
      setAttendanceConflict(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EditLeave) return;

    const { leaveSubject, fromDate, toDate, leaveReason, status } = updateLeave;

    if (!leaveSubject || !fromDate || !toDate || !leaveReason) {
      toast.error("Please fill all required fields", {
        toastId: "update-leave-required",
      });
      return;
    }

    // Date validation
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be after To date", {
        toastId: "invalid-date-range",
      });
      return;
    }

    setSubmitting(true);
    setAttendanceConflict(null);

    try {
      const payload = {
        fromDate: updateLeave.fromDate,
        toDate: updateLeave.toDate,
        leaveStatus: updateLeave.status,
        leaveSubject: updateLeave.leaveSubject,
        leaveReason: updateLeave.leaveReason,
      };

      await axios.put(
        `${BASE_URL}/api/admin/updateLeave/${EditLeave.id}`,
        payload,
      );
      toast.success("Leave updated successfully!", {
        toastId: "update-leave-success",
      });

      await refreshLeaves();
      setModal();
    } catch (error) {
      console.error("Update error:", error);
      
      // Handle attendance conflict error (409)
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const conflictData = error.response?.data;
        
        setAttendanceConflict({
          message: conflictData.message,
          date: conflictData.conflictDate,
          clockIn: conflictData.attendanceDetails?.clockIn,
          attendanceStatus: conflictData.attendanceDetails?.attendanceStatus
        });
        
        toast.error(conflictData.message, { 
          toastId: "attendance-conflict",
          autoClose: 8000
        });
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Invalid request", { 
          toastId: "invalid-request" 
        });
      } else {
        toast.error("Failed to update leave.", { toastId: "update-leave-error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center px-4 justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          {/* Header */}
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-xl font-semibold"
            >
              EDIT LEAVE
            </Title>
          </div>

          {/* Form Body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 px-4 py-6">
            <InputField
              labelName="Subject Leave*"
              type="text"
              name="leaveSubject"
              value={updateLeave.leaveSubject}
              handlerChange={handleChange}
              minLength={3}
              maxLength={50}
            />

            <InputField
              labelName="From Date*"
              type="date"
              name="fromDate"
              value={updateLeave.fromDate}
              handlerChange={handleChange}
            />

            <InputField
              labelName="To Date*"
              type="date"
              name="toDate"
              value={updateLeave.toDate}
              handlerChange={handleChange}
            />

            {/* Only show status dropdown for admins */}
            {currentUser?.role === "admin" && (
              <OptionField
                labelName="Status"
                name="status"
                value={updateLeave.status}
                handlerChange={handleChange}
                optionData={optionData}
                inital="Pending"
              />
            )}

            <div className="md:col-span-2">
              <TextareaField
                labelName="Leave Reason*"
                name="leaveReason"
                inputVal={updateLeave.leaveReason}
                handlerChange={handleChange}
                minLength={3}
                maxLength={250}
              />
            </div>
          </div>

          {/* Attendance Conflict Warning - Enhanced */}
          {attendanceConflict && updateLeave.status === "approved" && (
            <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-red-600 text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold mb-2">
                    Cannot approve leave - Attendance Conflict Detected!
                  </p>
                  <p className="text-red-700 text-sm mb-2">
                    {attendanceConflict.message}
                  </p>
                  <div className="bg-red-100 p-2 rounded mt-2">
                    <p className="text-red-800 text-xs">
                      📅 <strong>Date:</strong> {new Date(attendanceConflict.date).toLocaleDateString()}<br/>
                      {attendanceConflict.clockIn && (
                        <>⏰ <strong>Clock In:</strong> {attendanceConflict.clockIn}<br/></>
                      )}
                      {attendanceConflict.attendanceStatus && (
                        <>📊 <strong>Status:</strong> {attendanceConflict.attendanceStatus}</>
                      )}
                    </p>
                  </div>
                  <p className="text-red-600 text-xs mt-2">
                    Suggestion: Either reject this leave request or remove the attendance record first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 px-4 py-6 bg-white rounded">
            <CancelBtn setModal={setModal} />
            <AddButton
              loading={submitting}
              label={submitting ? "Updating" : "Update"}
              disabled={!!attendanceConflict && updateLeave.status === "approved"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};