import { Title } from "../Title";
import { GROUPED_PROJECT } from "../../Pages/AdminPage/AssignProjects";
import { FaUser, FaIdBadge, FaFolder } from "react-icons/fa";

type ViewAssignProjectProps = {
  setIsOpenModal: () => void;
  viewProject: GROUPED_PROJECT | null;
};

export const ViewAssignProject = ({
  setIsOpenModal,
  viewProject,
}: ViewAssignProjectProps) => {
  if (!viewProject) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <Title setModal={setIsOpenModal}>VIEW PROJECTS</Title>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar">
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 flex justify-between items-center">
            <div>
              <p className="flex items-center gap-2 font-semibold text-gray-800">
                <FaUser className="text-blue-500 text-xs" /> {viewProject.name}
              </p>
              {/* <p className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <FaIdBadge /> ID: {viewProject.employee_id}
              </p> */}
            </div>
            <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">
              {viewProject.projects.length} Projects
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Assigned List
            </h4>
            {viewProject.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-3 border-l-4 border-blue-400 bg-white border border-gray-100 rounded-r-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <FaFolder className="mt-1 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700 leading-tight">
                      {proj.projectName}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {proj.description}
                    </p>

                    <p className="text-[11px] text-gray-400 mt-1">
                      Status:{" "}
                      <span className="font-semibold text-gray-600">
                        {proj.completionStatus}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(proj.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-3  bg-gray-50 flex justify-end rounded-b-xl">
          <button
            onClick={setIsOpenModal}
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-5 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
