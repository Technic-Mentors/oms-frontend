import { useEffect, useState, useMemo, useCallback } from "react";
import { AddButton } from "../CustomButtons/AddButton";
import { CancelBtn } from "../CustomButtons/CancelBtn";
import { LocalButton } from "../CustomButtons/LocalButton";
import { EditButton } from "../CustomButtons/EditButton";
import { DeleteButton } from "../CustomButtons/DeleteButton";
import { Title } from "../Title";
import { InputField } from "../InputFields/InputField";
import { OptionField } from "../InputFields/OptionField";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Content/URL";
import { useAppSelector } from "../../redux/Hooks";

type AddSaleProps = {
  setModal: () => void;
  handleGetsales: () => void;
};

type CustomerT = { id: number; customerName: string };

type ProjectT = {
  id: number;
  projectName: string;
  completionStatus: string;
  projectStatus: string;
};

type CartItem = {
  id: string;
  projectId: number;
  projectName: string;
  QTY: number;
  UnitPrice: number;
};

export const AddSale = ({ setModal, handleGetsales }: AddSaleProps) => {
  const { currentUser } = useAppSelector((state) => state.officeState);
  const token = currentUser?.token;

  const [allProjects, setAllProjects] = useState<ProjectT[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerT[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [addSaleItem, setAddSaleItem] = useState({ QTY: "1", UnitPrice: "" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [saleDate, setSaleDate] = useState(
    new Date().toLocaleDateString("sv-SE"),
  );

  const getProjects = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getProjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllProjects(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  const getCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/getAllCustomers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllCustomers(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  useEffect(() => {
    getProjects();
    getCustomers();
  }, [getProjects, getCustomers]);

  const isAddToCartDisabled =
    !selectedProject ||
    !addSaleItem.QTY ||
    Number(addSaleItem.QTY) <= 0 ||
    !addSaleItem.UnitPrice ||
    Number(addSaleItem.UnitPrice) <= 0;

  const addToCart = () => {
    if (!selectedProject) return toast.error("Select a project");

    const project = allProjects.find((p) => p.id === Number(selectedProject));

    if (!project) return toast.error("Project not found");

    const isDuplicate = cart.find(
      (item) => item.projectId === project.id && item.id !== editingItemId,
    );

    if (isDuplicate) {
      return toast.error("This project is already in the cart");
    }

    const newItem: CartItem = {
      id: editingItemId || crypto.randomUUID(),
      projectId: project.id,
      projectName: project.projectName,
      QTY: Number(addSaleItem.QTY),
      UnitPrice: Number(addSaleItem.UnitPrice),
    };

    if (editingItemId) {
      setCart((prev) =>
        prev.map((item) => (item.id === editingItemId ? newItem : item)),
      );
      setEditingItemId(null);
      toast.success("Item updated");
    } else {
      setCart((prev) => [newItem, ...prev]);
      toast.success("Item added to cart");
    }

    setAddSaleItem({ QTY: "1", UnitPrice: "" });
    setSelectedProject("");
  };

  const subTotal = useMemo(
    () => cart.reduce((total, item) => total + item.QTY * item.UnitPrice, 0),
    [cart],
  );
  const totalBill = subTotal;

  const submitSale = async () => {
    if (!selectedCustomer) return toast.error("Select a customer");
    if (!cart.length) return toast.error("Add at least one project");

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/admin/addSale`,
        {
          customerId: selectedCustomer,
          saleDate,
          items: cart,
          subTotal,
          totalBill,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      handleGetsales();
      toast.success("Sale added successfully");
      closeModal();
    } catch (err) {
      console.log(err);
      toast.error("Failed to add sale");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setCart([]);
    setAddSaleItem({ QTY: "1", UnitPrice: "" });
    setSelectedCustomer("");
    setSelectedProject("");
    setEditingItemId(null);
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
            ADD SALE
          </Title>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
            <OptionField
              labelName="Project *"
              name="project"
              value={selectedProject}
              handlerChange={(e) => setSelectedProject(e.target.value)}
              optionData={allProjects.map((p) => ({
                id: p.id,
                label: p.projectName,
                value: p.id,
              }))}
              inital="Select Project"
            />
            <InputField
              labelName="QTY *"
              type="number"
              name="QTY"
              handlerChange={(e) =>
                setAddSaleItem({ ...addSaleItem, QTY: e.target.value })
              }
              value={addSaleItem.QTY}
              readOnly
            />
            <InputField
              labelName="Price *"
              type="number"
              name="UnitPrice"
              handlerChange={(e) =>
                setAddSaleItem({ ...addSaleItem, UnitPrice: e.target.value })
              }
              value={addSaleItem.UnitPrice}
              minLength={3} 
              maxLength={12}
            />
          </div>

          <div className="flex justify-end">
            <LocalButton
              loading={loading}
              label={editingItemId ? "Update Item" : "Add to Cart"}
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
              <span className="py-2">Actions</span>
            </div>

            <div className="max-h-40 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center text-black p-4 text-xs italic">
                  No items in cart
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-5 text-xs border-b last:border-0 hover:bg-gray-50 items-center text-center py-1 text-black"
                  >
                    <span className="text-gray-500">{index + 1}</span>
                    <span className="text-left truncate px-1">
                      {item.projectName}
                    </span>
                    <span>{item.QTY}</span>
                    <span>{item.UnitPrice}</span>
                    <span className="flex justify-center gap-2">
                      <EditButton
                        handleUpdate={() => {
                          setSelectedProject(item.projectId.toString());
                          setAddSaleItem({
                            QTY: item.QTY.toString(),
                            UnitPrice: item.UnitPrice.toString(),
                          });
                          setEditingItemId(item.id);
                        }}
                      />
                      <DeleteButton
                        handleDelete={() => {
                          setCart((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          );
                          toast.success("Item deleted");
                        }}
                      />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SUMMARY */}

          <div className="py-4 rounded-lg space-y-3">
            <div>
              <OptionField
                labelName="Customer *"
                name="customer"
                value={selectedCustomer}
                handlerChange={(e) => setSelectedCustomer(e.target.value)}
                optionData={allCustomers.map((c) => ({
                  id: c.id,
                  label: c.customerName,
                  value: c.id,
                }))}
                inital="Select Customer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                labelName="Date *"
                type="date"
                name="saleDate"
                value={saleDate}
                handlerChange={(e) => setSaleDate(e.target.value)}
              />
              <InputField
                labelName="Total *"
                type="number"
                name="totalBill"
                value={totalBill}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-3 bg-white">
          <CancelBtn setModal={closeModal} />
          <AddButton
            loading={loading}
            label={loading ? "Saving" : "Save"}
            handleClick={submitSale}
          />
        </div>
      </div>
    </div>
  );
};
