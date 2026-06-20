import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { UserSelect } from "../InputFields/UserSelect";
import { Title } from "../Title";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";

import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

type AddPromotionProps = {
  setModal: () => void;
  handleRefresh: () => void;
};

type AddPromotionType = {
  id: string;
  current_designation: string;
  requested_designation: string;
  note: string;
  // date: string; // Removed - will be set automatically
};

type User = {
  id: number;
  name?: string;
  loginStatus?: string;
  role?: string;
};

type LifeLine = {
  id: number;
  employee_name: string;
  email: string;
  contact: string;
  position: string;
  date: string;
};

const initialState: AddPromotionType = {
  id: "",
  current_designation: "",
  requested_designation: "",
  note: "",
  // date removed
};

export const AddPromotion = ({
  setModal,
  handleRefresh,
}: AddPromotionProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;
  const isAdmin = currentUser?.role === "admin";

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [lifeLines, setLifeLines] = useState<LifeLine[]>([]);
  const [addPromotion, setAddPromotion] =
    useState<AddPromotionType>(initialState);

  const [loading, setLoading] = useState(false);

  const getAllUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data.message || "Failed to fetch users");
    }
  }, [token]);

  const getEmployeeLifeLine = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getEmployeeLifeLine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLifeLines(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch employee lifeline");
    }
  }, [token]);

  const getMyLifeLine = useCallback(async () => {
    if (!token || isAdmin) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/user/getMyLifeLine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myLifeLineData = Array.isArray(res.data) ? res.data : [];
      
      const latestLifeLine = myLifeLineData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (latestLifeLine) {
        setAddPromotion((prev) => ({
          ...prev,
          id: String(currentUser?.id),
          current_designation: latestLifeLine.position || "",
        }));
      } else {
        setAddPromotion((prev) => ({
          ...prev,
          id: String(currentUser?.id),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch my lifeline:", error);
      setAddPromotion((prev) => ({
        ...prev,
        id: String(currentUser?.id),
      }));
    }
  }, [token, isAdmin, currentUser]);

  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
      getEmployeeLifeLine();
    } else {
      getMyLifeLine();
    }
  }, [isAdmin, getAllUsers, getEmployeeLifeLine, getMyLifeLine, currentUser]);

  const handlerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "note") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 250);
    }

    if (name === "current_designation") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    if (name === "requested_designation") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 50);
    }

    setAddPromotion((prev) => ({ ...prev, [name]: updatedValue }));

    if (name === "id") {
      const latestLifeLine = lifeLines
        .filter((l) => String(l.id) === value)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0];

      setAddPromotion((prev) => ({
        ...prev,
        current_designation: latestLifeLine?.position || "",
      }));
    }
  };

  const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Removed date from validation
    const { id, current_designation, requested_designation, note } =
      addPromotion;

    if (
      !id ||
      !current_designation ||
      !requested_designation ||
      !note
    ) {
      return toast.error("Please fill all required fields", {
        toastId: "add-promotion-validation",
      });
    }

    setLoading(true);

    try {
      const url = isAdmin
        ? `${BASE_URL}/api/admin/addPromotion`
        : `${BASE_URL}/api/user/addPromotion`;

      await axios.post(url, addPromotion, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Promotion request added successfully!", {
        toastId: "add-promotion-success",
      });

      handleRefresh();
      setAddPromotion(initialState);
      setModal();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data.message || "Failed to add promotion",
        {
          toastId: "add-promotion-error",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const userOptions = isAdmin
    ? allUsers
        .filter((u) => u.loginStatus === "Y" && u.role === "user")
        .map((u) => ({
          id: u.id,
          value: String(u.id),
          label: u.name || "",
        }))
    : [];

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur px-4 flex items-center justify-center z-50"
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    >
      <div className="w-[42rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handlerSubmitted}>
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={setModal}
              className="text-white text-lg font-semibold"
            >
              ADD PROMOTION REQUEST
            </Title>
          </div>

          <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 py-6 gap-3">
            {isAdmin && (
              <UserSelect
                labelName="Select Employee *"
                name="id"
                handlerChange={handlerChange}
                optionData={userOptions}
                value={addPromotion.id}
              />
            )}

            <InputField
              labelName="Current Position *"
              type="text"
              name="current_designation"
              handlerChange={handlerChange}
              value={addPromotion.current_designation}
              readOnly
              minLength={3}
              maxLength={50}
            />

            <InputField
              labelName="Requested Position *"
              type="text"
              name="requested_designation"
              handlerChange={handlerChange}
              value={addPromotion.requested_designation}
              minLength={3}
              maxLength={50}
            />

            {/* Date field removed - will be set automatically */}

            <div className="md:col-span-2">
              <TextareaField
                labelName="Note *"
                handlerChange={handlerChange}
                name="note"
                inputVal={addPromotion.note}
                minLength={3}
                maxLength={250}
              />
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