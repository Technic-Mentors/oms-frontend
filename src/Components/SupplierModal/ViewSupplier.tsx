import { Title } from "../Title";
import {
  FaIndustry,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,

} from "react-icons/fa";

export interface SupplierViewT {
  supplierId: number;
  supplierName: string;
  supplierEmail: string;
  supplierContact: string;
  supplierAddress: string;
}

type ModalTProps = {
  setModal: () => void;
  supplier: SupplierViewT | null;
};

export const ViewSupplierModal = ({ setModal, supplier }: ModalTProps) => {
  if (!supplier) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header */}
        <div className="bg-white rounded-xl  border-t-5 border-blue-400">
          <div className="text-white">
            <Title setModal={setModal}>SUPPLIER DETAILS</Title>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Section 1: Business Identity */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Business Identity
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaIndustry className="text-gray-400" /> Supplier Name
                </label>
                <p className="text-gray-800 font-medium">
                  {supplier.supplierName}
                </p>
              </div>
         
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaEnvelope className="text-gray-400" /> Email Address
                </label>
                <p className="text-gray-800 font-medium">
                  {supplier.supplierEmail}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaPhone className="text-gray-400" /> Contact Number
                </label>
                <p className="text-gray-800 font-medium">
                  {supplier.supplierContact}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Physical Location */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Physical Location
            </h3>
            <div className="grid grid-cols-1 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaMapMarkerAlt className="text-gray-400" /> Business Address
                </label>
                <p className="text-gray-800 font-medium break-words">
                  {supplier.supplierAddress || "No address provided"}
                </p>
              </div>
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
