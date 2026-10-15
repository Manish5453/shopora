import { useState, useEffect } from 'react';
import { Package, ChevronRight, Truck, CheckCircle, XCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('shopora_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Kya aap sach me is order ko cancel karna chahte hain?')) {
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: 'Cancelled' };
        }
        return order;
      });
      setOrders(updatedOrders);
      localStorage.setItem('shopora_orders', JSON.stringify(updatedOrders));
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Kya aap is cancelled order ko history se delete karna chahte hain?')) {
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('shopora_orders', JSON.stringify(updatedOrders));
      
      if (updatedOrders.length === 0) {
        window.location.reload();
      }
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Package className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">No Orders Found</h1>
        <p className="text-gray-600 text-sm">Aapne abhi tak koi order nahi diya hai. Start shopping now!</p>
        <Link to="/shop" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-colors shadow-lg">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center">
        <Package className="h-7 w-7 mr-2 text-emerald-600" /> My Orders ({orders.length})
      </h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isCancelled = order.status === 'Cancelled';
          const isDelivered = order.status === 'Delivered';

          // Dynamic Status Logic for Tracking Bar
          const isShipped = order.status === 'Packed & Shipped' || order.status === 'Out for Delivery' || isDelivered;
          const isOutForDelivery = order.status === 'Out for Delivery' || isDelivered;

          let statusBg = 'bg-blue-50 text-blue-700';
          if (isCancelled) statusBg = 'bg-red-50 text-red-600';
          if (isDelivered) statusBg = 'bg-emerald-50 text-emerald-700';

          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                <div>
                  <span className="text-xs font-bold text-gray-400">ORDER ID: {order.id}</span>
                  <p className="text-sm font-medium text-gray-600">Placed on {order.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center ${statusBg}`}>
                    {isCancelled ? <XCircle className="h-3.5 w-3.5 mr-1" /> : isDelivered ? <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> : <Truck className="h-3.5 w-3.5 mr-1" />}
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div 
                    key={item._id} 
                    onClick={() => navigate(`/product/${item._id}`)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                        alt={item.title} 
                        className="w-16 h-16 object-cover rounded-xl border bg-white" 
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} | ₹{item.price.toLocaleString()} each</p>
                        <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">View Product Details &rarr;</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>

              {/* Dynamic Order Tracking Progress Bar */}
              <div className="border-t pt-4 space-y-3">
                {isCancelled ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="font-semibold flex items-center">
                      <XCircle className="h-5 w-5 mr-2 text-red-500 shrink-0" /> Yeh order cancel kar diya gaya hai.
                    </span>
                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Order History</span>
                    </button>
                  </div>
                ) : isDelivered ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm flex items-center justify-between">
                    <span className="font-semibold flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600 shrink-0" /> Order Delivered Successfully! Thank you for shopping with us.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">Order Tracking Status</span>
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      {/* Step 1: Order Placed */}
                      <div className="space-y-1">
                        <div className="w-8 h-8 mx-auto bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-xs">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-gray-900 block">Order Placed</span>
                        <span className="text-[10px] text-gray-500">{order.date}</span>
                      </div>

                      {/* Step 2: Packed & Shipped */}
                      <div className="space-y-1">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold shadow-xs transition-colors ${
                          isShipped ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {isShipped ? <CheckCircle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        </div>
                        <span className={`font-semibold block ${isShipped ? 'text-gray-900' : 'text-gray-600'}`}>
                          Packed & Shipped
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {isShipped ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      {/* Step 3: Out for Delivery */}
                      <div className="space-y-1">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold shadow-xs transition-colors ${
                          isOutForDelivery ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isOutForDelivery ? <CheckCircle className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                        </div>
                        <span className={`font-semibold block ${isOutForDelivery ? 'text-gray-900' : 'text-gray-400'}`}>
                          Out for Delivery
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {isOutForDelivery ? 'In Transit' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}