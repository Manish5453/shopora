import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2, MapPin, ShieldCheck, ArrowLeft, Navigation, ShieldAlert, Package, CreditCard, QrCode, Banknote, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState('cart'); // 'cart' | 'address' | 'summary' | 'payment' | 'success'
  const [locating, setLocating] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const [addressData, setAddressData] = useState({
    fullName: userInfo?.name || '',
    phone: '',
    street: '',
    city: 'Panipat',
    state: 'Haryana',
    pincode: '132103',
  });

  useEffect(() => {
    if (userInfo && userInfo.name && !addressData.fullName) {
      setAddressData((prev) => ({ ...prev, fullName: userInfo.name }));
    }
  }, [userInfo]);

  // Success hone ke baad 2 seconds me automatic Home Page par redirect
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        navigate('/shop');
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleProceedToCheckout = () => {
    if (!userInfo) {
      alert('Please log in to your Shopora account to place an order.');
      navigate('/login?redirect=cart');
      return;
    }
    if (userInfo.role === 'admin') {
      alert('Admin accounts are not allowed to place customer orders.');
      return;
    }
    setStep('address');
  };

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setAddressData({
              ...addressData,
              street: data.address.road || data.address.suburb || addressData.street,
              city: data.address.city || data.address.town || data.address.village || addressData.city,
              state: data.address.state || addressData.state,
              pincode: data.address.postcode || addressData.pincode,
            });
          }
        } catch (err) {
          console.error('Error fetching address:', err);
          alert('Failed to retrieve location details.');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error(error);
        alert('Unable to retrieve your location. Please check browser permissions.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!userInfo || userInfo.role === 'admin') {
      alert('Action not allowed.');
      return;
    }
    setStep('summary');
  };

  const handleProceedToPayment = () => {
    if (!userInfo || userInfo.role === 'admin') {
      alert('Admin accounts cannot place orders.');
      return;
    }
    setStep('payment');
  };

const handleConfirmOrder = async () => {
    if (!userInfo || userInfo.role === 'admin') {
      alert('Admin accounts cannot place orders.');
      return;
    }

    // Cash on Delivery (COD) Option
    if (paymentMethod === 'cod') {
      saveOrderToStorage('COD_SUCCESS_' + Date.now());
      return;
    }

    if (!window.Razorpay) {
      alert('Razorpay SDK load nahi hua. Please check internet connection.');
      return;
    }

    try {
      const options = {
        // Aapki Dashboard se mili actual Test Key ID
        key: 'rzp_test_To8HyH09fFnvmq', 
        amount: totalPrice * 100, // Amount in Paise
        currency: 'INR',
        name: 'Shopora E-Commerce',
        description: 'Payment for Order Purchase',
        handler: function (response) {
          // Yeh code TABHI chalega jab actual me payment SUCCESS ho jayegi
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          saveOrderToStorage(response.razorpay_payment_id);
        },
        prefill: {
          name: addressData.fullName || userInfo?.name,
          contact: addressData.phone || '9999999999',
          email: userInfo?.email || 'customer@example.com',
        },
        theme: {
          color: '#059669', // Emerald Green Theme
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        alert(`Payment Failed: ${response.error.description || 'Transaction declined'}`);
      });

      rzp.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
      alert('Payment processing error. Please try again.');
    }
  };

  const saveOrderToStorage = (paymentId) => {
    const newOrder = {
      id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: cart,
      totalAmount: totalPrice,
      address: addressData,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentId: paymentId,
      status: 'Order Placed',
    };

    const existingOrders = JSON.parse(localStorage.getItem('shopora_orders') || '[]');
    localStorage.setItem('shopora_orders', JSON.stringify([newOrder, ...existingOrders]));

    setStep('success');
    clearCart();
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Confirmed Successfully!</h1>
        <p className="text-gray-600 text-sm">
          Thank you for shopping with Shopora, <span className="font-semibold text-gray-900">{userInfo?.name || 'Customer'}</span>! Redirecting to home page...
        </p>
        <div className="pt-2 flex justify-center items-center space-x-2 text-xs font-bold text-emerald-600">
          <Package className="h-4 w-4 animate-spin" />
          <span>Orders tab is active in Navbar!</span>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h1>
        <p className="text-gray-600 text-sm">Explore our catalog and add items to your shopping cart.</p>
        <Link to="/shop" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Checkout Step Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          {step !== 'cart' && (
            <button 
              onClick={() => {
                if (step === 'payment') setStep('summary');
                else if (step === 'summary') setStep('address');
                else if (step === 'address') setStep('cart');
              }} 
              className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-gray-600 flex items-center text-sm font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          <h1 className="text-xl font-black text-gray-900 flex items-center">
            {step === 'cart' && <><ShoppingBag className="h-6 w-6 mr-2 text-emerald-600" /> Shopping Cart ({cart.reduce((a,c) => a + c.quantity, 0)})</>}
            {step === 'address' && <><MapPin className="h-6 w-6 mr-2 text-emerald-600" /> Delivery Address</>}
            {step === 'summary' && <><ShieldCheck className="h-6 w-6 mr-2 text-emerald-600" /> Order Summary & Confirmation</>}
            {step === 'payment' && <><CreditCard className="h-6 w-6 mr-2 text-emerald-600" /> Select Payment Method</>}
          </h1>
        </div>

        {/* Non-clickable Step Indicators */}
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500">
          <span className={`px-2.5 py-1 rounded-full ${step === 'cart' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>1. Cart</span>
          <span>&gt;</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 'address' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>2. Address</span>
          <span>&gt;</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 'summary' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>3. Summary</span>
          <span>&gt;</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 'payment' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>4. Payment</span>
        </div>
      </div>

      {userInfo?.role === 'admin' && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-center space-x-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
          <span><strong>Notice:</strong> You are logged in as an Admin. Admin accounts cannot place customer orders.</span>
        </div>
      )}

      {/* STEP 1: CART VIEW */}
      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt="" className="w-20 h-20 object-cover rounded-2xl border bg-gray-50 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold">{item.category}</span>
                    <p className="text-lg font-extrabold text-gray-900 pt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-2 hover:bg-gray-200 text-gray-600 cursor-pointer"><Minus className="h-4 w-4" /></button>
                    <span className="px-4 font-bold text-sm text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-2 hover:bg-gray-200 text-gray-600 cursor-pointer"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 className="h-5 w-5" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Price Details</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-emerald-600">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              disabled={userInfo?.role === 'admin'}
              className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${userInfo?.role === 'admin' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 hover:bg-black text-white cursor-pointer'}`}
            >
              <span>{userInfo?.role === 'admin' ? 'Admin Restricted' : userInfo ? 'Proceed to Delivery Address' : 'Login to Checkout'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ADDRESS FORM */}
      {step === 'address' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Enter Delivery Address</h2>
            <button onClick={() => setStep('cart')} className="text-sm font-semibold text-gray-500 hover:text-emerald-600 flex items-center cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
            </button>
          </div>

          <button 
            type="button"
            onClick={handleFetchCurrentLocation}
            disabled={locating}
            className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Navigation className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Detecting GPS Location...' : 'Use My Current GPS Location'}</span>
          </button>

          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input type="text" value={addressData.fullName} onChange={(e) => setAddressData({...addressData, fullName: e.target.value})} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mobile Number</label>
                <input type="text" value={addressData.phone} onChange={(e) => setAddressData({...addressData, phone: e.target.value})} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Street Address / Area</label>
              <input type="text" value={addressData.street} onChange={(e) => setAddressData({...addressData, street: e.target.value})} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">City</label>
                <input type="text" value={addressData.city} onChange={(e) => setAddressData({...addressData, city: e.target.value})} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">State</label>
                <input type="text" value={addressData.state} onChange={(e) => setAddressData({...addressData, state: e.target.value})} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pincode</label>
                <input type="text" maxLength="6" value={addressData.pincode} onChange={(e) => setAddressData({...addressData, pincode: e.target.value})} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold" />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer">
              <span>Deliver Here & View Order Summary</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: ORDER SUMMARY */}
      {step === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-gray-900 flex items-center"><MapPin className="h-5 w-5 text-emerald-600 mr-2" /> Delivery Address</h3>
                <button onClick={() => setStep('address')} className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer flex items-center">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit Address
                </button>
              </div>
              <p className="font-semibold text-gray-900 pt-2">{addressData.fullName} <span className="text-gray-500 font-normal">({addressData.phone})</span></p>
              <p className="text-sm text-gray-600">{addressData.street}, {addressData.city}, {addressData.state} - <span className="font-bold text-gray-800">{addressData.pincode}</span></p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-gray-900">Review Items ({cart.reduce((a,c) => a + c.quantity, 0)})</h3>
                <button onClick={() => setStep('cart')} className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer flex items-center">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Edit Cart
                </button>
              </div>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
                    <div className="flex items-center space-x-3">
                      <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 object-cover rounded-xl border" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Final Summary</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-emerald-600">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleProceedToPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT METHOD OPTIONS */}
      {step === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 flex items-center">
              <CreditCard className="h-5 w-5 text-emerald-600 mr-2" /> Choose Payment Method
            </h2>

            <div className="space-y-4">
              {/* Option 1: UPI */}
              <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="h-4 w-4 text-emerald-600 accent-emerald-600" />
                    <div>
                      <span className="font-bold text-gray-900  flex items-center">
                        <QrCode className="h-4 w-4 mr-1.5 text-emerald-600" /> UPI / QR Code
                      </span>
                      <span className="text-xs text-gray-500">Pay via Google Pay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </div>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="mt-4 pt-3 border-t space-y-2">
                    <input 
                      type="text" 
                      placeholder="Enter VPA / UPI ID (e.g. 9905453528@paytm)" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </label>

              {/* Option 2: Credit / Debit Card */}
              <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-3">
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-4 w-4 text-emerald-600 accent-emerald-600" />
                  <div>
                    <span className="font-bold text-gray-900  flex items-center">
                      <CreditCard className="h-4 w-4 mr-1.5 text-emerald-600" /> Credit / Debit Card
                    </span>
                    <span className="text-xs text-gray-500">Visa, Mastercard, RuPay, Maestro</span>
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="mt-4 pt-3 border-t space-y-3">
                    <input type="text" placeholder="Card Number" maxLength="16" value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})} className="w-full border border-gray-300 px-4 py-2 rounded-xl text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} className="border border-gray-300 px-4 py-2 rounded-xl text-sm" />
                      <input type="password" placeholder="CVV" maxLength="3" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})} className="border border-gray-300 px-4 py-2 rounded-xl text-sm" />
                    </div>
                  </div>
                )}
              </label>

              {/* Option 3: Net Banking */}
              <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-3">
                  <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="h-4 w-4 text-emerald-600 accent-emerald-600" />
                  <div>
                    <span className="font-bold text-gray-900 flex items-center">
                      <Building2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Net Banking
                    </span>
                    <span className="text-xs text-gray-500">All major Indian banks supported</span>
                  </div>
                </div>
              </label>

              {/* Option 4: Cash on Delivery */}
              <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center space-x-3">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-emerald-600 accent-emerald-600" />
                  <div>
                    <span className="font-bold text-gray-900 flex items-center">
                      <Banknote className="h-4 w-4 mr-1.5 text-emerald-600" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-gray-500">Pay cash upon item arrival at doorstep</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Payment Summary</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span className="font-bold text-emerald-600 uppercase">{paymentMethod}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Amount Payable</span>
                <span className="text-emerald-600">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Confirm Order'}</span>
              <CheckCircle2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}