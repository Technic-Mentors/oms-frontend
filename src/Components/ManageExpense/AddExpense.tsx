import React, { useEffect, useState, useCallback } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import { toast } from "react-toastify";

type AddAttendanceProps = {
  setModal: () => void;
};

const currentDate = new Date().toLocaleDateString("sv-SE");

type CategoryT = { id: number; categoryName: string };

const initialState = {
  expenseName: "",
  expenseCategoryId: "",
  amount: "",
  addedBy: "",
  date: currentDate,
};

export const AddExpense = ({ setModal }: AddAttendanceProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const [loading, setLoading] = useState(false);
  const [addExpense, setAddExpense] = useState(initialState);
  const [allExpenseCategory, setAllExpenseCategory] = useState<CategoryT[] | null>(null);
  const token = currentUser?.token;

  const handlerChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "expenseName") {
      // Allow letters, numbers, spaces, and common punctuation
      updatedValue = value.replace(/[^a-zA-Z0-9\s\-_.,]/g, "");
      // Limit to 100 characters
      if (updatedValue.length > 100) {
        updatedValue = updatedValue.slice(0, 100);
      }
    }

    if (name === "amount") {
      // Remove any non-digit characters
      updatedValue = value.replace(/\D/g, "");
      
      // Limit amount to 10 digits (max 9,999,999,999)
      if (updatedValue.length > 10) {
        updatedValue = updatedValue.slice(0, 10);
      }
      
      // Optional: Remove leading zeros
      if (updatedValue.length > 1 && updatedValue.startsWith('0')) {
        updatedValue = updatedValue.replace(/^0+/, '');
        if (updatedValue === '') updatedValue = '0';
      }
    }

    if (name === "addedBy") {
      // Allow letters, numbers, spaces, and common punctuation
      updatedValue = value.replace(/[^a-zA-Z0-9\s\-_.,]/g, "");
      // Limit to 100 characters
      if (updatedValue.length > 100) {
        updatedValue = updatedValue.slice(0, 100);
      }
    }

    setAddExpense({ ...addExpense, [name]: updatedValue });
  };

  const getAllUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getExpenseCategory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllExpenseCategory(res?.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
    if (!amount) {
      return { isValid: false, error: "Amount is required" };
    }

    const numAmount = parseInt(amount, 10);
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: "Amount must be a valid number" };
    }

    if (numAmount <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    if (amount.length < 3) {
      return { isValid: false, error: "Amount must be at least 3 digits (minimum 100)" };
    }

    if (numAmount > 9999999999) {
      return { isValid: false, error: "Amount cannot exceed 9,999,999,999" };
    }

    return { isValid: true };
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate expense name
    if (!addExpense.expenseName.trim()) {
      return toast.error("Expense name is required");
    }
    
    if (addExpense.expenseName.trim().length < 3) {
      return toast.error("Expense name must be at least 3 characters long");
    }

    if (addExpense.expenseName.trim().length > 100) {
      return toast.error("Expense name must not exceed 100 characters");
    }

    // Validate amount
    const amountValidation = validateAmount(addExpense.amount);
    if (!amountValidation.isValid) {
      return toast.error(amountValidation.error);
    }

    // Validate expense category
    if (!addExpense.expenseCategoryId) {
      return toast.error("Please select an expense category");
    }

    // Validate added by
    if (!addExpense.addedBy.trim()) {
      return toast.error("Added by field is required");
    }
    
    if (addExpense.addedBy.trim().length < 3) {
      return toast.error("Added by must be at least 3 characters long");
    }

    if (addExpense.addedBy.trim().length > 100) {
      return toast.error("Added by must not exceed 100 characters");
    }

    // Validate date
    if (!addExpense.date) {
      return toast.error("Date is required");
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/addExpense`,
        addExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(res.data);
      toast.success("Expense added successfully");
      setModal();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add expense");
      }
      console.error("Failed to add expense:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  // Format amount for display (add commas)
  const formatAmountForDisplay = (amount: string) => {
    if (!amount) return "";
    const num = parseInt(amount, 10);
    if (isNaN(num)) return amount;
    return num.toLocaleString('en-US');
  };

  return (
    <div>
      <div
        className="fixed inset-0 bg-opacity-50 backdrop-blur-xs px-4 flex items-center justify-center z-50"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className="w-[42rem] max-h-[32rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
          <form onSubmit={handlerSubmitted}>
            <div className="bg-white rounded-xl border-t-5 border-blue-400">
              <Title
                setModal={setModal}
                className="text-white text-lg font-semibold"
              >
                Add Expense
              </Title>
            </div>
            <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 py-6 gap-3">
              <OptionField
                labelName="Expense Category *"
                name="expenseCategoryId"
                value={addExpense.expenseCategoryId}
                handlerChange={handlerChange}
                optionData={allExpenseCategory
                  ?.slice()
                  .sort((a, b) => a.id - b.id)
                  .map((category) => ({
                    id: category.id,
                    label: category.categoryName,
                    value: category.id,
                  }))}
                inital="Please Select Category"
              />

              <InputField
                labelName="Expense Name *"
                name="expenseName"
                handlerChange={handlerChange}
                value={addExpense.expenseName}
                minLength={3}
                maxLength={100}
                placeHolder="e.g., Office Supplies, Software License, etc."
              />

              <div className="flex flex-col">
                <InputField
                  labelName="Amount *"
                  name="amount"
                  type="text"
                  handlerChange={handlerChange}
                  value={addExpense.amount}
                  maxLength={10}
                  placeHolder="Enter amount (numbers only)"
                />
         
                <p className="text-xs text-gray-400 mt-1">
                  Min: 100 (3 digits) | Max: 9,999,999,999 (10 digits)
                </p>
              </div>

              <InputField
                labelName="Added By *"
                name="addedBy"
                handlerChange={handlerChange}
                value={addExpense.addedBy}
                minLength={3}
                maxLength={100}
                placeHolder="Name or ID of person adding expense"
              />

              <div className="md:col-span-2">
                <InputField
                  labelName="Date *"
                  name="date"
                  type="date"
                  handlerChange={handlerChange}
                  value={addExpense.date}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-4 rounded py-6 bg-white">
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