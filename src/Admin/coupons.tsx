import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar.tsx";
import Server_url from "../config.js";
import { v4 as uuidv4 } from "uuid";
import { useView } from '../Context/ViewContext.tsx';

const CouponCard: React.FC<{
  coupon: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}> = ({ coupon, onEdit, onDelete, onToggleActive }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-blue-700">{coupon.title}</h3>
          <p className="text-xs text-gray-500 mb-2">Code: <span className="font-mono font-semibold">{coupon.code}</span></p>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mr-2">
            {coupon.amount_type === "percent" ? `${coupon.amount}%` : `$${coupon.amount}`}
          </span>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mr-2">
            {coupon.user_type}
          </span>
          {coupon.limit_of_uses ? (
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full mr-2">
              Uses: {coupon.limit_of_uses}
            </span>
          ) : (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mr-2">
              Unlimited Uses
            </span>
          )}
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${coupon.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {coupon.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Actions"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="19" cy="12" r="2" fill="currentColor" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
              <button
                onClick={() => { setMenuOpen(false); onToggleActive(); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                {coupon.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <span>From: {new Date(coupon.from_date).toLocaleDateString()}</span>
        {coupon.to_date && <span className="ml-2">To: {new Date(coupon.to_date).toLocaleDateString()}</span>}
      </div>
    </div>
  );
};

const AddCouponModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  coupon?: any;
  isEditMode?: boolean;
}> = ({ isOpen, onClose, onSave, coupon, isEditMode }) => {
  const [title, setTitle] = useState(coupon?.title || "");
  const [code, setCode] = useState(coupon?.code || "");
  const [amount, setAmount] = useState(coupon?.amount || "");
  const [amountType, setAmountType] = useState(coupon?.amount_type || "percent");
  const [fromDate, setFromDate] = useState(coupon?.from_date ? coupon.from_date.slice(0, 16) : "");
  const [toDate, setToDate] = useState(coupon?.to_date ? coupon.to_date.slice(0, 16) : "");
  const [limitOfUses, setLimitOfUses] = useState(coupon?.limit_of_uses || "");
  const [userType, setUserType] = useState(coupon?.user_type || "teacher");
  const [active, setActive] = useState(coupon?.active ?? true);

  useEffect(() => {
    if (isEditMode && coupon) {
      setTitle(coupon.title);
      setCode(coupon.code);
      setAmount(coupon.amount);
      setAmountType(coupon.amount_type);
      setFromDate(coupon.from_date ? coupon.from_date.slice(0, 16) : "");
      setToDate(coupon.to_date ? coupon.to_date.slice(0, 16) : "");
      setLimitOfUses(coupon.limit_of_uses || "");
      setUserType(coupon.user_type);
      setActive(coupon.active);
    }
  }, [isEditMode, coupon]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Always set time to midnight
    const fromDateMidnight = fromDate ? `${fromDate}T00:00:00` : "";
    const toDateMidnight = toDate ? `${toDate}T00:00:00` : "";
    onSave({
      title,
      code,
      amount,
      amount_type: amountType,
      from_date: fromDateMidnight,
      to_date: toDateMidnight,
      limit_of_uses: limitOfUses,
      user_type: userType,
      active,
    });
    onClose();
  };
  const handleGenerateCode = () => {
    setCode(uuidv4().split("-")[0].toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <form className="flex-1 p-6 space-y-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4">{isEditMode ? "Edit Coupon" : "Add Coupon"}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <button
              type="button"
              className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs font-semibold hover:bg-blue-600"
              onClick={handleGenerateCode}
            >
              Generate Coupon
            </button>
          </div>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-4"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={amountType} onChange={e => setAmountType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="percent">%</option>
                <option value="fixed">$</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 max-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1 max-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit of Uses</label>
            <input type="number" value={limitOfUses} onChange={e => setLimitOfUses(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
            <select value={userType} onChange={e => setUserType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="teacher">Teacher</option>
              <option value="extension">Extension</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="mr-2" />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">Save Coupon</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
    const { currentUser } = useView();
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Coupon Codes</h1>
            </div>
            <div className="flex items-center space-x-6">
               
                <div className="flex items-center space-x-3">
                    {currentUser?.avatar_url ? (
                        <img 
                            src={currentUser.avatar_url} 
                            alt={currentUser.first_name || 'User'} 
                            className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg border-2 border-blue-100">
                            {currentUser ? 
                                (currentUser.first_name?.[0] || currentUser.username?.[0] || 'U').toUpperCase()
                                : 'AD'
                            }
                        </div>
                    )}
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-800">
                            {currentUser?.first_name && currentUser?.last_name 
                                ? `${currentUser.first_name} ${currentUser.last_name}`
                                : currentUser?.username || 'Admin Panel'
                            }
                        </p>
                        <p className="text-xs text-gray-500">
                            {currentUser?.is_superuser ? 'Super User' : 'Admin'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchCoupons = async () => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${Server_url}/api/users/coupons/all/`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    setCoupons(data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (couponData: any) => {
    const token = localStorage.getItem("authToken");
    await fetch(`${Server_url}/api/users/coupons/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(couponData),
    });
    setIsModalOpen(false);
    fetchCoupons();
  };

  const handleEditCoupon = async (couponData: any) => {
    const token = localStorage.getItem("authToken");
    await fetch(`${Server_url}/api/users/coupons/${selectedCoupon.id}/update/`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(couponData),
    });
    setIsModalOpen(false);
    setSelectedCoupon(null);
    setIsEditMode(false);
    fetchCoupons();
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const token = localStorage.getItem("authToken");
    await fetch(`${Server_url}/api/users/coupons/${couponId}/delete/`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    fetchCoupons();
  };

  const handleToggleActive = async (coupon: any) => {
    const token = localStorage.getItem("authToken");
    await fetch(`${Server_url}/api/users/coupons/${coupon.id}/toggle-active/`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    fetchCoupons();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Header />
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Coupon Codes</h1>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              onClick={() => {
                setIsModalOpen(true);
                setSelectedCoupon(null);
                setIsEditMode(false);
              }}
            >
              Add Coupon
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={() => {
                  setSelectedCoupon(coupon);
                  setIsEditMode(true);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDeleteCoupon(coupon.id)}
                onToggleActive={() => handleToggleActive(coupon)}
              />
            ))}
          </div>
          <AddCouponModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={isEditMode ? handleEditCoupon : handleAddCoupon}
            coupon={selectedCoupon}
            isEditMode={isEditMode}
          />
        </div>
      </main>
    </div>
  );
};

export default CouponsPage;
