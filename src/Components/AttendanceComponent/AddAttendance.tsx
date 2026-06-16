import React, { useEffect, useState, useCallback } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { Title } from "../Title";
import { BASE_URL } from "../../Content/URL";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useAppSelector } from "../../redux/Hooks";
import { UserSelect } from "../InputFields/UserSelect";
const isFutureDate = (dateString: string): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  
  // Reset time part for accurate date comparison
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  return selectedDate > today;
};
type AddAttendanceProps = {
  setModal: () => void;
  handleGetALLattendance: () => void;
};

type User = {
  id: number;
  name: string;
  email: string;
  value: string;
  label: string;
  loginStatus: "Y" | "N";
  role: "admin" | "user";
};

const currentDate = new Date().toLocaleDateString("sv-SE");

const reasonLeaveOption = [
  {
    id: 1,
    label: "Present",
    value: "present",
  },

  {
    id: 2,
    label: "Half Leave",
    value: "half leave",
  },

  {
    id: 3,
    label: "Late",
    value: "late",
  },

  {
    id: 4,
    label: "Absent",
    value: "absent",
  },
  {
    id: 5,
    label: "Leave",
    value: "leave",
  },
];
const initialState = {
  selectUser: "",
  date: currentDate,
  clockIn: "",
  clockOut: "",
  attendanceStatus: "",
};
export const AddAttendance = ({
  setModal,
  handleGetALLattendance,
}: AddAttendanceProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);

  const [addUserAttendance, setAddUserAttendance] = useState(initialState);
const [allLeaves, setAllLeaves] = useState<any[]>([]); // Change from approvedLeaves
  const [allUsers, setAllUsers] = useState<User[]>([]);
const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token = currentUser?.token;
  const handlerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
      if (name === "date") {
    if (isFutureDate(value)) {
      toast.error("Cannot select future date for attendance", {
        toastId: "future-date-error",
      });
      return;
    }
  }
    setAddUserAttendance({ ...addUserAttendance, [name]: value.trim() });
  };
const isUserOnLeave = (userId: number, date: string): boolean => {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return false;
  
  return allLeaves.some((leave) => {
    // Check if the leave belongs to this user
    if (leave.name !== user.name) return false;
    
    // Check if leave is pending or approved (NOT rejected)
    if (leave.leaveStatus === "Rejected") return false;
    
    const fromDate = new Date(leave.fromDate);
    const toDate = new Date(leave.toDate);
    const checkDate = new Date(date);
    
    // Reset time parts for accurate comparison
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    
    // Check if the selected date falls within the leave period
    return checkDate >= fromDate && checkDate <= toDate;
  });
};
  const isAbsentOrLeave =
    addUserAttendance.attendanceStatus === "absent" ||
    addUserAttendance.attendanceStatus === "leave";

  const handlerGetUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filteredUsers = res.data.users
        .filter(
          (user: User) => user.loginStatus === "Y" && user.role === "user",
        )
        .map((user: User) => ({
          ...user,
          value: user.id,
          label: user.name,
        }));

      setAllUsers(filteredUsers);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError?.response?.data?.message);
    }
  }, [token]);
const handlerGetUsersLeaves = useCallback(async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/admin/getUsersLeaves`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Store ALL leaves (pending, approved, rejected)
    setAllLeaves(res.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error("Error fetching leaves:", axiosError?.response?.data?.message);
  }
}, [token]);
  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { selectUser, date, attendanceStatus, clockIn, clockOut } =
      addUserAttendance;

    // Validation
    if (!selectUser || !date || !attendanceStatus) {
      toast.error("Please fill all required fields");
      return;
    }
  if (isFutureDate(date)) {
    toast.error("Attendance cannot be marked for future dates", {
      toastId: "future-date-validation",
    });
    return;
  }
    if (isUserOnLeave(Number(selectUser), date)) {
    toast.error("Cannot mark attendance on this date as the employee has applied for leave (Pending or Approved)", {
      toastId: "user-on-leave",
    });
    return;
  }
    if (
      ["present", "late", "half leave"].includes(attendanceStatus) &&
      (!clockIn || !clockOut)
    ) {
      toast.error("Clock In and Clock Out are required");
      return;
    }

    setLoading(true);
    try {
      // Make sure we're sending only the fields the backend expects
      const attendanceData = {
        date,
        clockIn: ["present", "late", "half leave"].includes(attendanceStatus)
          ? clockIn
          : null,

        clockOut: ["present", "late", "half leave"].includes(attendanceStatus)
          ? clockOut
          : null,
        attendanceStatus,
      };

      const res = await axios.post(
        `${BASE_URL}/api/admin/addAttendance/${selectUser}`,
        attendanceData, // Send only required data
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Response:", res.data);
      toast.success("Attendance added successfully");
      setModal();
      handleGetALLattendance();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error("Error details:", axiosError.response?.data); // Log full error response
      toast.error(
        axiosError?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  handlerGetUsers();
  handlerGetUsersLeaves();
}, [handlerGetUsers, handlerGetUsersLeaves]);

  useEffect(() => {
    if (isAbsentOrLeave) {
      setAddUserAttendance((prev) => ({
        ...prev,
        clockIn: "",
        clockOut: "",
      }));
    }
  }, [isAbsentOrLeave]);
useEffect(() => {
  if (addUserAttendance.date && allUsers.length > 0 && allLeaves.length > 0) {
    const availableUsers = allUsers.filter((user) => {
      return !isUserOnLeave(user.id, addUserAttendance.date);
    });
    setFilteredUsers(availableUsers);
    
    // Clear selected user and show error if they are on leave
    if (addUserAttendance.selectUser) {
      const isSelectedUserOnLeave = isUserOnLeave(
        Number(addUserAttendance.selectUser), 
        addUserAttendance.date
      );
      if (isSelectedUserOnLeave) {
        setAddUserAttendance((prev) => ({ ...prev, selectUser: "" }));
        toast.error("This employee has applied for leave on this date (Pending or Approved)", {
          toastId: "leave-conflict",
        });
      }
    }
  } else {
    setFilteredUsers(allUsers);
  }
}, [addUserAttendance.date, allUsers, allLeaves]);
  return (
    <div>
      <div className="fixed inset-0  bg-opacity-50 backdrop-blur-xs px-4 flex items-center justify-center z-50">
        <div className="w-[42rem] max-h-[28rem]  overflow-y-auto bg-white mx-auto rounded-xl shadow-xl ">
          <form
            onSubmit={handlerSubmitted}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          >
            <div className="bg-white rounded-xl border-t-5 border-blue-400">
              <Title
                setModal={setModal}
                className="text-white text-lg font-semibold"
              >
                ADD ATTENDANCE
              </Title>
            </div>

            <div className="mx-4  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 py-6  ">
              <UserSelect
                labelName="Select User *"
                name="selectUser"
                value={addUserAttendance.selectUser}
                handlerChange={handlerChange}
                 optionData={filteredUsers} 
              />

            <InputField
  labelName="Date *"
  type="date"
  name="date"
  value={addUserAttendance.date ?? ""}
  handlerChange={handlerChange}
  max={currentDate}
/>

              <div className="md:col-span-2">
                <OptionField
                  labelName="Attendance Status *"
                  name="attendanceStatus"
                  value={addUserAttendance.attendanceStatus}
                  handlerChange={handlerChange}
                  optionData={reasonLeaveOption}
                  inital="Please Select Status"
                />
              </div>

              <InputField
                labelName="Clock In *"
                type="time"
                name="clockIn"
                value={addUserAttendance.clockIn}
                handlerChange={handlerChange}
                disabled={isAbsentOrLeave}
              />

              <InputField
                labelName="Clock Out *"
                type="time"
                name="clockOut"
                value={addUserAttendance.clockOut}
                handlerChange={handlerChange}
                disabled={isAbsentOrLeave}
              />
            </div>

            <div className="flex justify-end  gap-3 px-4 py-6 bg-white rounded-xl">
              <CancelBtn setModal={setModal} />
              <AddButton
                loading={loading}
                label={loading ? "Saving" : "Save"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


