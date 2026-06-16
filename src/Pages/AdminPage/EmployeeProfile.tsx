import { TableTitle } from "../../Components/TableLayoutComponents/TableTitle";
import { useAppSelector } from "../../redux/Hooks";
import {
  Mail,
  CreditCard,
  Phone,
  ShieldCheck,
  User,
  LucideIcon,
} from "lucide-react";
import Avatar from "../../assets/vector.png";
import { Footer } from "../../Components/Footer";

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export const EmployeeProfile = () => {
  const { currentUser } = useAppSelector((state) => state.officeState);

  const DetailRow = ({ icon: Icon, label, value }: DetailRowProps) => (
    <div
      className="flex flex-col py-4 sm:flex-row sm:items-center sm:justify-between border-b
      border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-4 rounded-xl"
    >
      <div className="flex items-center gap-3 mb-1 sm:mb-0">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-gray-900 font-semibold sm:text-right break-words max-w-md ml-11 sm:ml-0">
        {value}
      </p>
    </div>
  );

  return (
    // min-h-screen ensures the flex-col takes up the full height to push footer down
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9fa]">
      <div className="flex-grow w-full px-4 py-6 sm:px-6 lg:px-8">
        <TableTitle tileName="Employee Profile" />
        <hr className="border-b border-gray-200 mb-8" />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
            {/* Banner Background */}
            <div
              className="h-32 bg-blue-400 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))]
              from-blue-800 via-blue-900 to-slate-900"
            />

            <div className="px-8 pb-10">
              {/* Header Section: Avatar & Name */}
              <div className="relative flex flex-col items-center sm:items-end sm:flex-row gap-6 -mt-20 mb-5">
                <div className="relative">
                  <div
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl
                    bg-blue-400 flex items-center justify-center overflow-hidden bg-cover bg-center"
                    style={{
                      backgroundImage: !currentUser?.image
                        ? `url(${Avatar})`
                        : "none",
                    }}
                  >
                    {currentUser?.image ? (
                      <img
                        className="w-full h-full object-cover"
                        src={currentUser.image}
                        alt="Profile"
                      />
                    ) : (
                      <img
                        className="w-full h-full object-cover opacity-90"
                        src={Avatar}
                        alt="Default"
                      />
                    )}
                  </div>
                  <span className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></span>
                </div>

                <div className="flex-1 text-center sm:text-left mb-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {currentUser?.name ?? "Guest Employee"}
                  </h2>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 mt-2 bg-blue-50 text-blue-700
                    rounded-full text-sm font-bold"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    { "Employee"}
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Personal Information
                  </h3>
                  <div className="bg-gray-50/50 rounded-2xl p-2 border border-gray-100">
                    <DetailRow
                      icon={Mail}
                      label="Email Address"
                      value={currentUser?.email ?? "Not provided"}
                    />
                    <DetailRow
                      icon={CreditCard}
                      label="CNIC Number"
                      value={currentUser?.cnic ?? "00000-0000000-0"}
                    />
                    <DetailRow
                      icon={Phone}
                      label="Contact Number"
                      value={currentUser?.contact ?? "Not provided"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer added here */}
      <Footer />
    </div>
  );
};
