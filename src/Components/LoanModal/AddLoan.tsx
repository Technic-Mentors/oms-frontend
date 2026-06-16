import React, { useCallback, useEffect, useState } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import { UserSelect } from "../InputFields/UserSelect";
import { InputField } from "../InputFields/InputField";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";

type AddAttendanceProps = {
  setModal: () => void;
  handleRefresh: () => void;
};

type AddLoanType = {
  employee_id: string;
  contact: string;
  loanAmount: number;
  deduction: number;
  remainingAmount: number;
  applyDate: string;
};

type User = {
  id: string | number;
  name: string;
  contact: string;
  loginStatus: "Y" | "N";
  role: string;
};

const currentDate = new Date().toLocaleDateString("sv-SE");

const initialState = {
  employee_id: "",
  contact: "",
  loanAmount: "",
  deduction: "",
  remainingAmount: "",
  applyDate: currentDate,
};

export const AddLoan = ({ setModal, handleRefresh }: AddAttendanceProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const [addLoan, setAddLoan] = useState(initialState);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token = currentUser?.token;

  /* ================= USER ROLE PREFILL ================= */
  useEffect(() => {
    if (currentUser?.role === "user") {
      setAddLoan((prev) => ({
        ...prev,
        employee_id: String(currentUser.id),
        contact: currentUser.contact || "",
      }));
    }
  }, [currentUser]);

  /* ================= INPUT HANDLER ================= */
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  let updatedValue = value;

  if (name === "contact") {
    // Only numbers, max 11 digits (mobile number)
    updatedValue = value.replace(/\D/g, "").slice(0, 11);
  }

  if (name === "loanAmount") {
    // Remove non-digits and leading zeros, max 10 digits (up to 9,999,999,999)
    let numbers = value.replace(/\D/g, "");
    // Remove leading zeros
    if (numbers.length > 1 && numbers.startsWith('0')) {
      numbers = numbers.replace(/^0+/, '');
      if (numbers === '') numbers = '0';
    }
    // Limit to 10 digits
    updatedValue = numbers.slice(0, 10);
  }

  if (name === "deduction") {
    // Remove non-digits and leading zeros, max 10 digits
    let numbers = value.replace(/\D/g, "");
    // Remove leading zeros
    if (numbers.length > 1 && numbers.startsWith('0')) {
      numbers = numbers.replace(/^0+/, '');
      if (numbers === '') numbers = '0';
    }
    // Limit to 10 digits
    updatedValue = numbers.slice(0, 10);
  }

  if (name === "remainingAmount") {
    updatedValue = value.replace(/\D/g, "").slice(0, 10);
  }

  setAddLoan((prev) => ({ ...prev, [name]: updatedValue }));
};
// Validate loan amount
const validateLoanAmount = (amount: string): { isValid: boolean; error?: string } => {
  if (!amount) {
    return { isValid: false, error: "Loan amount is required" };
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: "Loan amount must be greater than 0" };
  }
  
  if (amount.length < 3) {
    return { isValid: false, error: "Loan amount must be at least 3 digits (minimum 100)" };
  }
  
  if (numAmount > 9999999999) {
    return { isValid: false, error: "Loan amount cannot exceed 9,999,999,999" };
  }
  
  return { isValid: true };
};

// Validate deduction amount
const validateDeduction = (deduction: string, loanAmount: string): { isValid: boolean; error?: string } => {
  if (!deduction) {
    return { isValid: false, error: "Deduction amount is required" };
  }
  
  const numDeduction = Number(deduction);
  const numLoan = Number(loanAmount) || 0;
  
  if (isNaN(numDeduction) || numDeduction < 0) {
    return { isValid: false, error: "Deduction must be a valid number" };
  }
  
  if (deduction.length < 3 && numDeduction > 0) {
    return { isValid: false, error: "Deduction must be at least 3 digits (minimum 100)" };
  }
  
  if (numDeduction > 9999999999) {
    return { isValid: false, error: "Deduction cannot exceed 9,999,999,999" };
  }
  
  if (numDeduction > numLoan) {
    return { isValid: false, error: "Deduction cannot be greater than Loan Amount" };
  }
  
  return { isValid: true };
};
  /* ================= USER SELECT HANDLER (FIXED) ================= */
  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;

    const selectedUser = allUsers.find(
      (user) => String(user.id) === selectedId,
    );

    setAddLoan((prev) => ({
      ...prev,
      employee_id: selectedId,
      contact: selectedUser?.contact || "",
    }));
  };

  /* ================= FETCH USERS ================= */
  const getAllUsers = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get<{ users: User[] }>(
        `${BASE_URL}/api/admin/getUsers`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAllUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setAllUsers([]);
    }
  }, [token]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  /* ================= REMAINING AMOUNT ================= */
  useEffect(() => {
    const loan = Number(addLoan.loanAmount) || 0;
    const deduction = Number(addLoan.deduction) || 0;

    const remaining = loan - deduction;

    setAddLoan((prev) => ({
      ...prev,
      remainingAmount: remaining > 0 ? remaining.toString() : "0",
    }));
  }, [addLoan.loanAmount, addLoan.deduction]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

// Validate token
if (!token) {
  return toast.error("Unauthorized", { toastId: "loan-unauthorized" });
}

// Validate required fields
if (!addLoan.employee_id || !addLoan.loanAmount || !addLoan.applyDate) {
  return toast.error("Please fill all required fields", {
    toastId: "required",
  });
}

// Validate loan amount
const loanValidation = validateLoanAmount(addLoan.loanAmount);
if (!loanValidation.isValid) {
  return toast.error(loanValidation.error);
}

// Validate deduction
const deductionValidation = validateDeduction(addLoan.deduction, addLoan.loanAmount);
if (!deductionValidation.isValid) {
  return toast.error(deductionValidation.error);
}

const loanAmount = Number(addLoan.loanAmount);

    const payload: AddLoanType = {
      employee_id: addLoan.employee_id,
      contact: addLoan.contact,
      loanAmount,
      deduction: Number(addLoan.deduction) || 0,
      remainingAmount: Number(addLoan.remainingAmount) || 0,
      applyDate: addLoan.applyDate,
    };

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/addLoan`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Loan added successfully", { toastId: "success" });
      setModal();
      handleRefresh();
      setAddLoan(initialState);
    } catch (error: unknown) {
      console.error("Add loan error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add loan", {
          toastId: "failed",
        });
      } else {
        toast.error("Something went wrong", { toastId: "wrong" });
      }
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = allUsers.filter(
    (user) => user.loginStatus === "Y" && user.role === "user",
  );

  /* ================= UI ================= */
  return (
    <div
      className="fixed inset-0 bg-opacity-50 px-4  backdrop-blur-xs flex items-center justify-center z-50"
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    >
      <div className="w-[42rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-lg font-semibold"
            >
              ADD LOAN
            </Title>
          </div>

          <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 py-6 gap-3">
            {currentUser?.role === "admin" && (
              <div className="mb-4">
                <UserSelect
                  labelName="Employees *"
                  name="employee_id"
                  value={addLoan.employee_id}
                  handlerChange={handleUserSelect}
                  optionData={activeUsers.map((user) => ({
                    value: String(user.id),
                    label: user.name,
                  }))}
                />
              </div>
            )}

            {currentUser?.role === "user" && (
              <InputField
                labelName="Employee *"
                name="employee_id"
                value={currentUser.name || ""}
                handlerChange={handleInputChange}
                readOnly
              />
            )}

            <InputField
              labelName="Contact *"
              type="number"
              name="contact"
              value={addLoan.contact}
              handlerChange={handleInputChange}
              readOnly
            />

            <InputField
              labelName="Apply Date *"
              type="date"
              name="applyDate"
              value={addLoan.applyDate}
              handlerChange={handleInputChange}
            />

       <div className="flex flex-col">
  <InputField
    labelName="Loan Amount *"
    type="text"
    name="loanAmount"
    value={addLoan.loanAmount}
    handlerChange={handleInputChange}
    maxLength={10}
    placeHolder="Enter loan amount (numbers only)"
  />
  <p className="text-xs text-gray-400 mt-1">
    Min: 100 (3 digits) | Max: 9,999,999,999 (10 digits)
  </p>
</div>
<div className="flex flex-col md:col-span-2">
  <InputField
    labelName="Deduction *"
    type="text"
    name="deduction"
    value={addLoan.deduction}
    handlerChange={handleInputChange}
    maxLength={10}
    placeHolder="Enter deduction amount (numbers only)"
  />
  <p className="text-xs text-gray-400 mt-1">
    Min: 100 (3 digits) | Max: 9,999,999,999 (10 digits) | Cannot exceed Loan Amount
  </p>
</div>
            {/* <InputField
              labelName="Remaining Amount"
              type="number"
              name="remainingAmount"
              value={addLoan.remainingAmount}
              handlerChange={() => {}}
              readOnly
            /> */}
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
