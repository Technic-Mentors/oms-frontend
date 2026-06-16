import { useState } from "react";
import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";

import { Title } from "../Title";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";
const isValidEmail = (email: string): boolean => {
  if (email.length > 45) return false;
  if (email.length < 5) return false;
  
  const emailRegex =
    /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._+-]+(?<!\.)@(?!(?:-|\.)).*?(?<!-)\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
type AddCustomerProps = {
  setIsOpenModal: () => void;
  handleGetAllCustomers: () => void;
};

const initialState = {
  customerName: "",
  customerAddress: "",
  customerContact: "",
  email: "",
  companyName: "",
  companyAddress: "",
};

export const AddCustomer = ({
  setIsOpenModal,
  handleGetAllCustomers,
}: AddCustomerProps) => {
  const [customerData, setCustomerData] = useState(initialState);
  const { currentUser } = useAppSelector((state) => state?.officeState);
  const [loading, setLoading] = useState(false);

  const token = currentUser?.token;

const handlerChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  const { name } = e.target;
  let value = e.target.value;

  // remove leading spaces
  value = value.replace(/^\s+/, "");

  if (name === "customerName") {
    value = value.replace(/[^a-zA-Z\s]/g, "");
    value = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    value = value.slice(0, 50);
  }

  // ADD THIS NEW BLOCK FOR EMAIL:
  if (name === "email") {
    value = value.slice(0, 45);
    value = value.replace(/[^a-zA-Z0-9@._+-]/g, "");
    
    // Basic email format validation while typing
    const [local, domain] = value.split("@");
    if (local?.includes("..")) return;
    if (local?.startsWith(".")) return;
    if (local?.endsWith(".") && !domain) return;
    if (domain?.startsWith(".")) return;
    if (local?.startsWith("-") || local?.endsWith("-")) return;
    if (domain?.startsWith("-") || domain?.endsWith("-")) return;
  }

  if (name === "companyName") {
    value = value.replace(/[^a-zA-Z\s]/g, "");
    value = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    value = value.slice(0, 50);
  }


    if (name === "customerAddress") {
      value = value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
      value = value.slice(0, 250);
    }

    if (name === "companyAddress") {
      value = value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
      value = value.slice(0, 250);
    }

    if (name === "customerContact") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }

    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanedData = {
      customerName: customerData.customerName.trim(),
      customerAddress: customerData.customerAddress.trim(),
      customerContact: customerData.customerContact.trim(),
      email: customerData.email.trim(),
      companyName: customerData.companyName.trim(),
      companyAddress: customerData.companyAddress.trim(),
    };

    if (
      !cleanedData.customerName ||
      !cleanedData.customerAddress ||
      !cleanedData.customerContact ||
      !cleanedData.email
    ) {
      return toast.error(
        "Customer Name, Address , Email and Contact are required",
        {
          toastId: "required-fields",
        },
      );
    }
if (cleanedData.email.length > 45) {
  return toast.error("Email must not exceed 45 characters", {
    toastId: "email-max-length",
  });
}

if (!isValidEmail(cleanedData.email)) {
  return toast.error("Please enter a valid email address", {
    toastId: "invalid-email",
  });
}
    if (!/^\d{11}$/.test(cleanedData.customerContact)) {
      return toast.error("Contact number must be 11 digits", {
        toastId: "contact-length",
      });
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/addCustomer`,
        cleanedData,
        { headers: { Authorization: token } },
      );

      toast.success(res.data.message, { toastId: "customer-success" });
      handleGetAllCustomers();
      setCustomerData(initialState);
      setIsOpenModal();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data.message || "";

      if (axiosError.response?.status === 409) {
        if (message.includes("contact")) {
          toast.error("Customer contact number already exists", {
            toastId: "contact number already exists",
          });
        } else {
          toast.error(message, { toastId: "contact-exist" });
        }
      } else {
        toast.error(message || "Something went wrong", {
          toastId: "something wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm px-4 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handlerSubmitted} className="flex flex-col">
          {/* Header */}
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setIsOpenModal}
              className="text-white text-lg font-semibold"
            >
              ADD CUSTOMER
            </Title>
          </div>

          {/* Form Body */}
          <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 gap-5">
            <InputField
              labelName="Customer Name *"
              type="text"
              name="customerName"
              handlerChange={handlerChange}
              value={customerData.customerName}
              minLength={3}
              maxLength={50}
            />

            <InputField
              labelName="Customer Contact *"
              type="text"
              name="customerContact"
              handlerChange={handlerChange}
              value={customerData.customerContact}
            />

            <InputField
              labelName="Email *"
              type="email"
              name="email"
              handlerChange={handlerChange}
              value={customerData.email}
               maxLength={45} 
            />

            <InputField
              labelName="Company Name *"
              type="text"
              name="companyName"
              handlerChange={handlerChange}
              value={customerData.companyName}
              minLength={3}
              maxLength={50}
            />

            <div className="md:col-span-2">
              <TextareaField
                labelName="Customer Address *"
                name="customerAddress"
                handlerChange={handlerChange}
                inputVal={customerData.customerAddress}
                minLength={3} // Add this
                maxLength={250}
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                labelName="Company Address *"
                name="companyAddress"
                handlerChange={handlerChange}
                inputVal={customerData.companyAddress}
                minLength={3} // Add this
                maxLength={250}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-3 px-4 py-4 bg-white rounded">
            <CancelBtn setModal={setIsOpenModal} />
            <AddButton loading={loading} label={loading ? "Saving" : "Save"} />
          </div>
        </form>
      </div>
    </div>
  );
};
