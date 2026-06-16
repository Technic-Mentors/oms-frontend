import { Title } from "../Title";
import {
  FaProjectDiagram,
  FaTag,
  FaCalendarAlt,
  FaCalendarCheck,
  FaAlignLeft,
} from "react-icons/fa";

type AllProjectT = {
  id: number;
  projectName: string;
  projectCategory: string;
  description: string;
  startDate: string;
  endDate: string;
  completionStatus: string;
};

type CustomerDetailProps = {
  setIsOpenModal: () => void;
  viewProject: AllProjectT | null;
};

export const ViewProject = ({
  setIsOpenModal,
  viewProject,
}: CustomerDetailProps) => {
  if (!viewProject) return null;

  const getStatusBadge = (status: string) => {
    const base =
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";

    if (!status) return `${base} bg-gray-200 text-gray-600`;

    switch (status.trim()) {
      case "Completed":
        return `${base} bg-green-100 text-green-700 border border-green-400`;

      case "Working":
        return `${base} bg-yellow-100 text-yellow-700 border border-yellow-400`;

      case "New":
        return `${base} bg-blue-100 text-blue-700 border border-blue-400`;

      default:
        return `${base} bg-gray-200 text-gray-600`;
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header Section */}
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <div className="text-white">
            <Title setModal={setIsOpenModal}>VIEW PROJECT DETAILS</Title>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Section 1: Basic Information */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaProjectDiagram className="text-gray-400" /> Project Name
                </label>
                <p className="text-gray-800 font-medium">
                  {viewProject.projectName}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaTag className="text-gray-400" /> Category
                </label>
                <p className="text-gray-800 font-medium">
                  {viewProject.projectCategory}
                </p>
              </div>
            </div>
          </div>
{/* Section 2: Timeline */}
<div className="border border-gray-200 rounded-md p-4 relative">
  <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
    Project Timeline
  </h3>
  <div className="grid grid-cols-2 gap-y-4 pt-2">
    <div>
      <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
        <FaCalendarAlt className="text-gray-400" /> Start Date
      </label>
      <p className="text-gray-800 font-medium">
        {new Date(viewProject.startDate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-")}
      </p>
    </div>
    
    {/* Only show End Date if it exists */}
    {viewProject.endDate && (
      <div>
        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
          <FaCalendarCheck className="text-gray-400" /> End Date
        </label>
        <p className="text-gray-800 font-medium">
          {new Date(viewProject.endDate)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .replace(/ /g, "-")}
        </p>
      </div>
    )}
  </div>
</div>

          {/* Section 3: Description */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
              <div className="pt-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaAlignLeft className="text-gray-400" /> Description
                </label>
                <p className="text-gray-800 font-medium mt-1 leading-relaxed">
                  {viewProject.description || "No description provided."}
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaAlignLeft className="text-gray-400" /> Status
                </label>
                <div className="mt-2">
                  <span
                    className={getStatusBadge(viewProject.completionStatus)}
                  >
                    {viewProject.completionStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white p-3 flex justify-end">
          <button
            onClick={setIsOpenModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-1 px-8 rounded shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
