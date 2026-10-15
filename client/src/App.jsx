import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders';
import AdminOrders from './pages/AdminOrders';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSelectCategory={setSelectedCategory} 
          />
          <main className="grow">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Shop 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory} 
                  />
                } 
              />
              <Route 
                path="/shop" 
                element={
                  <Shop 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory} 
                  />
                } 
              />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}