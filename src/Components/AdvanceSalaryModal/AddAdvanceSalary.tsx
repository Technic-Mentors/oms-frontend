import React, { useCallback, useEffect, useState } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import { UserSelect } from "../InputFields/UserSelect";
import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";

type AddAdvanceSalaryProps = {
  setModal: () => void;
  handleRefresh?: () => void;
};

type User = {
  id: number | string;
  name?: string;
  employee_name?: string;
  role: string;
  loginStatus: "Y" | "N" | string;
};

type AdvanceSalaryFormType = {
  employee_id: string;
  date: string;
  description: string;
  amount: string;
};

const today = new Date();
const currentDate = today.toLocaleDateString("sv-SE");

const initialState: AdvanceSalaryFormType = {
  employee_id: "",
  date: currentDate,
  description: "",
  amount: "",
};

export const AddAdvanceSalary = ({
  setModal,
  handleRefresh,
}: AddAdvanceSalaryProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;
  const isAdmin = currentUser?.role === "admin";

  const [formData, setFormData] = useState<AdvanceSalaryFormType>(initialState);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const getAllUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get<{ users: User[] }>(
        `${BASE_URL}/api/admin/getUsers`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAllUsers(res.data.users ?? []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users", { toastId: "failed" });
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    } else if (currentUser?.role === "user") {
      setFormData((prev) => ({
        ...prev,
        employee_id: String(currentUser.id),
      }));
    }
  }, [isAdmin, currentUser, getAllUsers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "description") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    if (name === "amount") {
      updatedValue = value.replace(/\D/g, "").slice(0, 12);
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.employee_id ||
      !formData.date ||
      !formData.description ||
      !formData.amount
    ) {
      toast.error("Please fill all required fields", {
        toastId: "required-fields",
      });
      return;
    }
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount", { toastId: "enter amount" });
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/createAdvanceSalary`,
        {
          ...formData,
          employee_id: Number(formData.employee_id),
          amount: Number(formData.amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Advance Salary added successfully", {
        toastId: "success",
      });
      setModal();
      handleRefresh?.();
      setFormData(initialState);
    } catch (error: unknown) {
      console.error("Error adding advance salary:", error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to add advance salary";

        toast.error(message, { toastId: "error" });
      } else {
        toast.error("Something went wrong", { toastId: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const userOptions = allUsers
    .filter((u) => u.role === "user" && u.loginStatus === "Y")
    .map((u) => ({
      value: String(u.id),
      label: u.employee_name || u.name || "User",
    }));

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur px-4 flex items-center justify-center z-50"
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          (e.target as HTMLElement).tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
        }
      }}
    >
      <div className="w-[42rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-lg font-semibold"
            >
              Add Advance Salary
            </Title>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 mx-2 gap-2 py-2 space-y-2">
            {isAdmin && (
              <UserSelect
                labelName="Employees *"
                name="employee_id"
                value={formData.employee_id}
                handlerChange={handleChange}
                optionData={userOptions}
              />
            )}

            {!isAdmin && (
              <InputField
                labelName="Employee *"
                name="employee_id"
                value={currentUser?.name || ""}
                handlerChange={handleChange}
                disabled
              />
            )}

            <InputField
              labelName="Date *"
              type="date"
              name="date"
              value={formData.date}
              handlerChange={handleChange}
            />

            <div className="md:col-span-2">
              <InputField
                labelName="Amount *"
                type="number"
                name="amount"
                value={formData.amount}
                handlerChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                labelName="Description *"
                name="description"
                inputVal={formData.description}
                handlerChange={handleChange}
                minLength={3} // Add this
                maxLength={250}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 rounded py-3 bg-white">
            <CancelBtn setModal={setModal} />
            <AddButton loading={loading} label={loading ? "Saving" : "Save"} />
          </div>
        </form>
      </div>
    </div>
  );
};
