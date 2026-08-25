import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import StarRating from '../components/StarRating';
import { Search, Store, MapPin, ArrowUpDown, Star, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        sortBy,
        sortOrder
      };
      const res = await axiosClient.get('/user/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStores();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, sortBy, sortOrder]);

  const handleRateStore = async (storeId, newRating) => {
    try {
      const res = await axiosClient.post('/user/ratings', {
        storeId,
        rating: newRating
      });

      setFeedbackMsg(res.data.message || 'Rating updated successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);

      // Re-fetch stores to update overall rating & user rating UI
      fetchStores();
    } catch (err) {
      console.error('Failed to submit rating', err);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
          Explore & Rate Stores
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Search for stores by name or address and submit/modify your 5-star ratings.
        </p>
      </div>

      {feedbackMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', marginBottom: '20px', fontSize: '14px'
        }}>
          <CheckCircle size={18} />
          {feedbackMsg}
        </div>
      )}

      {/* Controls Bar: Search & Sort */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search stores by Name or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 38px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#4b5563' }}>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#ffffff' }}
          >
            <option value="name">Store Name</option>
            <option value="address">Address</option>
            <option value="overallRating">Overall Rating</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', fontSize: '14px', cursor: 'pointer'
            }}
          >
            <ArrowUpDown size={14} />
            {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Store Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading stores...
        </div>
      ) : stores.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          No stores found matching your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {stores.map(store => (
            <div
              key={store.id}
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {store.name}
                  </h3>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Star size={12} fill="#92400e" /> {store.overallRating} ({store.totalRatings})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
                  <MapPin size={15} color="#9ca3af" />
                  <span>{store.address}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      {store.userRating ? 'Your Submitted Rating:' : 'Tap Stars to Rate:'}
                    </div>
                    <StarRating
                      rating={store.userRating || 0}
                      onRate={(newRating) => handleRateStore(store.id, newRating)}
                      size={22}
                    />
                  </div>

                  {store.userRating && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>
                      Rated {store.userRating}/5
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
