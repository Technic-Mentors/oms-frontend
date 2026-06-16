import React, { useState, useEffect } from "react";

import { AddButton } from "../CustomButtons/AddButton";

import { CancelBtn } from "../CustomButtons/CancelBtn";

import { InputField } from "../InputFields/InputField";

import { Title } from "../Title";

import axios from "axios";

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
type AddApplicantProps = {
  setModal: () => void;
  refreshApplicants: () => void;
};

type Job = {
  id: number;
  job_title: string;
};

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const currentDate = new Date().toLocaleDateString("en-CA");

const initialState = {
  applicant_name: "",
  fatherName: "",
  email: "",
  applicant_contact: "",
  applied_date: currentDate,
  job_id: "",
  interviewPhase: "",
  status: "pending",
};
export const AddApplicant = ({
  setModal,
  refreshApplicants,
}: AddApplicantProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);

  const [loading, setLoading] = useState(false);

  const token = currentUser?.token;

  const [addApplicant, setAddApplicant] = useState(initialState);

  const [jobs, setJobs] = useState<Job[]>([]);

  const handlerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    let updatedValue = value;

    if (name === "applicant_name") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    if (name === "fatherName") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    if (name === "email") {
      updatedValue = value.replace(/\s/g, "").toLowerCase().slice(0, 45);
    }

    if (type === "number") {
      updatedValue = value.replace(/\D/g, "").slice(0, 11);
    }

    if (name === "job_id") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    if (name === "interviewPhase") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    setAddApplicant((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      applicant_name,
      fatherName,
      email,
      applicant_contact,
      applied_date,
      job_id,
      interviewPhase,
    } = addApplicant;

    if (
      !applicant_name?.trim() ||
      !applicant_contact?.trim() ||
      !fatherName?.trim() ||
      !email?.trim() ||
      !applied_date?.trim() ||
      !job_id?.trim() ||
      !interviewPhase?.trim() ||
      !applicant_contact?.trim()
    ) {
      return toast.error("Please fill in all required fields", {
        toastId: "add-applicant-validation",
      });
    }
// Email validation with 45 character limit
if (email.length > 45) {
  return toast.error("Email must not exceed 45 characters", {
    toastId: "email-max-length",
  });
}

if (!isValidEmail(email)) {
  return toast.error("Please enter a valid email address", {
    toastId: "invalid-email",
  });
}

    if (applicant_contact.length !== 11) {
      return toast.error("Contact number must be exactly 11 digits", {
        toastId: "add-applicant-contact",
      });
    }

    if (applicant_name.length < 3) {
      return toast.error("Applicant Name must be minimum 3 characters long");
    }

    if (fatherName.length < 3) {
      return toast.error("Father Name must be at minimum 3 characters long");
    }

    if (interviewPhase.length < 3) {
      return toast.error("Interview Phase must be minimum 3 characters long");
    }

    if (applicant_name.length < 3 || fatherName.length < 3) {
      return toast.error(
        "Name, Father Name  must be at least 3 characters long",
      );
    }

    if (fatherName.length < 3 || interviewPhase.length < 3) {
      return toast.error(
        "Father Name, and Interview Phase must be at least 3 characters long",
      );
    }

    if (
      applicant_name.length < 3 ||
      fatherName.length < 3 ||
      interviewPhase.length < 3
    ) {
      return toast.error(
        "Name, Father Name, and Interview Phase must be at least 3 characters long",
      );
    }
    setLoading(true);

    try {
      const payload = {
        ...addApplicant,
        applicant_status: "pending",
      };

      const res = await axios.post(
        `${BASE_URL}/api/admin/addapplicant`,
        payload,
        { headers: { Authorization: token } },
      );

      toast.success(res.data.message, { toastId: "add-applicant-success" });

      refreshApplicants();
      setModal();
    } catch (error: unknown) {
      console.error(error);

      const err = error as AxiosErrorResponse;
      const errorMessage =
        err.response?.data?.message || "Failed to add applicant";

      toast.error(errorMessage, {
        toastId: "add-applicant-error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/getjob`, {
          headers: { Authorization: token },
        });
        setJobs(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchJobs();
  }, [token]);

  return (
    <div>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm px-4  flex items-center justify-center z-50"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className="w-[42rem]  overflow-y-auto bg-white mx-auto rounded-xl shadow-xl ">
          <form onSubmit={handlerSubmitted}>
            <div className="bg-white rounded-xl border-t-5 border-blue-400">
              <Title
                setModal={setModal}
                className="text-white text-lg font-semibold"
              >
                ADD APPLICANT
              </Title>
            </div>
            <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 py-6 gap-3  ">
              <InputField
                labelName="Applicant Name *"
                type="text"
                name="applicant_name"
                value={addApplicant.applicant_name}
                handlerChange={handlerChange}
                minLength={3}
                maxLength={50}
              />

              <InputField
                labelName="Father Name *"
                type="text"
                name="fatherName"
                value={addApplicant.fatherName}
                handlerChange={handlerChange}
                minLength={3}
                maxLength={50}
              />

              <InputField
                labelName="Email *"
                type="email"
                name="email"
                value={addApplicant.email}
                handlerChange={handlerChange}
                 maxLength={45}  // ADD THIS LINE
              />

              <InputField
                labelName="Contact No *"
                type="number"
                name="applicant_contact"
                value={addApplicant.applicant_contact}
                handlerChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    setAddApplicant((prev) => ({
                      ...prev,
                      applicant_contact: value,
                    }));
                  }
                }}
              />

              <InputField
                labelName="Applied Date *"
                type="date"
                name="applied_date"
                value={addApplicant.applied_date}
                handlerChange={handlerChange}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-700">
                  Job Title *
                </label>

                <select
                  name="job_id"
                  value={addApplicant.job_id}
                  onChange={(e) =>
                    setAddApplicant({ ...addApplicant, job_id: e.target.value })
                  }
                  className="border rounded-md px-2 py-3 shadow-md text-sm 
             bg-white 
             text-gray-800 
             border-gray-300 "
                  required
                >
                  <option value="">Select Job</option>

                  {Array.isArray(jobs) &&
                    jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <InputField
                  labelName="Interview Phase *"
                  type="text"
                  name="interviewPhase"
                  value={addApplicant.interviewPhase}
                  handlerChange={handlerChange}
                  minLength={3}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-4 rounded py-6 bg-white">
              <CancelBtn setModal={setModal} />
              <AddButton
                loading={loading}
                label={loading ? "Saving" : "Save"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
