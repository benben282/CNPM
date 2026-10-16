import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5237/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success !== undefined) {
          setUsers(res.data.data || []);
        } else {
          setUsers(res.data || []);
        }
      } catch (error) {
        console.error('Lỗi tải KH:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Khách Hàng</h1>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên TK</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Đang tải...</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td><p className="font-bold text-gray-800">{u.fullName}</p></td>
                    <td><p className="text-gray-600 font-medium">{u.email}</p></td>
                    <td>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td><p className="text-gray-500 font-medium">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</p></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
