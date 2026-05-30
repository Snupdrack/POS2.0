'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface ApiProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  emoji: string;
  featured: boolean;
  available: boolean;
  imageUrl?: string;
  sortOrder: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: ApiCategory;
}

export interface ApiOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  product: ApiProduct;
}

export interface ApiOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  deliveryType: string;
  paymentMethod: string;
  notes?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  items: ApiOrderItem[];
}

export interface DashboardStats {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  validOrders: number;
  cancelledOrders: number;
  avgTicket: number;
  activeOrders: number;
  revenueByDay: { day: string; date: string; revenue: number; orders: number }[];
  topProducts: { name: string; count: number; revenue: number }[];
  deliveryBreakdown: { en_local: number; para_llevar: number; domicilio: number };
  paymentBreakdown: { efectivo: number; tarjeta: number; transferencia: number };
}

export interface ApiBusiness {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  logoUrl?: string;
  primaryColor: string;
  currency: string;
  taxRate: number;
  openHours?: string;
  socialLinks?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CATEGORIES HOOKS
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<ApiCategory[]>;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ApiCategory>) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create category');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ApiCategory> & { id: string }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update category');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============================================
// PRODUCTS HOOKS
// ============================================

export function useProducts(filters?: { categoryId?: string; available?: boolean; featured?: boolean; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.available !== undefined) params.set('available', String(filters.available));
  if (filters?.featured !== undefined) params.set('featured', String(filters.featured));
  if (filters?.search) params.set('search', filters.search);

  const qs = params.toString();
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<ApiProduct[]>;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ApiProduct>) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ApiProduct> & { id: string }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useToggleProductAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available }),
      });
      if (!res.ok) throw new Error('Failed to toggle product availability');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ============================================
// ORDERS HOOKS
// ============================================

export function useOrders(filters?: { status?: string; source?: string; limit?: number; offset?: number; from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.source) params.set('source', filters.source);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);

  const qs = params.toString();
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const res = await fetch(`/api/orders${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json() as Promise<{ orders: ApiOrder[]; total: number }>;
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerAddress?: string;
      deliveryType: string;
      paymentMethod: string;
      notes?: string;
      source?: string;
      items: { productId: string; quantity: number; notes?: string }[];
    }) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json() as Promise<ApiOrder>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ============================================
// DASHBOARD HOOKS
// ============================================

export function useDashboard(period: string = 'today') {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json() as Promise<DashboardStats>;
    },
  });
}

// ============================================
// BUSINESS HOOKS
// ============================================

export function useBusiness() {
  return useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const res = await fetch('/api/business');
      if (!res.ok) throw new Error('Failed to fetch business');
      return res.json() as Promise<ApiBusiness>;
    },
  });
}

export function useUpdateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ApiBusiness>) => {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update business');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });
}

// ============================================
// AUTH HOOKS
// ============================================

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (!res.ok) throw new Error('Logout failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth');
      if (!res.ok) return { authenticated: false, user: null };
      return res.json() as Promise<{ authenticated: boolean; user?: { userId: string; email: string; name: string; role: string } }>;
    },
    retry: false,
  });
}

// ============================================
// PAYMENT HOOKS
// ============================================

export interface CreatePreferenceRequest {
  items: { name: string; price: number; quantity: number; emoji: string; productId?: string }[];
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface CreatePreferenceResponse {
  init_point: string | null;
  sandbox_init_point: string | null;
  id: string;
  demo?: boolean;
  message?: string;
}

export function useCreatePreference() {
  return useMutation({
    mutationFn: async (data: CreatePreferenceRequest) => {
      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create payment preference');
      return res.json() as Promise<CreatePreferenceResponse>;
    },
  });
}

export function useCreateWebOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      deliveryType: string;
      paymentMethod: string;
      notes?: string;
      source?: string;
      items: { productId: string; quantity: number; notes?: string }[];
    }) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json() as Promise<ApiOrder>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ============================================
// USER MANAGEMENT HOOKS (Admin only)
// ============================================

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json() as Promise<ApiUser[]>;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string; role: string }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<{ name: string; email: string; role: string; password: string; active: boolean }> & { id: string }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update user');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete user');
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ============================================
// UTILITY
// ============================================

export function formatPrice(price: number): string {
  return `$${price}`;
}

export function formatPriceMXN(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price);
}
