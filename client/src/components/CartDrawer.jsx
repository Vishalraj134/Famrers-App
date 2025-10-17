import React from 'react';
import { X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartDrawer = ({ open, onClose }) => {
  const { items, removeItem, updateQty, totals, clear } = useCart();

  return (
    <div className={`${open ? 'fixed' : 'hidden'} inset-0 z-50`}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api','')||'http://localhost:5000'}${product.image_url}`} alt={product.name} className="w-14 h-14 object-cover rounded" onError={(e)=>{e.target.src='https://via.placeholder.com/56'}} />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">${Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={product.quantity} value={quantity} onChange={(e)=>updateQty(product.id, Math.max(1, Math.min(product.quantity, Number(e.target.value)||1)))} className="w-16 input-field" />
                    <button onClick={()=>removeItem(product.id)} className="text-red-600 hover:underline">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">{totals.count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-lg font-semibold">${totals.amount.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={clear} className="btn-secondary w-1/3">Clear</button>
                <button className="btn-primary w-2/3">Checkout</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
