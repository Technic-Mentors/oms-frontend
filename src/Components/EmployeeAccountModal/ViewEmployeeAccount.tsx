import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { Title } from "../Title";
import { Loader } from "../LoaderComponent/Loader";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { FaUser, FaEnvelope, FaPhoneAlt, FaHistory } from "react-icons/fa";

type Props = {
  setModal: () => void;
  employee: {
    id: number;
    name: string;
    email: string;
    contact: string;
  };
};

type AccountEntry = {
  id: number;
  invoiceNo?: string;
  refNo: string;
  debit: number;
  credit: number;
  payment_method: string;
  payment_date: string;
};

export const ViewEmployeeAccount = ({ setModal, employee }: Props) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;

  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = currentUser?.role === "admin";

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  const fetchEmployeeAccounts = useCallback(async () => {
    if (!currentUser || !token) return;
    if (currentUser.role === "admin" && !employee?.id) return;

    setLoading(true);
    try {
      const endpoint = isAdmin
        ? `${BASE_URL}/api/admin/getEmployeeAccount/${employee.id}`
        : `${BASE_URL}/api/user/getMyEmployeeAccount`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data.accounts || []);
    } catch (error) {
      console.error("Failed to fetch employee account details", error);
    } finally {
      setLoading(false);
    }
  }, [employee?.id, token, currentUser, isAdmin]);

  useEffect(() => {
    fetchEmployeeAccounts();
  }, [fetchEmployeeAccounts]);



  // Initialize running balance variable for calculation
  let runningNetBalance = 0;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header */}
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <div className="text-white">
            <Title setModal={setModal}>EMPLOYEE ACCOUNT DETAILS</Title>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Section 1: Employee Basic Info */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaUser className="text-gray-400" /> Name
                </label>
                <p className="text-gray-800 font-medium">{employee.name}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaEnvelope className="text-gray-400" /> Email
                </label>
                <p className="text-gray-800 font-medium">{employee.email}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaPhoneAlt className="text-gray-400" /> Contact
                </label>
                <p className="text-gray-800 font-medium">{employee.contact}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Account History Table */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <FaHistory /> Transaction History
              </span>
            </h3>

            <div className="overflow-x-auto mt-2 max-h-[50vh]">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 z-50">
                  <tr className="bg-blue-400 text-white text-[11px] ">
                    <th className="p-2 border-blue-400">Sr#</th>
                    <th className="p-2 border-blue-400">Invoice</th>
                    <th className="p-2 border-blue-400">Ref No</th>
                    <th className="p-2 border-blue-400 text-right">Debit</th>
                    <th className="p-2 border-blue-400 text-right">Credit</th>
                    <th className="p-2 border-blue-400 text-right">Balance</th>
                    <th className="p-2 border-blue-400 text-right">
                      Prev Balance
                    </th>
                    <th className="p-2 border-blue-400 text-right">
                      Net Balance
                    </th>
                    <th className="p-2 border-blue-400">Method</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {accounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-400 italic"
                      >
                        No account records found
                      </td>
                    </tr>
                  ) : (
                    accounts.map((acc, idx) => {
                      const rowBalance = (acc.debit || 0) - (acc.credit || 0);

                      const currentPrevBalance = runningNetBalance;

                      const netBalance = currentPrevBalance + rowBalance;

                      runningNetBalance = netBalance;
                      return (
                        <tr
                          key={acc.id}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-2 text-gray-600 font-semibold">
                            {idx + 1}
                          </td>

                          <td className="p-2 text-gray-800 font-medium">
                            {acc.invoiceNo || "N/A"}
                          </td>

                          <td className="p-2 text-gray-800">
                            {acc.refNo || "-"}
                          </td>
                          <td className="p-2 text-right text-green-400 font-medium">
                            {acc.debit || 0}
                          </td>
                          <td className="p-2 text-right text-red-400 font-medium">
                            {acc.credit || 0}
                          </td>

                          <td className="p-2 text-right font-medium">
                            {rowBalance.toLocaleString()}
                          </td>
                          <td className="p-2 text-right text-yellow-500">
                            {currentPrevBalance.toLocaleString()}
                          </td>
                          <td
                            className={`p-2 text-right font-bold ${
                              netBalance < 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {netBalance.toLocaleString()}
                          </td>
                          <td className="p-2">
                            <span className="py-0.5 text-[11px] font-bold text-gray-600">
                              {acc.payment_method}
                            </span>
                          </td>
                          <td className="p-2 text-gray-600">
                            {formatDate(acc.payment_date)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white p-3 flex justify-end">
          <button
            onClick={setModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-1 px-8 rounded shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
