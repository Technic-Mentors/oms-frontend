import { Title } from "../Title";
import { FaUserTie, FaCalendarAlt } from "react-icons/fa";

export type SaleItemT = {
  projectName: string;
  QTY: number;
  UnitPrice: number;
};

export type SaleDetailT = {
  customerName: string;
  saleDate: string;
  items: SaleItemT[];
};

type ViewSaleProps = {
  setIsOpenModal: () => void;
  viewSale: SaleDetailT | null;
};

export const ViewSale = ({ setIsOpenModal, viewSale }: ViewSaleProps) => {
  const formatDate = (date: string) =>
    date
      ? new Date(date)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-")
      : "N/A";

  if (!viewSale) return null;

  const totalBill = viewSale.items.reduce(
    (acc, item) => acc + item.QTY * item.UnitPrice,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm px-4 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl  overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header */}
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <Title setModal={setIsOpenModal} className="text-white">
            SALE DETAILS
          </Title>
        </div>

        <div className="p-4 space-y-4">
          {/* Section 1: Customer & Sale Date */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Customer & Timeline
            </h3>
            <div className="grid grid-cols-2 gap-y-4 pt-2">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaUserTie className="text-gray-400" /> Customer Name
                </label>
                <p className="text-gray-800 font-medium">
                  {viewSale.customerName}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <FaCalendarAlt className="text-gray-400" /> Sale Date
                </label>
                <p className="text-gray-800 font-medium">
                  {formatDate(viewSale.saleDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Sale Items */}
          <div className="border border-gray-200 rounded-md p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-[10px] font-bold text-blue-900 uppercase tracking-wider">
              Sale Items
            </h3>

            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-xs border border-gray-200">
                <thead className="bg-blue-400 text-white">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Project</th>
                    <th className="p-2 text-right">QTY</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewSale.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b last:border-0 hover:bg-gray-50 text-black"
                    >
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">{item.projectName}</td>
                      <td className="p-2 text-right">{item.QTY}</td>
                      <td className="p-2 text-right">{item.UnitPrice}</td>
                      <td className="p-2 text-right">
                        {item.QTY * item.UnitPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="text-right mt-2 font-semibold text-sm">
              Total Bill: {totalBill}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-3 flex justify-end">
          <button
            onClick={setIsOpenModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-1 px-8 rounded shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
