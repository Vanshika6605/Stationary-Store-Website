import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import StarRating from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, Calendar } from 'lucide-react';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/owner/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch store owner dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        Loading Store Owner Dashboard...
      </div>
    );
  }

  if (!data || !data.hasStore) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
        <Store size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
          No Store Assigned Yet
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Your Store Owner account has not been assigned to a store yet. Please contact an Administrator to assign your store.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }}>
      {/* Store Header Banner */}
      <div style={{
        backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Store size={24} color="#4f46e5" />
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {data.storeName}
              </h1>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6b7280', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {data.storeAddress}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {data.storeEmail}
              </span>
            </div>
          </div>

          {/* Average Rating Highlight Card */}
          <div style={{
            backgroundColor: '#fef3c7', padding: '16px 24px', borderRadius: '10px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#92400e', lineHeight: 1 }}>
                {data.averageRating}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#b45309', marginTop: '4px' }}>
                AVERAGE RATING
              </div>
            </div>
            <div>
              <StarRating rating={Math.round(data.averageRating)} readOnly size={20} />
              <div style={{ fontSize: '12px', color: '#78350f', marginTop: '4px', fontWeight: 500 }}>
                Based on {data.totalRatings} user {data.totalRatings === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table Section */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={20} color="#4f46e5" />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
          User Ratings Submitted for Your Store ({data.userRatings.length})
        </h2>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
              <th style={{ padding: '12px 16px' }}>User Name</th>
              <th style={{ padding: '12px 16px' }}>User Email</th>
              <th style={{ padding: '12px 16px' }}>Submitted Rating</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.userRatings.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '28px', textAlign: 'center', color: '#6b7280' }}>
                  No ratings submitted for your store yet.
                </td>
              </tr>
            ) : (
              data.userRatings.map((item) => (
                <tr key={item.ratingId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>
                    {item.userName}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                    {item.userEmail}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating rating={item.rating} readOnly size={16} />
                      <span style={{ fontWeight: 700, color: '#d97706' }}>{item.rating} / 5</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {new Date(item.ratedAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerDashboard;
