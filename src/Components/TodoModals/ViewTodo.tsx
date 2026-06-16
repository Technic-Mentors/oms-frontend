import { Title } from "../Title";
import { TodoType } from "./UpdateTodo";
import {
  FaUser,
  FaTasks,
  FaStickyNote,
  FaCalendarAlt,
  FaHourglassEnd,
  FaClock,
  FaClipboardList,
} from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";

type ViewTodoProps = {
  setIsOpenModal: () => void;
  viewTodo: TodoType | null;
};

export const ViewTodo = ({ setIsOpenModal, viewTodo }: ViewTodoProps) => {
  if (!viewTodo) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header Section */}
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <div className="text-white">
            <Title setModal={setIsOpenModal}>VIEW TODO DETAILS</Title>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Section 1: Assignment Details */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Assignment Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
           

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaEnvelope className="text-gray-400" /> Email
                </label>
                <p className="text-gray-800 font-medium">
                  {viewTodo.email || "-"}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaTasks className="text-gray-400" /> Task Title
                </label>
                <p className="text-gray-800 font-medium">{viewTodo.task}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Task Description/Note */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Additional Notes
            </h3>
            <div className="pt-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                <FaStickyNote className="text-gray-400" /> Note Content
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {viewTodo.note || "No additional notes provided."}
              </p>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Timeline & Deadlines
            </h3>
            <div className="grid grid-cols-3 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaCalendarAlt className="text-gray-400" /> Start Date
                </label>
                <p className="text-gray-800 font-medium">
                  {formatDate(viewTodo.startDate)}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaHourglassEnd className="text-gray-400" /> End Date
                </label>
                <p className="text-gray-800 font-medium">
                  {formatDate(viewTodo.endDate)}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaClock className="text-gray-400" /> Deadline
                </label>
                <p className="text-red-600 font-bold">
                  {formatDate(viewTodo.deadline)}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaClipboardList className="text-gray-400" /> Completion
                  Status
                </label>
                <p className="text-gray-600 font-bold">
                  {viewTodo.completionStatus}
                </p>
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
