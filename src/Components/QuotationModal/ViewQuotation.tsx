import { useMemo, useCallback, useEffect, useState } from "react";
import { Title } from "../Title";
import {
  FaFileInvoice,
  FaUser,
  FaCalendarAlt,
  FaCalculator,
} from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

// Types derived from your provided code
export type CartItem = {
  id: string;
  projectName: string;
  description: string;
  QTY: number;
  UnitPrice: number;
};

type ViewQuotationProps = {
  setModal: () => void;
  quotation: {
    refNo: string;
    customerName: string;
    date: string;
    items: CartItem[];
    subTotal: number;
    totalBill: number;
  };
};

export interface BusinessVarType {
  id: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  logo?: string;
}

export const ViewQuotation = ({ setModal, quotation }: ViewQuotationProps) => {
  const { refNo, customerName, date, items, subTotal, totalBill } = quotation;
  const { currentUser } = useAppSelector((state) => state.officeState);
  const [businessVar, setBusinessVar] = useState<BusinessVarType | null>(null);
  const token = currentUser?.token;

  // Fetch Business Details for Header
  const fetchBusinessVariable = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/business-variables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.length > 0) setBusinessVar(res.data[0]);
    } catch (err) {
      console.error("Failed to fetch business variable:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchBusinessVariable();
  }, [fetchBusinessVariable]);

  const formattedDate = useMemo(() => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }, [date]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const printStyles = `
      @page { size: A4 portrait; margin: 15mm; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; }
      .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
      .business-name { font-size: 24pt; font-weight: bold; color: #1e3a8a; margin: 0; }
      .business-info { font-size: 10pt; color: #666; }
      
      .report-title { text-align: center; text-transform: uppercase; margin: 20px 0; font-size: 18pt; color: #3b82f6; text-decoration: underline; }
      
      .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
      .meta-item { font-size: 11pt; }
      .meta-label { font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 9pt; }
      
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background-color: #3b82f6; color: white; text-align: left; padding: 12px 8px; font-size: 10pt; }
      td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 10pt; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      
      .summary-section { margin-top: 30px; display: flex; justify-content: flex-end; }
      .summary-table { width: 300px; }
      .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
      .grand-total { border-top: 2px solid #3b82f6; margin-top: 10px; padding-top: 10px; font-size: 14pt; font-weight: bold; color: #1e3a8a; }
      
      .footer-note { margin-top: 50px; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    `;

    const tableRows = items
      .map(
        (item, index) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td><strong>${item.projectName}</strong><br/><small>${item.description || ""}</small></td>
        <td class="text-center">${item.QTY}</td>
        <td class="text-right">${item.UnitPrice.toLocaleString()}</td>
        <td class="text-right"><strong>${(item.QTY * item.UnitPrice).toLocaleString()}</strong></td>
      </tr>
    `,
      )
      .join("");

    printWindow?.document.write(`
      <html>
        <head>
          <title>Quotation_${refNo}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="header">
            <h1 class="business-name">${businessVar?.name ?? "OFFICE MANAGEMENT SYSTEM"}</h1>
            <div class="business-info">
              ${businessVar?.address ?? "N/A"} | Contact: ${businessVar?.contact ?? "N/A"}
            </div>
          </div>

          <h2 class="report-title">Quotation</h2>

          <div class="meta-section">
            <div class="meta-item">
              <div class="meta-label">Customer Name</div>
              <div style="font-size: 12pt; font-weight: bold;">${customerName}</div>
            </div>
            <div class="meta-item" style="text-align: right;">
              <div><span class="meta-label">Ref No:</span> ${refNo}</div>
              <div><span class="meta-label">Date:</span> ${formattedDate}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 55%;">Project / Description</th>
                <th style="width: 10%;" class="text-center">QTY</th>
                <th style="width: 15%;" class="text-right">Unit Price</th>
                <th style="width: 15%;" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-table">
              <div class="summary-row">
                <span style="color: #64748b;">Sub Total:</span>
                <span>${subTotal.toLocaleString()}</span>
              </div>
              <div class="summary-row grand-total">
                <span>Grand Total:</span>
                <span>${totalBill.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            <br/><strong>Developed With ❤️ By: Technic Mentors</strong>
          </div>
        </body>
      </html>
    `);

    printWindow?.document.close();
    setTimeout(() => {
      printWindow?.focus();
      printWindow?.print();
      printWindow?.close();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center z-50">
      <div className="w-full max-w-5xl flex flex-col max-h-[95vh] overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        {/* Header - Screen Only */}
        <div className="bg-white rounded-xl border-t-5 border-blue-400 ">
          <div className="text-white text-sm sm:text-base">
            <Title setModal={setModal}>VIEW QUOTATION DETAILS</Title>
          </div>
        </div>

        {/* Body - Screen Only */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 space-y-6">
          {/* General Info */}
          <div className="border border-gray-200 rounded-lg p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              General Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FaFileInvoice /> Reference No
                </label>
                <p className="text-gray-800 font-medium break-words">{refNo}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FaCalendarAlt /> Quotation Date
                </label>
                <p className="text-gray-800 font-medium">{formattedDate}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FaUser /> Customer Name
                </label>
                <p className="text-gray-800 font-medium break-words">
                  {customerName}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-lg p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              Project Items
            </h3>
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[600px] border border-gray-100 rounded-md">
                <div className="grid grid-cols-12 bg-blue-400 text-white text-xs font-semibold p-2">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-5">Project</span>
                  <span className="col-span-2 text-center">QTY</span>
                  <span className="col-span-2 text-right">Unit</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                <div className="divide-y">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 text-sm p-2 hover:bg-gray-50 text-black"
                    >
                      <span className="col-span-1 text-center text-gray-400">
                        {index + 1}
                      </span>
                      <span className="col-span-5 font-medium break-words">
                        {item.projectName}
                      </span>
                      <span className="col-span-2 text-center">{item.QTY}</span>
                      <span className="col-span-2 text-right">
                        {item.UnitPrice.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-semibold">
                        {(item.QTY * item.UnitPrice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="border border-gray-200 rounded-lg p-4 relative">
            <h3 className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              Billing Summary
            </h3>
            <div className="pt-4 flex justify-end">
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-black uppercase">
                    Sub Total
                  </span>
                  <span className="font-medium text-black">
                    {subTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md border border-blue-200">
                  <span className="flex items-center gap-2 font-bold text-blue-400 text-sm">
                    <FaCalculator /> Grand Total
                  </span>
                  <span className="text-blue-400 font-bold text-lg">
                    {totalBill.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white px-4 py-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={setModal}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-2 px-6 rounded-md transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-6 rounded-md transition"
          >
            Print Quotation
          </button>
        </div>
      </div>
    </div>
  );
};
