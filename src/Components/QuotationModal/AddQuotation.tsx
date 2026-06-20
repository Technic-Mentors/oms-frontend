import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { LocalButton } from "../CustomButtons/LocalButton";
import { EditButton } from "../../Components/CustomButtons/EditButton";
import { DeleteButton } from "../../Components/CustomButtons/DeleteButton";

import { Title } from "../Title";
import { InputField } from "../InputFields/InputField";
import { TextareaField } from "../InputFields/TextareaField";
import { OptionField } from "../InputFields/OptionField";

import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

type AddQuotationProps = {
  setModal: () => void;
  onAdded?: () => void;
};

type Customer = {
  id: string;
  customerName: string;
};

type Project = {
  id: string;
  projectName: string;
  completionStatus: string;
  projectStatus: string;
};

type CartItem = {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  QTY: number;
  UnitPrice: number;
};

const initialState = {
  description: "",
  QTY: "1",
  UnitPrice: "",
};

export const AddQuotation = ({ setModal, onAdded }: AddQuotationProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;

  const [addQuotation, setAddQuotation] = useState(initialState);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const storedCart = sessionStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("sv-SE"),
  );

  useEffect(() => {
    const getAllProjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/getProjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data || []);
      } catch (error) {
        console.log("Error fetching projects:", error);
      }
    };

    const getAllCustomers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/getAllCustomers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(res.data || []);
      } catch (error) {
        console.log("Error fetching customers:", error);
      }
    };

    getAllProjects();
    getAllCustomers();
  }, [token]);

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handlerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let updatedValue = value;

    if (name === "description") {
      updatedValue = value.replace(/[^a-zA-Z ]/g, "").slice(0, 250);
    }

    if (type === "number") {
      updatedValue = value.replace(/\D/g, "").slice(0, 12);
    }

    setAddQuotation((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const projectOptions = projects
    .map((p) => ({
      id: Number(p.id),
      label: p.projectName,
      value: p.id,
    }));

  const isAddToCartDisabled =
    !selectedProject ||
    !addQuotation.QTY ||
    Number(addQuotation.QTY) <= 0 ||
    !addQuotation.UnitPrice ||
    Number(addQuotation.UnitPrice) <= 0;

  const addToCart = () => {
    if (!selectedProject) return toast.error("Please select a project");

    const qty = Number(addQuotation.QTY);
    const price = Number(addQuotation.UnitPrice);
    const desc = addQuotation.description.trim();

    if (!qty || qty <= 0) return toast.error("Enter a valid QTY");
    if (!price || price <= 0) return toast.error("Enter a valid Unit Price");

    const project = projects.find((p) => p.id.toString() === selectedProject);
    if (!project) return toast.error("Selected project not found");

    // --- DUPLICATION CHECK START ---
    const isDuplicate = cart.some(
      (item) => item.projectId === project.id && item.id !== editingItemId,
    );

    if (isDuplicate) {
      return toast.error("This project is already in the cart!");
    }
    // --- DUPLICATION CHECK END ---

    if (editingItemId) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                projectId: project.id,
                projectName: project.projectName,
                description: desc,
                QTY: qty,
                UnitPrice: price,
              }
            : item,
        ),
      );

      toast.success("Item updated successfully");
      setEditingItemId(null);
    } else {
      // ➕ ADD NEW ITEM
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        projectId: project.id,
        projectName: project.projectName,
        description: desc,
        QTY: qty,
        UnitPrice: price,
      };

      setCart((prev) => [newItem, ...prev]);
      toast.success("Item added to cart");
    }

    setAddQuotation(initialState);
    setSelectedProject("");
  };

  const handlerSubmitted = async () => {
    if (!cart.length) return toast.error("Please add items before submitting");
    if (!selectedCustomer) return toast.error("Please select a customer.");

    setLoading(true);

    try {
      const payload = {
        date,
        customerId: selectedCustomer,
        items: cart,
        subTotal,
        totalBill,
      };
      await axios.post(`${BASE_URL}/api/admin/addQuotation`, payload, {
        headers: { Authorization: token },
      });

      toast.success("Quotation added successfully.");
      setCart([]);
      sessionStorage.removeItem("cart");
      setAddQuotation(initialState);
      setSelectedProject("");
      setSelectedCustomer("");

      if (onAdded) onAdded();

      setModal();
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit quotation.");
    } finally {
      setLoading(false);
    }
  };

  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.QTY * item.UnitPrice, 0);
  }, [cart]);

  const totalBill = subTotal;

  const closeModal = () => {
    setCart([]);
    sessionStorage.removeItem("cart");
    setAddQuotation(initialState);
    setSelectedProject("");
    setSelectedCustomer("");
    setModal();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex px-4 items-center justify-center z-50">
      <div className="w-[42rem] max-h-[90vh] flex flex-col overflow-y-auto bg-white mx-auto rounded-xl shadow-xl">
        <div className="bg-white rounded-xl border-t-5 border-blue-400">
          <Title
            setModal={setModal}
            className="text-white text-lg font-semibold uppercase tracking-wide"
          >
            ADD QUOTATION
          </Title>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
            <div>
              <OptionField
                labelName="Project *"
                name="selectedProject"
                value={selectedProject}
                handlerChange={(e) => setSelectedProject(e.target.value)}
                optionData={projectOptions}
                inital="Select Project"
              />
            </div>
            <InputField
              labelName="QTY *"
              type="number"
              name="QTY"
              handlerChange={handlerChange}
              value={addQuotation.QTY}
              readOnly
            
            />
            <InputField
              labelName="Project Price *"
              type="number"
              name="UnitPrice"
              handlerChange={handlerChange}
              value={addQuotation.UnitPrice}
               minLength={3} 
              maxLength={12}
            />
          </div>

          <div className="flex justify-end">
            <LocalButton
              loading={loading}
              label={loading ? "Adding to Cart" : "Add to Cart"}
              handleClick={addToCart}
              disabled={isAddToCartDisabled}
              variant="primary"
            />
          </div>

          {/* CART TABLE */}
          <div className="border rounded-lg overflow-hidden border-blue-100">
            <div className="grid grid-cols-5 bg-blue-400 text-white text-xs font-bold border-b border-blue-100 text-center">
              <span className="py-2">Sr</span>
              <span className="py-2 text-left">Project</span>
              <span className="py-2">QTY</span>
              <span className="py-2">Price</span>
              {/* <span className="py-2 text-left">Description</span> */}
              <span className="py-2">Actions</span>
            </div>

            <div className="max-h-40 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 p-4 text-xs italic">
                  No items in cart
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-5 text-xs border-b last:border-0 hover:bg-gray-50 items-center text-center py-1 text-black"
                  >
                    {/* Sr */}
                    <span className="text-black">{index + 1}</span>

                    {/* Project */}
                    <span className="text-left truncate px-1 text-black">
                      {item.projectName}
                    </span>

                    {/* Description */}
                    {/* <span className="text-left truncate px-1">
                      {item.description}
                    </span> */}

                    {/* QTY */}
                    <span>{item.QTY}</span>

                    {/* Price */}
                    <span>{item.UnitPrice}</span>

                    {/* Actions */}
                    <span className="flex justify-center gap-2">
                      <EditButton
                        handleUpdate={() => {
                          setSelectedProject(item.projectId);
                          setAddQuotation({
                            description: item.description,
                            QTY: item.QTY.toString(),
                            UnitPrice: item.UnitPrice.toString(),
                          });
                          setEditingItemId(item.id);
                        }}
                      />

                      <DeleteButton
                        handleDelete={() => {
                          setCart((prev) =>
                            prev.filter((cartItem) => cartItem.id !== item.id),
                          );
                          toast.success("Item deleted from cart");
                        }}
                      />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SUMMARY SECTION */}
          <div className="py-4 rounded-lg space-y-3">
            <div>
              <OptionField
                labelName="Customer *"
                name="selectedCustomer"
                value={selectedCustomer}
                handlerChange={(e) => setSelectedCustomer(e.target.value)}
                optionData={customers.map((c) => ({
                  id: Number(c.id),
                  label: c.customerName,
                  value: c.id,
                }))}
                inital="Please select customer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date */}
              <InputField
                labelName="Date *"
                type="date"
                name="date"
                value={date}
                handlerChange={(e) => setDate(e.target.value)}
              />

              {/* Sub Total */}
              <InputField
                labelName="Sub Total *"
                type="number"
                name="subTotal"
                value={subTotal}
                readOnly
              />

              {/* Total Bill */}
              <InputField
                labelName="Total Bill *"
                type="number"
                name="totalBill"
                value={totalBill}
                readOnly
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                labelName="Description *"
                name="description"
                handlerChange={handlerChange}
                inputVal={addQuotation.description}
                minLength={3} // Add this
                maxLength={250}
              />
            </div>
          </div>
        </div>

        {/* FOOTER: Fixed at bottom with identical padding/colors to AddSale */}
        <div className="flex justify-end gap-3 px-6 py-3 bg-white">
          <CancelBtn setModal={closeModal} />
          <AddButton
            loading={loading}
            label={loading ? "Saving" : "Save"}
            handleClick={handlerSubmitted}
          />
        </div>
      </div>
    </div>
  );
};
