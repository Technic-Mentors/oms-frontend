import React, { useState } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { InputField } from "../InputFields/InputField";
import { Title } from "../Title";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { FiEye, FiEyeOff } from "react-icons/fi"; // ADD THIS

type ProfileChangePasswordProps = {
  setModal: () => void;
};

const initialState = {
  oldPassword: "",
  newPassword: "",
};

export const ProfileChangePassword = ({
  setModal,
}: ProfileChangePasswordProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const id = currentUser?.userId;
  const token = currentUser?.token;

  const [changePassword, setChangePassword] = useState(initialState);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ADD THESE STATES
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === "oldPassword" || name === "newPassword") {
      processedValue = value.slice(0, 20);
    }
    
    setChangePassword({ ...changePassword, [name]: processedValue });
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { oldPassword, newPassword } = changePassword;

    if (!oldPassword || !newPassword) {
      setMessage("Please fill both old and new passwords.");
      return;
    }

    if (oldPassword.length < 8) {
      setMessage("Old password must be at least 8 characters long");
      return;
    }

    if (oldPassword.length > 20) {
      setMessage("Old password must not exceed 20 characters");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters long");
      return;
    }

    if (newPassword.length > 20) {
      setMessage("New password must not exceed 20 characters");
      return;
    }

    if (oldPassword === newPassword) {
      setMessage("New password cannot be the same as old password");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage("Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `${BASE_URL}/api/changePassword/${id}`,
        {
          oldPassword: changePassword.oldPassword,
          newPassword: changePassword.newPassword,
        },
        {
          headers: { Authorization: token || "" },
        },
      );

      setMessage(res.data.message);
      setChangePassword(initialState);

      setTimeout(() => {
        setModal();
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || "Error updating password");
      } else {
        setMessage("Network error or server is down");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-lg overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handlerSubmitted}>
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-xl font-semibold"
            >
              Change Password
            </Title>
          </div>

          <div className="px-6 py-6 flex flex-col gap-5">
            {/* Old Password Field with Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 text-xs font-semibold">
                Old Password *
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={changePassword.oldPassword}
                  onChange={handlerChange}
                  maxLength={20}
                  minLength={8}
                  className="w-full p-2.5 pr-10 border border-gray-200 rounded-lg shadow text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter old password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password Field with Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-600 text-xs font-semibold">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={changePassword.newPassword}
                  onChange={handlerChange}
                  maxLength={20}
                  minLength={8}
                  className="w-full p-2.5 pr-10 border border-gray-200 rounded-lg shadow text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Password must be 8-20 characters and include at least one uppercase letter, 
                one lowercase letter, one number, and one special character (@$!%*?&)
              </p>
            </div>

            {message && (
              <p
                className={`text-center text-sm font-medium ${
                  message.includes("success")
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                } py-2 rounded-md`}
              >
                {message}
              </p>
            )}
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