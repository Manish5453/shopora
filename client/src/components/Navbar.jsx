import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, MapPin, User, LogOut, PlusCircle, Search, ChevronDown, X, Navigation, Package, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const QUICK_CATEGORIES = [
  { name: "For You", icon: "🛍️" },
  { name: "Fashion", icon: "👕" },
  { name: "Mobiles", icon: "📱" },
  { name: "Electronics", icon: "💻" },
  { name: "Beauty", icon: "💄" },
  { name: "Home", icon: "🏠" },
  { name: "Appliances", icon: "📺" },
  { name: "Toys and Baby", icon: "🧸" },
  { name: "Books", icon: "📚" },
];

export default function Navbar({
  onSelectCategory,
  searchQuery,
  setSearchQuery,
}) {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentPincode, setCurrentPincode] = useState("132103");
  const [inputPin, setInputPin] = useState("");
  const [savedAddress, setSavedAddress] = useState("Panipat, Haryana");
  const [locating, setLocating] = useState(false);

  // Check if orders exist
  const [hasOrders, setHasOrders] = useState(false);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("shopora_orders") || "[]");
    setHasOrders(orders.length > 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
    window.location.reload();
  };

  const handleSavePincode = (e) => {
    e.preventDefault();
    if (inputPin.length === 6) {
      setCurrentPincode(inputPin);
      setSavedAddress(`Area Pin: ${inputPin}`);
      setShowAddressModal(false);
      setInputPin("");
    } else {
      alert("Please enter a valid 6-digit Pincode");
    }
  };

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          if (data && data.address) {
            const pin = data.address.postcode || "132103";
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "Current Location";
            const state = data.address.state || "";

            setCurrentPincode(pin);
            setSavedAddress(`${city}, ${state}`);
            setShowAddressModal(false);
          }
        } catch (err) {
          console.error("Error fetching address:", err);
          alert("Failed to retrieve location details.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error(error);
        alert(
          "Unable to retrieve your location. Please check browser permissions.",
        );
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex flex-col items-start leading-none">
            <span className="text-xl font-black italic text-amber-500 tracking-wider flex items-center">
              <Store className="h-6 w-6 mr-1 text-emerald-600" /> Shopora
            </span>
          </Link>
        </div>

        <button
          onClick={() => setShowAddressModal(true)}
          className="hidden md:flex items-center space-x-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="text-left">
            <span className="font-bold text-gray-900 block">
              {currentPincode}
            </span>
            <span className="text-gray-500 truncate max-w-30 block">
              {savedAddress}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1" />
        </button>

        <div className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for Products, Brands and More"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-5">
          {userInfo && userInfo.role === "admin" && (
            <>
              <Link
                to="/admin"
                className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-2 rounded-xl"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>Add Product</span>
              </Link>
              <Link
                to="/admin/orders"
                className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-2 rounded-xl"
              >
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Manage Orders</span>
              </Link>
            </>
          )}

          {/* Conditional Orders Link in Navbar (Visible ONLY if hasOrders is true) */}
          {hasOrders && (
            <Link
              to="/orders"
              className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-emerald-600 font-semibold text-sm"
            >
              <Package className="h-5 w-5 text-emerald-600" />
              <span>Orders</span>
            </Link>
          )}

          {userInfo ? (
            <div className="relative group flex items-center space-x-1 cursor-pointer py-2">
              <div className="flex items-center space-x-1 text-gray-800 font-medium text-sm">
                <User className="h-5 w-5 text-gray-600" />
                <span>{userInfo.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute right-0 top-full w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 hidden group-hover:block">
                <div className="px-4 py-2 border-b text-xs text-gray-500">
                  Signed in as <br />
                  <span className="font-semibold text-gray-900">
                    {userInfo.email}
                  </span>
                </div>

                {/* Also show in dropdown if orders exist */}
                {hasOrders && (
                  <Link
                    to="/orders"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center sm:hidden"
                  >
                    <Package className="h-4 w-4 mr-2 text-emerald-600" /> My
                    Orders
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span>Login</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center space-x-1 text-gray-700 hover:text-emerald-600 font-semibold text-sm"
          >
            <ShoppingBag className="h-6 w-6" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between overflow-x-auto space-x-6 scrollbar-none">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                onSelectCategory &&
                onSelectCategory(cat.name === "For You" ? "All" : cat.name)
              }
              className="flex flex-col items-center group cursor-pointer shrink-0"
            >
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xl group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all shadow-2xs">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 mt-1.5 group-hover:text-emerald-600 whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold flex items-center">
                <MapPin className="h-5 w-5 text-emerald-600 mr-2" /> Choose
                Delivery Location
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleFetchCurrentLocation}
              disabled={locating}
              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Navigation
                className={`h-4 w-4 ${locating ? "animate-spin" : ""}`}
              />
              <span>
                {locating ? "Detecting Location..." : "Use My Current Location"}
              </span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-gray-200"></div>
              <span className="shrink mx-4 text-gray-400 text-xs uppercase font-bold">
                or enter pincode
              </span>
              <div className="grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSavePincode} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  value={inputPin}
                  onChange={(e) =>
                    setInputPin(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="e.g. 132103"
                  required
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl text-lg font-semibold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors shadow-md cursor-pointer"
              >
                Submit Pincode
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
