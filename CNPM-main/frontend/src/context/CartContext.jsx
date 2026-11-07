import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart, createOrder } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

// Get or create a persistent session ID for guests
function getPersistentGuestSessionId() {
    let sid = localStorage.getItem('guest_cart_session');
    if (!sid) {
        sid = `guest_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('guest_cart_session', sid);
    }
    return sid;
}

export const CartProvider = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Session ID depends on user login state
    const sessionId = user ? `user_${user.id}` : getPersistentGuestSessionId();

    // Khai báo fetchCart trước để useEffect gọi không bị lỗi hoisting
    const fetchCart = async (sid = sessionId) => {
        try {
            const res = await getCart(sid);
            if (res.data && res.data.items) {
                setCartItems(res.data.items);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            console.error('Lỗi tải giỏ hàng', err);
            setCartItems([]);
        }
    };

    // Fetch cart when sessionId changes or auth finishes loading
    useEffect(() => {
        if (!loading && sessionId) {
            fetchCart(sessionId);
        }
    }, [sessionId, loading]);

    const addToCart = async (product, quantity = 1, variantId = null) => {
        try {
            const res = await apiAddToCart(sessionId, product.id, quantity, variantId);
            if (res.data && res.data.items) {
                setCartItems(res.data.items);
                setCartOpen(true);
            }
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity <= 0) return removeItem(itemId);
        try {
            const res = await updateCartItem(sessionId, itemId, quantity);
            if (res.data && res.data.items) setCartItems(res.data.items);
        } catch (err) {
            console.error(err);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const res = await removeFromCart(sessionId, itemId);
            if (res.data && res.data.items) setCartItems(res.data.items);
        } catch (err) {
            console.error(err);
        }
    };

    const checkout = async (shippingInfo) => {
        try {
            const res = await createOrder({
                userId: user ? user.id : null,
                sessionId,
                ...shippingInfo
            });
            setCartItems([]);
            setCartOpen(false);
            return res.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, cartCount, cartTotal, sessionId,
            addToCart, updateQuantity, removeItem, checkout,
            cartOpen, setCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};