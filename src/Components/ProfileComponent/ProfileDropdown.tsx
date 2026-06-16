import { useEffect, useRef, useState } from "react";
import { FiUser, FiLock, FiLogOut, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/Hooks";
import { logOut, resetStore } from "../../redux/UserSlice";
import { ProfileChangePassword } from "./ProfileChangePassword";

type PASSWORDT = "VIEW" | "";

const ProfileDropdown = ({
  isOpenModal,
  setIsOpenModal,
}: {
  isOpenModal: boolean;
  setIsOpenModal: (value: string) => void;
}) => {
  const { currentUser } = useAppSelector((state) => state.officeState);

  // Logic to determine the correct profile path - FIXED for employee role
  const getProfilePath = () => {
    const role = currentUser?.role?.toLowerCase();
    
    if (role === "admin") return "/profile";
    if (role === "user" || role === "employee") return "/user/profile"; // Added employee check
    // For any other end-user (System User)
    return "/system-user/profile";
  };

  const getDisplayRole = (role?: string) => {
    if (!role) return "System User";

    const normalized = role.toLowerCase();

    if (normalized === "admin") return "Admin";
    if (normalized === "user" || normalized === "employee") return "Employee"; // Changed from "User" to "Employee"
    
    return "System User";
  };

  const [viewPasswordModal, setViewPasswordModal] = useState<PASSWORDT | null>(
    null,
  );
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenModal("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpenModal]);

  const handleLogoutUser = () => {
    setIsOpenModal("");
    dispatch(logOut());
    dispatch(resetStore());
  };

  if (!isOpenModal) return null;

  return (
    <div className="relative z-50">
      <div
        ref={dropdownRef}
        className="absolute right-0 mt-5 w-64 origin-top-right overflow-hidden rounded-xl border-1 
        border-blue-400 hover:border-white bg-white shadow-2xl focus:outline-none"
      >
        {/* User Header Section */}
        <div className="bg-gray-50/50 px-4 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentUser?.name || "User Name"}
            <span
              className="inline-flex mt-2 ml-1 items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs
  font-medium text-indigo-700 capitalize"
            >
              {getDisplayRole(currentUser?.role)}
            </span>
          </p>

          <p className="text-xs text-gray-500 truncate mt-0.5">
            {currentUser?.email || "user@example.com"}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="py-1">
          <Link
            to={getProfilePath()}
            onClick={() => setIsOpenModal("")}
            className="group flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 
            hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiUser className="text-gray-400 group-hover:text-indigo-600" />
              <span>Your Profile</span>
            </div>
            <FiChevronRight className="text-gray-300 group-hover:text-indigo-400" />
          </Link>

          <button
            onClick={() => setViewPasswordModal("VIEW")}
            className="group flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-700
             hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiLock className="text-gray-400 group-hover:text-indigo-600" />
              <span>Change Password</span>
            </div>
            <FiChevronRight className="text-gray-300 group-hover:text-indigo-400" />
          </button>
        </div>

        {/* Footer / Logout Section */}
        <div className="border-t border-gray-100 bg-gray-50/30 py-1">
          <button
            onClick={handleLogoutUser}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600
             hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="text-red-500" />
            Sign out
          </button>
        </div>
      </div>

      {viewPasswordModal && (
        <ProfileChangePassword setModal={() => setViewPasswordModal(null)} />
      )}
    </div>
  );
};

export default ProfileDropdown;