'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Product, products as initialProducts } from './menu-data';

// Cart Item
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order for POS
export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryType: 'domicilio' | 'para_llevar' | 'en_local';
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  subtotal: number;
  tax: number;
  total: number;
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  createdAt: string;
  orderNumber: number;
}

// Reservation
export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
  occasion: string;
  confirmationCode: string;
  status: 'confirmada' | 'cancelada' | 'completada';
  createdAt: string;
}

// Product with availability
export interface ManagedProduct extends Product {
  available: boolean;
}

interface StoreState {
  cart: CartItem[];
  managedProducts: ManagedProduct[];
  orders: Order[];
  reservations: Reservation[];
  activeSection: string;
  isHydrated: boolean;
}

type StoreAction =
  | { type: 'HYDRATE'; payload: Partial<StoreState> }
  | { type: 'ADD_TO_CART'; product: Product }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'UPDATE_CART_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_PRODUCT_AVAILABILITY'; productId: string }
  | { type: 'ADD_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: Order['status'] }
  | { type: 'ADD_RESERVATION'; reservation: Reservation }
  | { type: 'UPDATE_RESERVATION_STATUS'; reservationId: string; status: Reservation['status'] }
  | { type: 'SET_ACTIVE_SECTION'; section: string };

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Demo orders for the admin dashboard
function generateDemoOrders(): Order[] {
  const now = new Date();
  const demoOrders: Order[] = [];
  const names = ['María García', 'José López', 'Ana Martínez', 'Carlos Sánchez', 'Rosa Hernández', 'Miguel Torres', 'Laura Díaz', 'Pedro Ramírez'];
  const deliveryTypes: Order['deliveryType'][] = ['domicilio', 'para_llevar', 'en_local'];
  const paymentMethods: Order['paymentMethod'][] = ['efectivo', 'tarjeta', 'transferencia'];
  const statuses: Order['status'][] = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];

  for (let i = 0; i < 24; i++) {
    const hoursAgo = Math.floor(Math.random() * 168);
    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const numItems = Math.floor(Math.random() * 4) + 1;
    const items: CartItem[] = [];

    for (let j = 0; j < numItems; j++) {
      const product = initialProducts[Math.floor(Math.random() * initialProducts.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      items.push({ product, quantity: qty });
    }

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.16);
    const total = subtotal + tax;

    demoOrders.push({
      id: generateId(),
      items,
      customerName: names[Math.floor(Math.random() * names.length)],
      customerPhone: `951${Math.floor(Math.random() * 9000000 + 1000000)}`,
      deliveryType: deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      subtotal,
      tax,
      total,
      status: hoursAgo > 48 ? statuses[Math.floor(Math.random() * statuses.length)] : (Math.random() > 0.3 ? 'entregado' : statuses[Math.floor(Math.random() * 3)]),
      createdAt: date.toISOString(),
      orderNumber: 1000 + i,
    });
  }

  return demoOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Demo reservations
function generateDemoReservations(): Reservation[] {
  const names = ['María García', 'José López', 'Ana Martínez', 'Carlos Sánchez'];
  const times = ['18:00', '19:00', '19:30', '20:00'];
  const guests = ['2', '4', '6', '3'];
  const occasions = ['cumpleanos', 'aniversario', '', 'amigos'];
  const statuses: Reservation['status'][] = ['confirmada', 'confirmada', 'completada', 'confirmada'];

  const today = new Date();
  const reservations: Reservation[] = [];

  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + Math.floor(Math.random() * 7));
    reservations.push({
      id: generateId(),
      name: names[i],
      phone: `951${Math.floor(Math.random() * 9000000 + 1000000)}`,
      email: '',
      date: date.toISOString().split('T')[0],
      time: times[i],
      guests: guests[i],
      notes: '',
      occasion: occasions[i],
      confirmationCode: `NITO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: statuses[i],
      createdAt: new Date(today.getTime() - Math.random() * 86400000).toISOString(),
    });
  }

  return reservations;
}

const initialState: StoreState = {
  cart: [],
  managedProducts: initialProducts.map(p => ({ ...p, available: true })),
  orders: [],
  reservations: [],
  activeSection: 'landing',
  isHydrated: false,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, isHydrated: true };

    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { product: action.product, quantity: 1 }] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.product.id !== action.productId) };

    case 'UPDATE_CART_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter(item => item.product.id !== action.productId) };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.productId ? { ...item, quantity: action.quantity } : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'TOGGLE_PRODUCT_AVAILABILITY':
      return {
        ...state,
        managedProducts: state.managedProducts.map(p =>
          p.id === action.productId ? { ...p, available: !p.available } : p
        ),
      };

    case 'ADD_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.orderId ? { ...o, status: action.status } : o
        ),
      };

    case 'ADD_RESERVATION':
      return { ...state, reservations: [action.reservation, ...state.reservations] };

    case 'UPDATE_RESERVATION_STATUS':
      return {
        ...state,
        reservations: state.reservations.map(r =>
          r.id === action.reservationId ? { ...r, status: action.status } : r
        ),
      };

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.section };

    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  // Convenience functions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  toggleProductAvailability: (productId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'orderNumber'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getNextOrderNumber: () => number;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservationStatus: (reservationId: string, status: Reservation['status']) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  managedProducts: ManagedProduct[];
  orders: Order[];
  reservations: Reservation[];
  cart: CartItem[];
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const ordersRef = useRef(state.orders);

  // Keep ref in sync
  useEffect(() => {
    ordersRef.current = state.orders;
  }, [state.orders]);

  // Load from localStorage on mount
  useEffect(() => {
    const payload: Partial<StoreState> = {};
    try {
      const savedCart = localStorage.getItem('nito-cart');
      const savedOrders = localStorage.getItem('nito-orders');
      const savedProducts = localStorage.getItem('nito-products');
      const savedSection = localStorage.getItem('nito-section');
      const savedReservations = localStorage.getItem('nito-reservations');

      if (savedCart) payload.cart = JSON.parse(savedCart);
      if (savedOrders) {
        payload.orders = JSON.parse(savedOrders);
      } else {
        payload.orders = generateDemoOrders();
      }
      if (savedProducts) payload.managedProducts = JSON.parse(savedProducts);
      if (savedSection) payload.activeSection = savedSection;
      if (savedReservations) {
        payload.reservations = JSON.parse(savedReservations);
      } else {
        payload.reservations = generateDemoReservations();
      }
    } catch {
      payload.orders = generateDemoOrders();
      payload.reservations = generateDemoReservations();
    }
    dispatch({ type: 'HYDRATE', payload });
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!state.isHydrated) return;
    localStorage.setItem('nito-cart', JSON.stringify(state.cart));
  }, [state.cart, state.isHydrated]);

  useEffect(() => {
    if (!state.isHydrated) return;
    localStorage.setItem('nito-orders', JSON.stringify(state.orders));
  }, [state.orders, state.isHydrated]);

  useEffect(() => {
    if (!state.isHydrated) return;
    localStorage.setItem('nito-products', JSON.stringify(state.managedProducts));
  }, [state.managedProducts, state.isHydrated]);

  useEffect(() => {
    if (!state.isHydrated) return;
    localStorage.setItem('nito-section', state.activeSection);
  }, [state.activeSection, state.isHydrated]);

  useEffect(() => {
    if (!state.isHydrated) return;
    localStorage.setItem('nito-reservations', JSON.stringify(state.reservations));
  }, [state.reservations, state.isHydrated]);

  // Convenience functions
  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', product });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleProductAvailability = useCallback((productId: string) => {
    dispatch({ type: 'TOGGLE_PRODUCT_AVAILABILITY', productId });
  }, []);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt' | 'orderNumber'>): Order => {
    const currentOrders = ordersRef.current;
    const newOrder: Order = {
      ...orderData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      orderNumber: 1000 + currentOrders.length + 1,
    };
    dispatch({ type: 'ADD_ORDER', order: newOrder });
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status });
  }, []);

  const getNextOrderNumber = useCallback(() => {
    const maxNum = ordersRef.current.reduce((max, o) => Math.max(max, o.orderNumber), 1000);
    return maxNum + 1;
  }, []);

  const addReservation = useCallback((reservationData: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: generateId(),
    };
    dispatch({ type: 'ADD_RESERVATION', reservation: newReservation });
  }, []);

  const updateReservationStatus = useCallback((reservationId: string, status: Reservation['status']) => {
    dispatch({ type: 'UPDATE_RESERVATION_STATUS', reservationId, status });
  }, []);

  const setActiveSection = useCallback((section: string) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', section });
  }, []);

  const cartTotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!state.isHydrated) {
    return null;
  }

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        toggleProductAvailability,
        addOrder,
        updateOrderStatus,
        getNextOrderNumber,
        addReservation,
        updateReservationStatus,
        activeSection: state.activeSection,
        setActiveSection,
        managedProducts: state.managedProducts,
        orders: state.orders,
        reservations: state.reservations,
        cart: state.cart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
