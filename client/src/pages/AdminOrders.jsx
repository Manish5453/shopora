import { useState, useEffect } from 'react';
import { Package, ShieldAlert, User, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('shopora_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('shopora_orders', JSON.stringify(updatedOrders));
    alert(`Order #${orderId} status updated to: ${newStatus}`);
  };

  if (!userInfo || userInfo.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 text-sm">You must be logged in as an administrator to view this page.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Package className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">No Customer Orders Yet</h1>
        <p className="text-gray-600 text-sm">Customer orders will appear here once placed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-black text-gray-900 flex items-center">
          <Package className="h-7 w-7 mr-2 text-emerald-600" /> Admin Orders Management ({orders.length})
        </h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isFinalStatus = order.status === 'Delivered' || order.status === 'Cancelled';

          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Header & Status Control */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400">ORDER ID: {order.id}</span>
                  <p className="text-sm font-semibold text-gray-800 flex items-center mt-1">
                    <User className="h-4 w-4 mr-1 text-emerald-600" /> {order.address?.fullName} ({order.address?.phone})
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" /> {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-extrabold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl border">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                  
                  {/* Status Dropdown / Disabled State */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-gray-600">Update Status:</label>
                    <select 
                      value={order.status}
                      disabled={isFinalStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`border border-gray-300 text-xs font-semibold px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs ${
                        isFinalStatus 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                          : 'bg-white text-gray-900 cursor-pointer'
                      }`}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packed & Shipped">Packed & Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Banner Notice for Admin */}
              {order.status === 'Delivered' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 shrink-0" />
                  Order Delivered — Status is locked and cannot be changed further.
                </div>
              )}

              {order.status === 'Cancelled' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500 shrink-0" />
                  Order Cancelled — Status is locked.
                </div>
              )}

              {/* Ordered Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 border">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 object-cover rounded-xl border bg-white shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-500">Qty: {item.quantity} | ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}