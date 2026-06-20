import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";
import { Title } from "../Title";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowRight,
  FaUserTie,
} from "react-icons/fa";

type PromotionType = {
  employee_id: number;
  employee_name: string;
  current_designation: string;
  requested_designation: string;
  note: string;
  date: string;
  approval: string;
};

type ViewPromotionModalProps = {
  setModal: () => void;
  promotionData: PromotionType;
};

export const ViewPromotion = ({
  setModal,
  promotionData,
}: ViewPromotionModalProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const [history, setHistory] = useState<PromotionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/getPromotionHistory/${promotionData.employee_id}`,
          { headers: { Authorization: `Bearer ${currentUser?.token}` } },
        );
        const sortedHistory = res.data.sort(
          (a: PromotionType, b: PromotionType) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setHistory(sortedHistory);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setLoading(false);
      }
    };
    if (promotionData.employee_id) fetchHistory();
  }, [promotionData.employee_id, currentUser?.token]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

 

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl  flex flex-col max-h-[85vh] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header */}
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <Title
            setModal={setModal}
            className="text-white text-lg font-semibold"
          >
            VIEW PROMOTION HISTORY
          </Title>
        </div>

        <div className="p-0 overflow-y-auto bg-slate-50">
          {/* Profile Header Section */}
          <div
            className="bg-white px-8 py-6 border-b border-slate-200 flex flex-col sm:flex-row
           justify-between items-start sm:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center
               text-blue-600 shadow-inner"
              >
                <FaUserTie size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
                  {promotionData.employee_name}
                </h2>
             
              </div>
            </div>
            
          </div>

          {/* Timeline Section */}
          <div className="px-8 py-8 relative">
            <div className="absolute left-12 top-8 bottom-8 w-0.5 bg-slate-200"></div>

            <div className="space-y-10 relative">
              {loading ? (
                <div className="flex flex-col gap-4 animate-pulse pl-12">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-slate-200 rounded-xl w-full"
                    ></div>
                  ))}
                </div>
              ) : history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="relative pl-12 group">
                    {/* Status Icon Marker */}
                    <div
                      className={`absolute left-[-1px] w-9 h-9 rounded-full border-4 border-slate-50 
                        flex items-center justify-center shadow-md z-10 transition-transform group-hover:scale-110 
                      ${
                        h.approval === "ACCEPTED"
                          ? "bg-emerald-500"
                          : h.approval === "REJECTED"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                      }`}
                    >
                      {h.approval === "ACCEPTED" ? (
                        <FaCheckCircle className="text-white text-sm" />
                      ) : h.approval === "REJECTED" ? (
                        <FaTimesCircle className="text-white text-sm" />
                      ) : (
                        <FaClock className="text-white text-sm" />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div
                      className={`p-5 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md 
                      ${
                        h.date === promotionData.date
                          ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-50"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 tracking-tighter uppercase">
                          {formatDate(h.date)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        {/* Previous Designation with Black Strikethrough */}
                        <div className="bg-slate-100 px-3 py-1 rounded text-slate-500 text-sm font-medium
                         decoration-black decoration-2">
                          {h.current_designation}
                        </div>

                        <FaArrowRight className="text-slate-400 text-xs" />

                        {/* New Designation */}
                        <div className="bg-blue-100 px-3 py-1 rounded text-blue-700 text-sm font-bold shadow-sm">
                          {h.requested_designation}
                        </div>
                      </div>

                      {h.note && (
                        <div
                          className="mt-4 text-sm text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-dashed
                         border-slate-200 italic"
                        >
                          "{h.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-12 py-10 text-center text-slate-400 font-medium">
                  No previous career history recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 rounded py-3 bg-white">
          <CancelBtn setModal={setModal} />
        </div>
      </div>
    </div>
  );
};
