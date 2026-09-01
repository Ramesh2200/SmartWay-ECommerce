// Master API Client for SmartWay E-Commerce
import { PRODUCTS_DATA } from '../data/productsData';
import { CATEGORIES_DATA } from '../data/categoriesData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/Ecommerce/api';
const FALLBACK_API_BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    credentials: 'include',
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data.message || `Request failed with status ${response.status}`);
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (API_BASE_URL !== FALLBACK_API_BASE_URL) {
      try {
        const fbResponse = await fetch(`${FALLBACK_API_BASE_URL}${endpoint}`, config);
        const fbData = await fbResponse.json().catch(() => ({}));
        if (!fbResponse.ok) {
          const fbErr = new Error(fbData.message || `Request failed with status ${fbResponse.status}`);
          fbErr.data = fbData;
          throw fbErr;
        }
        return fbData;
      } catch (fbErr) {
        throw (fbErr.data ? fbErr : err);
      }
    }
    throw err;
  }
}

export const api = {
  // 1. Registration Email OTP
  sendEmailOtp: (email) => request('/auth/send-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  sendOtp: (email) => request('/auth/send-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  verifyEmailOtp: (email, otp) => request('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  }),
  verifyOtp: (email, otp) => request('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  // 2. Forgot Password Email OTP
  sendForgotPasswordOtp: (email) => request('/auth/forgot-password/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  verifyForgotPasswordOtp: (email, otp) => request('/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  }),

  resetPassword: (email, newPassword) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword })
  }),

  // 3. Dynamic Filter Options API
  getFilterOptions: async (category = '') => {
    try {
      const q = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await request(`/products/filter-options${q}`);
      if (res && res.success && res.data && res.data.totalProducts > 0) {
        return res;
      }
    } catch (e) {
      console.warn('Backend filter-options fallback to master dataset:', e.message);
    }

    // Client-side fallback computation from complete 101 catalog
    const allProds = PRODUCTS_DATA;
    const catMap = new Map();
    const brandMap = new Map();
    const subcatMap = new Map();
    let minP = Infinity;
    let maxP = -Infinity;

    CATEGORIES_DATA.forEach(c => catMap.set(c.name, 0));

    allProds.forEach(p => {
      // Categories count
      catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
      // Brands count
      if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
      // Subcategories count
      if (p.subcategory) {
        const key = `${p.category}:::${p.subcategory}`;
        subcatMap.set(key, (subcatMap.get(key) || 0) + 1);
      }
      if (p.price < minP) minP = p.price;
      if (p.price > maxP) maxP = p.price;
    });

    const categoryList = Array.from(catMap.entries()).map(([name, count], idx) => ({
      id: idx + 1,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count
    }));

    const brandList = Array.from(brandMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count], idx) => ({
        id: idx + 1,
        name,
        count
      }));

    const subcategoryList = Array.from(subcatMap.entries()).map(([key, count], idx) => {
      const [categoryName, name] = key.split(':::');
      return {
        id: idx + 1,
        categoryName,
        name,
        count
      };
    });

    return {
      success: true,
      data: {
        categories: categoryList,
        brands: brandList,
        subcategories: subcategoryList,
        priceRange: { min: minP === Infinity ? 0 : minP, max: maxP === -Infinity ? 300000 : maxP },
        ratings: [
          { rating: 5.0, label: '5.0 Stars', count: allProds.filter(p => (p.rating || 0) >= 5).length },
          { rating: 4.8, label: '4.8 & above', count: allProds.filter(p => (p.rating || 0) >= 4.8).length },
          { rating: 4.5, label: '4.5 & above', count: allProds.filter(p => (p.rating || 0) >= 4.5).length },
          { rating: 4.0, label: '4.0 & above', count: allProds.filter(p => (p.rating || 0) >= 4.0).length },
          { rating: 3.0, label: '3.0 & above', count: allProds.filter(p => (p.rating || 0) >= 3.0).length }
        ],
        discounts: [
          { discount: 10, label: '10% or more', count: allProds.filter(p => (p.discount || 0) >= 10).length },
          { discount: 20, label: '20% or more', count: allProds.filter(p => (p.discount || 0) >= 20).length },
          { discount: 30, label: '30% or more', count: allProds.filter(p => (p.discount || 0) >= 30).length },
          { discount: 40, label: '40% or more', count: allProds.filter(p => (p.discount || 0) >= 40).length },
          { discount: 50, label: '50% or more', count: allProds.filter(p => (p.discount || 0) >= 50).length }
        ],
        availability: [
          { key: 'inStock', label: 'In Stock', count: allProds.filter(p => (p.stock || p.stock_quantity || 0) > 0).length },
          { key: 'outOfStock', label: 'Out of Stock', count: allProds.filter(p => (p.stock || p.stock_quantity || 0) <= 0).length }
        ],
        offers: [
          { key: 'deals', label: 'Deals & Offers', count: allProds.filter(p => (p.discount || 0) > 0).length },
          { key: 'featured', label: 'Featured Items', count: allProds.filter(p => p.featured).length },
          { key: 'bestSeller', label: 'Best Sellers', count: allProds.filter(p => p.best_seller || p.bestSeller).length }
        ],
        totalProducts: allProds.length
      }
    };
  },

  // 4. Products Query API
  getProducts: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.category && params.category !== 'All') searchParams.append('category', params.category);
      if (params.subcategory && params.subcategory !== 'All') searchParams.append('subcategory', params.subcategory);
      if (params.brand && params.brand !== 'All') searchParams.append('brand', params.brand);
      if (params.minPrice) searchParams.append('minPrice', params.minPrice);
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);
      if (params.rating) searchParams.append('rating', params.rating);
      if (params.discount) searchParams.append('discount', params.discount);
      if (params.availability) searchParams.append('availability', params.availability);
      if (params.offer) searchParams.append('offer', params.offer);
      if (params.sort) searchParams.append('sort', params.sort);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);

      const qs = searchParams.toString();
      const res = await request(`/products${qs ? `?${qs}` : ''}`);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch (e) {
      console.warn('Backend products query fallback to master dataset:', e.message);
    }

    // Client-side fallback filtering
    let results = [...PRODUCTS_DATA];

    if (params.search) {
      const term = params.search.toLowerCase().trim();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.subcategory?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    if (params.category && params.category !== 'All') {
      const cat = params.category.toLowerCase().trim();
      results = results.filter(p => p.category?.toLowerCase() === cat);
    }

    if (params.subcategory && params.subcategory !== 'All') {
      const sub = params.subcategory.toLowerCase().trim();
      results = results.filter(p => p.subcategory?.toLowerCase() === sub);
    }

    if (params.brand && params.brand !== 'All') {
      const brands = params.brand.split(',').map(b => b.trim().toLowerCase());
      results = results.filter(p => p.brand && brands.includes(p.brand.toLowerCase()));
    }

    if (params.minPrice) {
      results = results.filter(p => p.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      results = results.filter(p => p.price <= Number(params.maxPrice));
    }

    if (params.rating) {
      results = results.filter(p => (p.rating || 0) >= Number(params.rating));
    }

    if (params.discount) {
      results = results.filter(p => (p.discount || p.discount_percentage || 0) >= Number(params.discount));
    }

    if (params.availability) {
      if (params.availability === 'inStock') {
        results = results.filter(p => (p.stock || p.stock_quantity || 0) > 0);
      } else if (params.availability === 'outOfStock') {
        results = results.filter(p => (p.stock || p.stock_quantity || 0) <= 0);
      }
    }

    if (params.offer) {
      if (params.offer === 'deals') results = results.filter(p => (p.discount || 0) > 0);
      if (params.offer === 'featured') results = results.filter(p => p.featured);
      if (params.offer === 'bestSeller') results = results.filter(p => p.best_seller || p.bestSeller);
    }

    if (params.sort) {
      if (params.sort === 'priceLow' || params.sort === 'price-low') results.sort((a, b) => a.price - b.price);
      else if (params.sort === 'priceHigh' || params.sort === 'price-high') results.sort((a, b) => b.price - a.price);
      else if (params.sort === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (params.sort === 'discount') results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      else if (params.sort === 'newest') results.sort((a, b) => b.id - a.id);
      else if (params.sort === 'popular') results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      else results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return {
      success: true,
      total: results.length,
      data: results
    };
  },

  getProductById: async (id) => {
    try {
      const res = await request(`/products/${id}`);
      if (res && res.success && res.data) {
        return res;
      }
    } catch {
      // fallback to client dataset
    }
    const found = PRODUCTS_DATA.find(p => p.id === Number(id));
    if (found) {
      return { success: true, data: found };
    }
    return { success: false, message: 'Product not found' };
  },

  // 4. Order Management APIs
  createOrder: (orderData) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),

  getMyOrders: (userId) => request('/orders/my-orders' + (userId ? `?userId=${userId}` : '')),
  getUserOrders: (userId) => request('/orders/my-orders' + (userId ? `?userId=${userId}` : '')),

  getOrderById: (orderId) => request(`/orders/${orderId}`),

  cancelOrder: (orderId, userId) => request(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  })
};

