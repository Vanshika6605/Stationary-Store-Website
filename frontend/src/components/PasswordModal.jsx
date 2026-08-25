import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../api/axiosClient';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'Password must be 8-16 characters')
    .max(16, 'Password must be 8-16 characters')
    .regex(/[A-Z]/, 'Must include at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must include at least one special character')
});

const PasswordModal = ({ isOpen, onClose, apiEndpoint = '/user/password' }) => {
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMsg('');
    try {
      const res = await axiosClient.put(apiEndpoint, data);
      setSuccessMsg(res.data.message || 'Password updated successfully!');
      reset();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setServerError(
        err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to update password'
      );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '28px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
          Update Password
        </h3>

        {serverError && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '14px', marginBottom: '16px' }}>
            {serverError}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '14px', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Current Password
            </label>
            <input
              type="password"
              {...register('oldPassword')}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            {errors.oldPassword && (
              <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.oldPassword.message}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              New Password
            </label>
            <input
              type="password"
              {...register('newPassword')}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            {errors.newPassword && (
              <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '14px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
