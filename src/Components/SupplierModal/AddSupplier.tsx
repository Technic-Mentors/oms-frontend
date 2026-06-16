import { useState } from "react";
import { InputField } from "../InputFields/InputField";
import { Title } from "../Title";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";
import { TextareaField } from "../InputFields/TextareaField";
const isValidEmail = (email: string): boolean => {
  if (email.length > 45) return false;
  if (email.length < 5) return false;
  
  const emailRegex =
    /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._+-]+(?<!\.)@(?!(?:-|\.)).*?(?<!-)\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
type AddCustomerProps = {
  setModal: () => void;
  handleGetAllSupplier: () => void;
};
const initialState = {
  supplierName: "",
  supplierAddress: "",
  supplierContact: "",
  supplierEmail: "",
};

export const AddSupplier = ({
  setModal,
  handleGetAllSupplier,
}: AddCustomerProps) => {
  const [supplierData, setSupplierData] = useState(initialState);

  console.log(supplierData);

  const { currentUser } = useAppSelector((state) => state?.officeState);

  const [loading, setLoading] = useState(false);

  const token = currentUser?.token;

  const handlerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    let value = e.target.value;

    value = value.replace(/^\s+/, "");

    if (name === "supplierName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
      value = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      value = value.slice(0, 50);
    }

    if (name === "supplierAddress") {
      value = value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
      value = value.slice(0, 250);
    }

    if (name === "supplierEmail") {
      value = value.toLowerCase();
      value = value.replace(/[^a-z0-9@._%+-]/g, "");
        value = value.slice(0, 45);
    }

    if (name === "supplierContact") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }

    setSupplierData((prev) => ({
      ...prev,
      [name]: value,
    }));
    const [local, domain] = value.split("@");
  if (local?.includes("..")) return;
  if (local?.startsWith(".")) return;
  if (local?.endsWith(".") && !domain) return;
  if (domain?.startsWith(".")) return;
  if (local?.startsWith("-") || local?.endsWith("-")) return;
  if (domain?.startsWith("-") || domain?.endsWith("-")) return;
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { supplierName, supplierEmail, supplierContact, supplierAddress } =
      supplierData;

    if (
      !supplierName ||
      !supplierEmail ||
      !supplierContact ||
      !supplierAddress
    ) {
      toast.error("All fields are required", { toastId: "required-fields" });
      return;
    }

    if (!/^\d{11}$/.test(supplierContact)) {
      toast.error("Contact must be 11 digits", { toastId: "contact-length" });
      return;
    }

  if (supplierEmail.length > 45) {
    toast.error("Email must not exceed 45 characters", {
      toastId: "email-max-length",
    });
    return;
  }

  // REPLACE the existing email validation with this:
  if (!isValidEmail(supplierEmail)) {
    toast.error("Please enter a valid email address", {
      toastId: "valid-email",
    });
    return;
  }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/addSupplier`,
        supplierData,
        { headers: { Authorization: token } },
      );

      toast.success(res.data.message, { toastId: "add-success" });
      handleGetAllSupplier();
      setModal();
      setSupplierData(initialState);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data.message || "Something went wrong", {
        toastId: "wrong",
      });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-xs px-4  flex items-center justify-center z-50">
      <div className="w-[42rem] max-h-[29rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl ">
        <form
          onSubmit={handlerSubmitted}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="bg-white rounded-xl  border-t-5 border-blue-400 ">
            <Title
              setModal={setModal}
              className="text-white text-lg font-semibold"
            >
              ADD SUPPLIER
            </Title>
          </div>
          <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 py-2 ">
            <InputField
              labelName="Supplier Name *"
              type="text"
              name="supplierName"
              handlerChange={handlerChange}
              value={supplierData.supplierName}
              minLength={3} 
              maxLength={50}
            />
            <InputField
              labelName="Supplier Email *"
              type="email"
              name="supplierEmail"
              handlerChange={handlerChange}
              value={supplierData.supplierEmail}
               maxLength={45}  // ADD THIS LINE
            />

            <div className="md:col-span-2">
              <InputField
                labelName="Supplier Contact *"
                type="text"
                name="supplierContact"
                handlerChange={handlerChange}
                value={supplierData.supplierContact}
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                labelName="Supplier Address *"
                name="supplierAddress"
                handlerChange={handlerChange}
                inputVal={supplierData.supplierAddress}
                 minLength={3} // Add this
                maxLength={250}
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 px-4 py-6 bg-white rounded">
            <CancelBtn setModal={setModal} />
            <AddButton loading={loading} label={loading ? "Saving" : "Save"} />
          </div>
        </form>
      </div>
    </div>
  );
};
