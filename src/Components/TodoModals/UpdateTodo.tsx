import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import { UserSelect } from "../InputFields/UserSelect";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { TextareaField } from "../InputFields/TextareaField";
import { toast } from "react-toastify";

import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

export type TodoType = {
  id: number;
  employee_id: number;
  employeeName?: string;
  email?: string;
  name: string;
  task: string;
  startDate: string;
  endDate: string;
  completionStatus: string;
  todoStatus: "Y" | "N";
  note: string;
  deadline: string;
  created_by: number;        // Add this
  created_by_role: 'admin' | 'employee';  // Add this
};

type UserT = {
  id: number;
  name?: string;
  employeeName?: string;
  loginStatus?: string;
};

type UpdateTodoProps = {
  setModal: () => void;
  seleteTodo: TodoType | null;
  onUpdate: (updatedTodo: TodoType) => void;
};

const StatusOptions: { id: number; label: string; value: string }[] = [
  { id: 1, label: "Completed", value: "Completed" },
  { id: 2, label: "Defer", value: "Defer" },
  { id: 2, label: "Pending", value: "Pending" },
];

export const UpdateTodo = ({
  setModal,
  seleteTodo,
  onUpdate,
}: UpdateTodoProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;
  const isAdmin = currentUser?.role === "admin";

  const [todo, setTodo] = useState<TodoType | null>(seleteTodo);
  const [loading, setLoading] = useState(false);

  const [allUsers, setAllUsers] = useState<UserT[]>([]);

  const handlerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "task") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    if (name === "note") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 250);
    }

    setTodo((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "employee_id" ? Number(updatedValue) : updatedValue,
          }
        : prev,
    );
  };

  const getAllUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res?.data?.users ?? []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!seleteTodo) return;

    const formatDateForInput = (dateStr?: string) => {
      if (!dateStr) return "";

      const date = new Date(dateStr);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    setTodo({
      ...seleteTodo,
      startDate: formatDateForInput(seleteTodo.startDate),
      endDate: formatDateForInput(seleteTodo.endDate),
      deadline: formatDateForInput(seleteTodo.deadline),
    });
  }, [seleteTodo]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo?.id) return;

    if (
      !todo.task ||
      !todo.startDate ||
      !todo.endDate ||
      !todo.deadline ||
      !todo.note ||
      (isAdmin && !todo.employee_id)
    ) {
      return toast.error(
        "Please fill all required fields (Task, Dates, Note, Employee)",
        { toastId: "required-fields" },
      );
    }

    if (
      new Date(todo.startDate) > new Date(todo.deadline) &&
      new Date(todo.endDate) > new Date(todo.deadline)
    ) {
      toast.error("Start Date and End Date cannot be later than Deadline", {
        toastId: "date-validation",
      });
      return;
    }

    if (new Date(todo.startDate) > new Date(todo.endDate)) {
      return toast.error("Start Date cannot be later than End Date", {
        toastId: "date-validation-update",
      });
    }

    if (new Date(todo.startDate) > new Date(todo.deadline)) {
      return toast.error("Start Date cannot be later than Deadline", {
        toastId: "date-validation-update",
      });
    }

    if (new Date(todo.endDate) > new Date(todo.deadline)) {
      return toast.error("End Date cannot be later than Deadline", {
        toastId: "date-validation-update",
      });
    }

    setLoading(true);

    try {
      await axios.put(
        `${BASE_URL}/api/admin/updateTodo/${todo.id}`,
        {
          employee_id: todo.employee_id,
          task: todo.task,
          note: todo.note,
          startDate: todo.startDate,
          endDate: todo.endDate,
          deadline: todo.deadline,
          completionStatus: todo.completionStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onUpdate({ ...todo });

      toast.success("Todo updated successfully!", {
        toastId: "update-success",
      });
      setModal();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update Todo!";
        toast.error(message, { toastId: "update-error" });
      } else {
        toast.error("Something went wrong!", { toastId: "update-error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const userOptions = useMemo(() => {
    return allUsers
      .filter((u) => u.loginStatus === "Y")
      .map((u) => ({
        id: u.id,
        value: String(u.id),
        label: u.employeeName || u.name || "User",
        name: u.employeeName || u.name || "User",
        loginStatus: u.loginStatus || "",
        projectName: "",
      }));
  }, [allUsers]);

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs px-4  flex items-center justify-center z-50">
      <div className="w-[42rem] max-h-[45rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl ">
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-lg font-semibold"
            >
              EDIT TODO
            </Title>
          </div>
          <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2  py-6 gap-3">
            <div className="md:col-span-2">
              {isAdmin && (
                <UserSelect
                  labelName="Employees *"
                  name="employee_id"
                  value={todo?.employee_id?.toString() || ""}
                  handlerChange={handlerChange}
                  optionData={userOptions}
                />
              )}
            </div>

            <InputField
              labelName="Task *"
              name="task"
              handlerChange={handlerChange}
              value={todo?.task}
              minLength={3}
              maxLength={50}
            />

            <InputField
              labelName="Start Date *"
              type="date"
              name="startDate"
              handlerChange={handlerChange}
              value={todo?.startDate}
            />
            <InputField
              labelName="End Date *"
              type="date"
              name="endDate"
              handlerChange={handlerChange}
              value={todo?.endDate}
            />
            <InputField
              labelName="Deadline *"
              type="date"
              name="deadline"
              handlerChange={handlerChange}
              value={todo?.deadline}
            />

            <div className="md:col-span-2">
              <OptionField
                labelName="Completion Status"
                name="completionStatus"
                value={todo?.completionStatus || ""}
                handlerChange={handlerChange}
                optionData={StatusOptions}
                inital="Select Completion Status"
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                labelName="Note *"
                name="note"
                inputVal={todo?.note || ""}
                handlerChange={handlerChange}
                minLength={3} // Add this
                maxLength={250}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 rounded py-6 bg-white">
            <CancelBtn setModal={setModal} />
            <AddButton
              loading={loading}
              label={loading ? "Updating" : "Update"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
