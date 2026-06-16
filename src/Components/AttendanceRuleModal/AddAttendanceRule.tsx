import React, { useState } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { Title } from "../Title";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";

type AddAttendanceProps = {
  setModal: () => void;
  handleGetAllTimeConfig: () => void;
};

const dayOptions = [
  { id: 1, label: "Monday", value: "Monday" },
  { id: 2, label: "Tuesday", value: "Tuesday" },
  { id: 3, label: "Wednesday", value: "Wednesday" },
  { id: 4, label: "Thursday", value: "Thursday" },
  { id: 5, label: "Friday", value: "Friday" },
  { id: 6, label: "Saturday", value: "Saturday" },
  { id: 7, label: "Sunday", value: "Sunday" },
];

const monthOptions = [
  { id: 1, label: "January", value: "January" },
  { id: 2, label: "February", value: "February" },
  { id: 3, label: "March", value: "March" },
  { id: 4, label: "April", value: "April" },
  { id: 5, label: "May", value: "May" },
  { id: 6, label: "June", value: "June" },
  { id: 7, label: "July", value: "July" },
  { id: 8, label: "August", value: "August" },
  { id: 9, label: "September", value: "September" },
  { id: 10, label: "October", value: "October" },
  { id: 11, label: "November", value: "November" },
  { id: 12, label: "December", value: "December" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  label: (currentYear + i).toString(),
  value: (currentYear + i).toString(),
}));

const initialState = {
  startTime: "",
  endTime: "",

  lateTime: "",
  halfLeave: "",
  month: "",
  year: "",
};

export const AddAttendanceRule = ({
  setModal,
  handleGetAllTimeConfig,
}: AddAttendanceProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const [addConfig, setAddConfig] = useState(initialState);
    const [loading, setLoading] = useState(false);
const [selectedOffDays, setSelectedOffDays] = useState<string[]>([]);
  const token = currentUser?.token;

const handlerChange = (
  e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
) => {
  const { name, value } = e.target;
  
  // Handle multi-select for off days separately
  if (name === "offDay") {
    const selectedValues = Array.from(
      (e.target as HTMLSelectElement).selectedOptions,
      (option) => option.value
    );
    setSelectedOffDays(selectedValues);
    return;
  }
  
  setAddConfig({ ...addConfig, [name]: value });
};

 const handlerSubmitted = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { startTime, endTime, lateTime, halfLeave, month, year } = addConfig;

  // Validate off days selection
  if (selectedOffDays.length === 0) {
    toast.error("Please select at least one off day");
    return;
  }

  // Your existing validations...
  if (lateTime < startTime || lateTime > endTime) {
    toast.error("Late Time must be between Start Time and End Time");
    return;
  }

  if (halfLeave < startTime || halfLeave > endTime) {
    toast.error("Half Leave Time must be between Start Time and End Time");
    return;
  }

  if (startTime >= endTime) {
    toast.error("Start Time must be before End Time");
    return;
  }

  setLoading(true);

  try {
    // Prepare payload with multiple off days as comma-separated string or array
    const payload = {
      ...addConfig,
      offDay: selectedOffDays.join(","), // Send as comma-separated string
      // OR send as array if backend accepts: offDays: selectedOffDays
    };

    await axios.post(`${BASE_URL}/api/admin/configureTime`, payload, {
      headers: { Authorization: token },
    });
    
    handleGetAllTimeConfig();
    setModal();
    toast.success("Configuration saved successfully");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <div
        className="fixed inset-0 bg-opacity-50 backdrop-blur-xs px-4 flex items-center justify-center z-50"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className="w-[42rem] max-h-[35rem] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl ">
          <form onSubmit={handlerSubmitted}>
            <div className="bg-white rounded-xl border-t-5 border-blue-400">
              <Title
                setModal={setModal}
                className="text-white text-lg font-semibold"
              >
                ADD ATTENDANCE RULE
              </Title>
            </div>

            <div className="mx-4 grid grid-cols-1 sm:grid-cols-2 py-6 gap-4 ">
              <InputField
                labelName="Start Time *"
                type="time"
                name="startTime"
                value={addConfig.startTime}
                handlerChange={handlerChange}
              />
              <InputField
                labelName="End Time *"
                type="time"
                name="endTime"
                value={addConfig.endTime}
                handlerChange={handlerChange}
              />

<div className="md:col-span-2">
  <label className="block text-gray-600 text-xs font-semibold mb-2">
    Off Days * (Select multiple)
  </label>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {dayOptions.map((day) => (
      <label key={day.id} className="flex items-center gap-2">
        <input
          type="checkbox"
          value={day.value}
          checked={selectedOffDays.includes(day.value)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOffDays([...selectedOffDays, day.value]);
            } else {
              setSelectedOffDays(selectedOffDays.filter((d) => d !== day.value));
            }
          }}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm text-gray-700">{day.label}</span>
      </label>
    ))}
  </div>
</div>

              <InputField
                labelName="Late Time *"
                type="time"
                name="lateTime"
                value={addConfig.lateTime}
                handlerChange={handlerChange}
              />

              <div className="md:col-span-2">
                <InputField
                  labelName="Half Leave *"
                  type="time"
                  name="halfLeave"
                  value={addConfig.halfLeave}
                  handlerChange={handlerChange}
                />
              </div>

              <OptionField
                labelName="Year *"
                name="year"
                value={addConfig.year}
                handlerChange={handlerChange}
                optionData={yearOptions}
                inital="Select Year"
              />

              <OptionField
                labelName="Month *"
                name="month"
                value={addConfig.month}
                handlerChange={handlerChange}
                optionData={monthOptions}
                inital="Select Month"
              />
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
