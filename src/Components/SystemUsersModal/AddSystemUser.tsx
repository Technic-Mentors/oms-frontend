import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { FiUpload, FiX } from "react-icons/fi";

import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { InputField } from "../InputFields/InputField";
import { Title } from "../Title";

import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

type RoleOption = {
  id: number;
  roleName: string;
};

type AddSystemUserProps = {
  setModal: () => void;
  handlerGetUsers: () => void;
};

const initialState = {
  name: "",
  cnic: "",
  contact: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  roleId: "" as string | number,
};

const isValidEmail = (email: string): boolean => {
  if (email.length > 45) return false;
  if (email.length < 5) return false;
  
  const emailRegex =
    /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._+-]+(?<!\.)@(?!(?:-|\.)).*?(?<!-)\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const AddSystemUser = ({
  setModal,
  handlerGetUsers,
}: AddSystemUserProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;

  const [formData, setFormData] = useState(initialState);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Image states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/getRoles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res?.data?.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, [token]);

  const handlerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    let processedValue = value.replace(/^\s+/, "");

    if (name === "role") {
      const selectedRole = roles.find((r) => r.roleName === value);
      setFormData((prev) => ({
        ...prev,
        role: value,
        roleId: selectedRole ? selectedRole.id : "",
      }));
      return;
    }

    if (name === "name") {
      processedValue = processedValue.replace(/[^a-zA-Z0-9 _-]/g, "");
      processedValue = processedValue
        .split(" ")
        .map((word) =>
          word ? word.charAt(0).toUpperCase() + word.slice(1) : "",
        )
        .join(" ");
      processedValue = processedValue.slice(0, 50);
    }

  if (name === "email") {
  // Add 45 character limit
  processedValue = processedValue.slice(0, 45);
  processedValue = processedValue.replace(/[^a-zA-Z0-9@._+-]/g, "");
  
  // Add validation while typing
  const [local, domain] = processedValue.split("@");
  if (local?.includes("..")) return;
  if (local?.startsWith(".")) return;
  if (local?.endsWith(".") && !domain) return;
  if (domain?.startsWith(".")) return;
  if (local?.startsWith("-") || local?.endsWith("-")) return;
  if (domain?.startsWith("-") || domain?.endsWith("-")) return;
}

    if (name === "contact") {
      processedValue = processedValue.replace(/\D/g, "").slice(0, 11);
    }

    if (name === "cnic") {
      const digits = processedValue.replace(/\D/g, "");
      if (digits.length <= 5) processedValue = digits;
      else if (digits.length <= 12)
        processedValue = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      else
        processedValue = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12,
        )}-${digits.slice(12, 13)}`;
    }

    if (name === "password" || name === "confirmPassword") {
      processedValue = processedValue.slice(0, 20);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  // ✅ Image Change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");

    const fileInput = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;

    if (fileInput) fileInput.value = "";
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
      contact,
      cnic,
      role,
      roleId,
    } = formData;

    if (
      !name ||
      !contact ||
      !cnic ||
      !email ||
      !password ||
      !confirmPassword ||
      !role ||
      !roleId
    ) {
      toast.error("Please fill all required fields");
      return;
    }

// Add email length validation
if (email.length > 45) {
  toast.error("Email must not exceed 45 characters");
  return;
}

// Add email format validation
if (!isValidEmail(email)) {
  toast.error("Please enter a valid email address (e.g., name@domain.com)");
  return;
}

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // ✅ FormData instead of JSON
      const data = new FormData();
      data.append("name", name);
      data.append("email", email.toLowerCase().trim());
      data.append("password", password);
      data.append("contact", contact);
      data.append("cnic", cnic.replace(/\D/g, ""));
      data.append("role", role);
      data.append("roleId", String(roleId));

      if (selectedFile) {
        data.append("image", selectedFile);
      }

      const res = await axios.post(
        `${BASE_URL}/api/admin/addSystemUser`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message || "User added successfully");

      setFormData(initialState);
      setSelectedFile(null);
      setImagePreview("");

      handlerGetUsers();
      setModal();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError?.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs px-4 flex items-center justify-center z-50">
      <div className="w-[45rem] max-h-[90vh] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handlerSubmitted}>
          <div className="bg-white rounded-xl border-t-5 border-blue-400 sticky top-0 z-10">
            <Title setModal={setModal}>ADD SYSTEM USER</Title>
          </div>

          <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 py-4 gap-4">
            <div className="sm:col-span-2">
              <InputField
                labelName="Full Name *"
                name="name"
                value={formData.name}
                handlerChange={handlerChange}
              />
            </div>

            <InputField
              labelName="CNIC *"
              name="cnic"
              value={formData.cnic}
              handlerChange={handlerChange}
            />

            <InputField
              labelName="Phone Number *"
              name="contact"
              value={formData.contact}
              handlerChange={handlerChange}
            />

        <InputField
  labelName="Email Address *"
  type="email"
  name="email"
  value={formData.email}
  handlerChange={handlerChange}
  maxLength={45}  // ADD THIS LINE
/>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handlerChange}
                className="border border-gray-300 rounded-md p-2 h-[40px] text-black"
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.roleName}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              labelName="Password *"
              type="password"
              name="password"
              value={formData.password}
              handlerChange={handlerChange}
            />

            <InputField
              labelName="Confirm Password *"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              handlerChange={handlerChange}
            />

            {/* ✅ Image Upload UI */}
            <div className="sm:col-span-2">
              <label className="block text-gray-600 text-xs font-semibold mb-2">
                Profile Image
              </label>

              <div className="flex items-start gap-4">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}

                {!imagePreview && (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer"
                  >
                    <FiUpload className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload image
                    </span>

                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50">
            <CancelBtn setModal={setModal} />
            <AddButton
              loading={loading}
              label={loading ? "Saving..." : "Save"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
