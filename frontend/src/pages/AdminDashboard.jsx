import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import StarRating from '../components/StarRating';
import { Users, Store, Star, Plus, Search, ArrowUpDown, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addUserSchema = z.object({
  name: z.string().min(20, 'Name must be 20-60 chars').max(60, 'Name must be 20-60 chars'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be 8-16 chars')
    .max(16, 'Password must be 8-16 chars')
    .regex(/[A-Z]/, 'Must include 1 uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must include 1 special char'),
  address: z.string().max(400, 'Max 400 chars').optional(),
  role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER'])
});

const addStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(60, 'Max 60 chars'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required').max(400, 'Max 400 chars'),
  ownerId: z.string().optional()
});

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'stores'

  // User filters & sorting
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState({ sortBy: 'id', sortOrder: 'asc' });

  // Store filters & sorting
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'id', sortOrder: 'asc' });

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);

  const [addUserError, setAddUserError] = useState('');
  const [addStoreError, setAddStoreError] = useState('');

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    reset: resetUserForm,
    formState: { errors: userErrors, isSubmitting: isAddingUser }
  } = useForm({ resolver: zodResolver(addUserSchema), defaultValues: { role: 'NORMAL' } });

  const {
    register: registerStore,
    handleSubmit: handleStoreSubmit,
    reset: resetStoreForm,
    formState: { errors: storeErrors, isSubmitting: isAddingStore }
  } = useForm({ resolver: zodResolver(addStoreSchema) });

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const params = {
        ...userFilters,
        sortBy: userSort.sortBy,
        sortOrder: userSort.sortOrder
      };
      const res = await axiosClient.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      const params = {
        ...storeFilters,
        sortBy: storeSort.sortBy,
        sortOrder: storeSort.sortOrder
      };
      const res = await axiosClient.get('/admin/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userFilters, userSort]);

  useEffect(() => {
    fetchStores();
  }, [storeFilters, storeSort]);

  // Handle Add User
  const onAddUser = async (data) => {
    setAddUserError('');
    try {
      await axiosClient.post('/admin/users', data);
      setIsAddUserOpen(false);
      resetUserForm();
      fetchUsers();
      fetchStats();
    } catch (err) {
      setAddUserError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to add user');
    }
  };

  // Handle Add Store
  const onAddStore = async (data) => {
    setAddStoreError('');
    try {
      const payload = {
        ...data,
        ownerId: data.ownerId ? parseInt(data.ownerId, 10) : null
      };
      await axiosClient.post('/admin/stores', payload);
      setIsAddStoreOpen(false);
      resetStoreForm();
      fetchStores();
      fetchStats();
    } catch (err) {
      setAddStoreError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to add store');
    }
  };

  const handleUserSortChange = (field) => {
    setUserSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStoreSortChange = (field) => {
    setStoreSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter list of store owners for store owner selection modal
  const storeOwners = users.filter(u => u.role === 'STORE_OWNER');

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header */}
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>
        Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#e0e7ff', borderRadius: '10px', color: '#4f46e5' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Users</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{stats.totalUsers}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
            <Store size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Stores</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{stats.totalStores}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '10px', color: '#059669' }}>
            <Star size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Submitted Ratings</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{stats.totalRatings}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeTab === 'users' ? '#4f46e5' : '#6b7280',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            style={{
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              borderBottom: activeTab === 'stores' ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeTab === 'stores' ? '#4f46e5' : '#6b7280',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Store Management ({stores.length})
          </button>
        </div>

        {activeTab === 'users' ? (
          <button
            onClick={() => setIsAddUserOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add User
          </button>
        ) : (
          <button
            onClick={() => setIsAddStoreOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Store
          </button>
        )}
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <input
              type="text"
              placeholder="Filter by name..."
              value={userFilters.name}
              onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <input
              type="text"
              placeholder="Filter by email..."
              value={userFilters.email}
              onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <input
              type="text"
              placeholder="Filter by address..."
              value={userFilters.address}
              onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <select
              value={userFilters.role}
              onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="NORMAL">NORMAL</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
            </select>
          </div>

          {/* Users Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleUserSortChange('name')}>
                    Name <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleUserSortChange('email')}>
                    Email <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleUserSortChange('address')}>
                    Address <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleUserSortChange('role')}>
                    Role <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px' }}>Store Rating (Owners)</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{u.address || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'STORE_OWNER' ? '#fef3c7' : '#e0e7ff',
                          color: u.role === 'ADMIN' ? '#991b1b' : u.role === 'STORE_OWNER' ? '#92400e' : '#3730a3'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.role === 'STORE_OWNER' ? (
                          u.storeRating !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <StarRating rating={Math.round(u.storeRating)} readOnly size={16} />
                              <span style={{ fontWeight: 600, color: '#d97706' }}>{u.storeRating} / 5</span>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>No store assigned</span>
                          )
                        ) : (
                          <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STORE MANAGEMENT TAB */}
      {activeTab === 'stores' && (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <input
              type="text"
              placeholder="Filter by store name..."
              value={storeFilters.name}
              onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <input
              type="text"
              placeholder="Filter by store email..."
              value={storeFilters.email}
              onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <input
              type="text"
              placeholder="Filter by address..."
              value={storeFilters.address}
              onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
          </div>

          {/* Stores Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleStoreSortChange('name')}>
                    Store Name <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleStoreSortChange('email')}>
                    Store Email <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleStoreSortChange('address')}>
                    Address <ArrowUpDown size={12} />
                  </th>
                  <th style={{ padding: '12px 16px' }}>Owner</th>
                  <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleStoreSortChange('overallRating')}>
                    Overall Rating <ArrowUpDown size={12} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                      No stores found.
                    </td>
                  </tr>
                ) : (
                  stores.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{s.name}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{s.email}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{s.address}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>
                        {s.owner ? s.owner.name : <span style={{ color: '#9ca3af' }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StarRating rating={Math.round(s.overallRating)} readOnly size={16} />
                          <span style={{ fontWeight: 600, color: '#d97706' }}>{s.overallRating}</span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>({s.totalRatings} ratings)</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>Add New User</h3>

            {addUserError && (
              <div style={{ padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {addUserError}
              </div>
            )}

            <form onSubmit={handleUserSubmit(onAddUser)}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Name (20-60 chars)</label>
                <input type="text" {...registerUser('name')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {userErrors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{userErrors.name.message}</span>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Email</label>
                <input type="email" {...registerUser('email')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {userErrors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>{userErrors.email.message}</span>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Password (8-16 chars, 1 Uppercase, 1 Special)</label>
                <input type="password" {...registerUser('password')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {userErrors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>{userErrors.password.message}</span>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Address (Max 400 chars)</label>
                <input type="text" {...registerUser('address')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {userErrors.address && <span style={{ color: '#dc2626', fontSize: '12px' }}>{userErrors.address.message}</span>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Role</label>
                <select {...registerUser('role')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}>
                  <option value="NORMAL">NORMAL</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STORE_OWNER">STORE_OWNER</option>
                </select>
                {userErrors.role && <span style={{ color: '#dc2626', fontSize: '12px' }}>{userErrors.role.message}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsAddUserOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isAddingUser} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>{isAddingUser ? 'Adding...' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STORE MODAL */}
      {isAddStoreOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>Add New Store</h3>

            {addStoreError && (
              <div style={{ padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {addStoreError}
              </div>
            )}

            <form onSubmit={handleStoreSubmit(onAddStore)}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Store Name</label>
                <input type="text" {...registerStore('name')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {storeErrors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{storeErrors.name.message}</span>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Store Email</label>
                <input type="email" {...registerStore('email')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {storeErrors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>{storeErrors.email.message}</span>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Address</label>
                <input type="text" {...registerStore('address')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                {storeErrors.address && <span style={{ color: '#dc2626', fontSize: '12px' }}>{storeErrors.address.message}</span>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Assign Store Owner (Optional)</label>
                <select {...registerStore('ownerId')} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}>
                  <option value="">None (Unassigned)</option>
                  {storeOwners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsAddStoreOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isAddingStore} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>{isAddingStore ? 'Adding...' : 'Add Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
