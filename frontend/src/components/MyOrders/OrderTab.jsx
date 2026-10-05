import React from 'react';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Pending', label: 'Chờ xác nhận' },
  { id: 'Shipping', label: 'Đang giao' },
  { id: 'Delivered', label: 'Đã giao' },
  { id: 'Canceled', label: 'Đã hủy' },
];

export default function OrderTab({ activeTab, onTabChange }) {
  return (
    <div style={{
      display: 'flex', borderBottom: '2px solid #f3f4f6',
      background: '#fff', borderRadius: '16px 16px 0 0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      padding: '0 8px', marginBottom: 20, overflowX: 'auto'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: '1 0 auto', padding: '16px 24px',
            fontSize: '0.95rem', fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative', whiteSpace: 'nowrap',
            transition: 'color 0.2s',
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div style={{
              position: 'absolute', bottom: -2, left: 0, right: 0,
              height: 3, background: 'var(--primary)', borderRadius: '3px 3px 0 0'
            }} />
          )}
        </button>
      ))}
    </div>
  );
}
