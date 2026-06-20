import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { toast } from "react-toastify";

// Imported Custom Components
import { Title } from "../Title";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";

type RoleType = {
  id: number;
  roleName: string;
};

type AddAccessControlProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

export const AddAccessControl = ({ onClose, onSuccess }: AddAccessControlProps) => {
  const [allRoles, setAllRoles] = useState<RoleType[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;

  const mainModules = [
    "Dashboard", "People", "Attendance", "Human Resources",
    "Talent Acquisition", "Projects", "Performance", "Sales",
    "Expenses", "Payroll", "Assets", "Dynamics",
    "Accounts", "Reports", "Users Management", "Configuration"
  ];

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getRoles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllRoles(res?.data?.roles || []);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCheck = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const allPermissions: Record<string, boolean> = {};

    if (isChecked) {
      mainModules.forEach((item) => {
        allPermissions[item] = true;
      });
    }
    setPermissions(allPermissions);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!selectedRoleId) {
      toast.warn("Please select a role first");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/addAccessControl`,
        {
          roleId: selectedRoleId,
          permissions: permissions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Permissions updated successfully!");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-[42rem] max-h-[95vh] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl border-t-5 border-blue-400">
            <Title
              setModal={onClose}
              className="text-white text-lg font-semibold"
            >
              CONFIGURE ACCESS CONTROL
            </Title>
          </div>

          <div className="px-4 py-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Role to Assign Permissions
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                disabled={isLoading || isSaving}
                required
              >
                <option value="">-- Choose a Role --</option>
                {allRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mb-6 gap-3 bg-gray-50 p-3 rounded-md border border-gray-100">
              <input 
                type="checkbox" 
                id="checkAll"
                onChange={handleCheckAll} 
                disabled={isSaving}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="checkAll" className="font-semibold cursor-pointer select-none text-gray-700">
                Grant Access to All Modules
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mainModules.map((item) => (
                <label 
                  key={item} 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    permissions[item] ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-gray-100"
                  } ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={permissions[item] || false}
                    onChange={() => handleCheck(item)}
                    disabled={isSaving}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4">
              <CancelBtn setModal={onClose} />
              <AddButton 
                loading={isSaving} 
                label={isSaving ? "Saving..." : "Save Access"} 
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};