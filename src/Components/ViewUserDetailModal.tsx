import { Title } from "./Title";
import {
  FaUser,
  FaIdCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaTag,
} from "react-icons/fa";
import { RiUserFill } from "react-icons/ri";
import { BASE_URL } from "../Content/URL"; // Ensure this path is correct for your project

export type ViewUserT = {
  id: number;
  name: string;
  email: string;
  contact: string;
  cnic: string;
  address: string;
  date: string;
  password: string;
  confirmPassword: string;
  role: string;
  image?: string; // Added image field
};

type ModalTProps = {
  setModal: () => void;
  viewUserDetail: ViewUserT;
};

export const ViewUserDetailModal = ({
  setModal,
  viewUserDetail,
}: ModalTProps) => {
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}/${imagePath}`;
  };

  const userImageUrl = getImageUrl(viewUserDetail.image);

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-300">
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <div className="text-white">
            <Title setModal={setModal}>VIEW EMPLOYEE DETAILS</Title>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Header Section with Image and Name */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 border-4 border-white shadow-md overflow-hidden">
              {userImageUrl ? (
                <img
                  src={userImageUrl}
                  alt={viewUserDetail.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <RiUserFill size={40} />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewUserDetail.name}
              </h2>
              {/* <p className="text-blue-500 font-semibold">
                {viewUserDetail.role}
              </p> */}
              {/* <p className="text-gray-500 text-sm">{viewUserDetail.email}</p> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Basic Information */}
            <div className="border border-gray-200 rounded-md p-4 relative">
              <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Basic Information
              </h3>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                    <FaUser className="text-gray-400" /> User Name
                  </label>
                  <p className="text-gray-800 font-medium">
                    {viewUserDetail.name}
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                    <FaTag className="text-gray-400" /> Role
                  </label>
                  <p className="text-gray-800 font-medium">
                    {viewUserDetail.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="border border-gray-200 rounded-md p-4 relative">
              <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Contact Details
              </h3>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                    <FaEnvelope className="text-gray-400" /> Email Address
                  </label>
                  <p className="text-gray-800 font-medium">
                    {viewUserDetail.email}
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                    <FaIdCard className="text-gray-400" /> CNIC / ID
                  </label>
                  <p className="text-gray-800 font-medium">
                    {viewUserDetail.cnic}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Location & Date */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Location & Date
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaMapMarkerAlt className="text-gray-400" /> Address
                </label>
                <p className="text-gray-800 font-medium break-words">
                  {viewUserDetail.address || "N/A"}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaCalendarAlt className="text-gray-400" /> Joined Date
                </label>
                <p className="text-gray-800 font-medium">
                  {new Date(viewUserDetail.date)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(/ /g, "-")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white p-3 flex justify-end">
          <button
            onClick={setModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm border-2 border-gray-300 font-semibold 
            py-1 px-8 rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
