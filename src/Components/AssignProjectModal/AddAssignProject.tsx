import React, { FormEvent, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import { UserSelect } from "../InputFields/UserSelect";
import { OptionField } from "../InputFields/OptionField";
import { InputField } from "../InputFields/InputField";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

type UserOption = {
  id: number;
  name: string;
  loginStatus: string;
  projectName: string;
  role: string;
};

type ProjectT = {
  id: number;
  projectName: string;
  projectCategory: string;
  description: string;
  startDate: string;
  endDate: string | null;
};

const currentDate = new Date().toLocaleDateString("en-CA");

type AddAttendanceProps = {
  setModal: () => void;
  handleGetAllAssignProjects: () => void;
};

const initialState = {
  userId: "",
  projectId: "",
  date: currentDate,
};

export const AddAssignProject = ({
  setModal,
  handleGetAllAssignProjects,
}: AddAttendanceProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;
  const [addProject, setAddProject] = useState(initialState);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allProjects, setAllProjects] = useState<ProjectT[] | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectT | null>(null);

  const handlerChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    
    // When project is selected, find the project details
    if (name === "projectId") {
      const project = allProjects?.find(p => p.id === parseInt(value));
      setSelectedProject(project || null);
      
      // Validate current date against project date range
      if (project) {
        const minDate = project.startDate;
        const maxDate = project.endDate || project.startDate;
        const currentDateValue = addProject.date;
        
        if (currentDateValue < minDate || currentDateValue > maxDate) {
          setAddProject({ 
            ...addProject, 
            [name]: value,
            date: minDate // Reset to min valid date
          });
        } else {
          setAddProject({ ...addProject, [name]: value });
        }
      } else {
        setAddProject({ ...addProject, [name]: value });
      }
    } else {
      setAddProject({ ...addProject, [name]: value });
    }
  };

  const getAllUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredUsers = res?.data?.users
        .filter(
          (user: UserOption) =>
            user.role === "user" && user.loginStatus === "Y",
        )
        .map((user: UserOption) => ({
          value: user.id,
          label: user.name,
        }));

      setAllUsers(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const getAllProjects = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getProjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllProjects(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handlerSubmitted = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!addProject.userId || !addProject.projectId || !addProject.date) {
      return toast.error("Employee, Project, and Date are required", {
        toastId: "required-fields",
      });
    }

    // Validate date against project's date range
    if (selectedProject) {
      const startDate = selectedProject.startDate;
      const endDate = selectedProject.endDate || selectedProject.startDate;
      
      if (addProject.date < startDate || addProject.date > endDate) {
        return toast.error(`Date must be between ${startDate} and ${endDate}`, {
          toastId: "date-range-error",
        });
      }
    }

    setLoading(true);

    try {
      const payload = {
        employee_id: addProject.userId,
        projectId: addProject.projectId,
        date: addProject.date,
      };

      await axios.post(`${BASE_URL}/api/admin/assignProject`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      handleGetAllAssignProjects();
      toast.success("Project assigned successfully!", {
        toastId: "assign-success",
      });
      setModal();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to assign project!";
        toast.error(message, { toastId: "assign-error" });
      } else {
        toast.error("Something went wrong!", { toastId: "assign-error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
    getAllProjects();
  }, [getAllProjects, getAllUsers]);

  // Get min and max dates based on selected project
  const getMinDate = () => {
    if (selectedProject) {
      return selectedProject.startDate;
    }
    return "1900-01-01";
  };

  const getMaxDate = () => {
    if (selectedProject) {
      return selectedProject.endDate || selectedProject.startDate;
    }
    return "2099-12-31";
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs px-4 flex items-center justify-center z-50">
      <div className="w-[42rem] max-h-[30rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form
          onSubmit={handlerSubmitted}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-lg font-semibold"
            >
              ASSIGN PROJECT
            </Title>
          </div>

          <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 py-6">
            <UserSelect
              labelName="Employees *"
              name="userId"
              value={addProject.userId}
              handlerChange={handlerChange}
              optionData={allUsers}
            />

            <OptionField
              labelName="Project *"
              name="projectId"
              handlerChange={handlerChange}
              value={addProject.projectId}
              optionData={allProjects?.map((project) => ({
                id: project.id,
                label: project.projectName,
                value: project.id,
              }))}
              inital="Please Select Project"
            />

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-black">Date *</label>
              {selectedProject && (
                <p className="text-xs text-gray-500 mb-1">
                  Project date range: {selectedProject.startDate} - {selectedProject.endDate || selectedProject.startDate}
                </p>
              )}
              <InputField
                type="date"
                name="date"
                value={addProject.date}
                handlerChange={handlerChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="border border-indigo-900 rounded p-2"
                disabled={!selectedProject}
              />
              {!selectedProject && (
                <p className="text-xs text-amber-600 mt-1">
                  Please select a project first
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-4 rounded py-6 bg-white">
            <CancelBtn setModal={setModal} />
            <AddButton loading={loading} label={loading ? "Saving" : "Save"} />
          </div>
        </form>
      </div>
    </div>
  );
};