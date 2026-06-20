import React, { useEffect, useState, useCallback } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import { UserSelect } from "../InputFields/UserSelect";
import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { OptionField } from "../InputFields/OptionField";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";

type AddProgressProps = {
  setModal: () => void;
  handleRefresh: () => void;
};

type UserT = {
  id: number | string;
  employeeName?: string;
  email: string;
  name?: string;
  loginStatus?: string;
  role: string;
};

type ProjectT = {
  id?: number;
  projectId?: number;
  projectName: string;
  projectCategory?: string;
};

const currentDate = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
})();

// Get max date (today) for disabling future dates
const maxDate = currentDate;

type AddProgressType = {
  employee_id: string;
  email?: string;
  projectId: string;
  date: string;
  note: string;
};

const initialState: AddProgressType = {
  employee_id: "",
  email: "",
  projectId: "",
  date: currentDate,
  note: "",
};

export const AddProgress = ({ setModal, handleRefresh }: AddProgressProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;
  const isAdmin = currentUser?.role === "admin";

  const [addProgress, setAddProgress] = useState<AddProgressType>(initialState);
  const [allUsers, setAllUsers] = useState<UserT[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectProject, setSelectProject] = useState<ProjectT[]>([]);

  const getAllUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data?.users ?? []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [token]);

  const fetchProjectsByUser = useCallback(
    async (userId: string | number) => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/getAssignProjects/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const projects = res.data?.projects || res.data?.data || res.data || [];
        setSelectProject(Array.isArray(projects) ? projects : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setSelectProject([]);
      }
    },
    [token],
  );

  useEffect(() => {
    if (isAdmin) getAllUsers();
  }, [isAdmin, getAllUsers]);

  useEffect(() => {
    if (!currentUser || !token || isAdmin) return;

    const fetchMyProjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/getAssignProjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projects = res.data || [];
        setSelectProject(Array.isArray(projects) ? projects : []);
      } catch (err) {
        console.error("Error fetching my projects:", err);
        setSelectProject([]);
      }
    };

    setAddProgress((prev) => ({
      ...prev,
      employee_id: String(currentUser.id || currentUser.userId || ""),
    }));
    fetchMyProjects();
  }, [currentUser, token, isAdmin]);

  const handlerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "note") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 250);
    }

    setAddProgress((prev) => ({ ...prev, [name]: updatedValue }));

    if (name === "employee_id") {
      const selectedUser = allUsers.find((u) => String(u.id) === value);

      setAddProgress((prev) => ({
        ...prev,
        employee_id: value,
        email: selectedUser?.email || "", // ✅ SET EMAIL
        projectId: "",
      }));

      fetchProjectsByUser(value);
      return;
    }
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !addProgress.employee_id ||
      !addProgress.projectId ||
      !addProgress.date ||
      !addProgress.note
    ) {
      return toast.error("Please fill all required fields", {
        toastId: "required-fields",
      });
    }

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/admin/addProgress`,
        {
          ...addProgress,

          projectId: Number(addProgress.projectId),
          date: addProgress.date,
          note: addProgress.note,
          ...(isAdmin && { employee_id: addProgress.employee_id }),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Progress added successfully!", {
        toastId: "add-progress-success",
      });

      handleRefresh();
      setModal();
      setAddProgress(initialState);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to add progress";

        if (error.response?.status === 409) {
          toast.error(message, {
            toastId: "duplicate-progress-error",
            autoClose: 8000,
          });
        } else {
          toast.error(message, { toastId: "add-progress-error" });
        }
      } else {
        toast.error("Something went wrong!", { toastId: "add-progress-error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const userOptions = isAdmin
    ? allUsers
        .filter(
          (u) => u.role === "user" && u.loginStatus === "Y" && u.id != null,
        )
        .map((u) => ({
          id: Number(u.id),
          name: u.employeeName || u.name || "User",
          value: String(u.id),
          label: u.employeeName || u.name || "User",
          loginStatus: u.loginStatus || "Y",
          projectName: "",
          role: u.role,
        }))
    : [];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur  px-4  flex items-center justify-center z-50">
      <div className="w-[42rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
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
              ADD PROGRESS
            </Title>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 mx-4 py-6 space-y-2">
            <div className="md:col-span-2">
              {isAdmin && (
                <UserSelect
                  labelName="Employees*"
                  name="employee_id"
                  value={addProgress.employee_id}
                  handlerChange={handlerChange}
                  disabled={false}
                  optionData={userOptions}
                />
              )}
            </div>

            <OptionField
              labelName="Project*"
              name="projectId"
              value={addProgress.projectId}
              handlerChange={handlerChange}
              optionData={selectProject.map((p, index) => ({
                id: p.projectId ?? p.id ?? index + 1,
                value: String(p.projectId ?? p.id ?? ""),
                label: p.projectCategory
                  ? `${p.projectName} (${p.projectCategory})`
                  : p.projectName,
              }))}
              inital={
                selectProject.length
                  ? "Please Select Project"
                  : "No projects available"
              }
            />

            <InputField
              labelName="Date*"
              name="date"
              type="date"
              handlerChange={handlerChange}
              value={addProgress.date}
              max={maxDate}
              className="future-date-disabled"
            />

            <div className="md:col-span-2">
              <TextareaField
                labelName="Note*"
                name="note"
                handlerChange={handlerChange}
                inputVal={addProgress.note}
                minLength={3}
                maxLength={250}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 rounded py-6 bg-white">
            <CancelBtn setModal={setModal} />
            <AddButton loading={loading} label={loading ? "Saving" : "Save"} />
          </div>
        </form>
      </div>
    </div>
  );
};