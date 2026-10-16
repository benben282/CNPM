import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiBox, FiCalendar
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import './Admin.css';

const API = 'http://localhost:5237/api';

// ---- Tooltip tuỳ chỉnh cho biểu đồ ----
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-orange-100 shadow-lg rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-base font-bold text-orange-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [chartDays, setChartDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Lấy thống kê tổng quan
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/admin/stats`, authHeader);
        const raw = res.data;
        setStats(raw.data ?? raw);
      } catch (err) {
        console.error('Lỗi tải stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Lấy dữ liệu biểu đồ doanh thu theo số ngày đã chọn
  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const res = await axios.get(`${API}/admin/revenue-chart?days=${chartDays}`, authHeader);
        setChartData(res.data.data ?? []);
      } catch (err) {
        console.error('Lỗi tải biểu đồ:', err);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [chartDays]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // ---- StatCard component ----
  const StatCard = ({ title, value, icon, gradient, textColor }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${gradient}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">{title}</p>
        <h3 className={`text-2xl font-black mt-0.5 ${textColor}`}>
          {loading ? <span className="animate-pulse text-gray-300">---</span> : value}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <h1 className="admin-page-title">Tổng quan hệ thống</h1>

      {/* ---- 4 Stat Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={<FiTrendingUp className="text-green-600" />}
          gradient="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          title="Đơn Hàng"
          value={stats.totalOrders}
          icon={<FiShoppingBag className="text-orange-600" />}
          gradient="bg-orange-50"
          textColor="text-orange-600"
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalProducts}
          icon={<FiBox className="text-blue-600" />}
          gradient="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Khách Hàng"
          value={stats.totalUsers}
          icon={<FiUsers className="text-purple-600" />}
          gradient="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>

      {/* ---- Line Chart Doanh Thu ---- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h2>
            <p className="text-sm text-gray-400 mt-0.5">Doanh thu từ các đơn hàng đã giao thành công</p>
          </div>
          {/* Bộ lọc số ngày */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <FiCalendar className="text-gray-400 ml-2" />
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  chartDays === d
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-300'
                    : 'text-gray-500 hover:text-orange-500'
                }`}
              >
                {d} ngày
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-300">
            <div className="animate-pulse text-center">
              <div className="h-2 bg-gray-100 rounded w-64 mb-3 mx-auto"></div>
              <div className="h-2 bg-gray-100 rounded w-48 mx-auto"></div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                {/* Gradient màu cam cho vùng dưới đường biểu đồ */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval={chartDays <= 7 ? 0 : Math.floor(chartDays / 7)}
              />
              <YAxis
                tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}K`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ---- Welcome Banner ---- */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 text-center">
        <div className="w-16 h-16 bg-white text-orange-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm mx-auto border border-orange-100">
          😽
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng trở lại, Boss!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Tiếp tục quản lý cửa hàng và mang lại những sản phẩm tuyệt vời nhất cho thú cưng nhé.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
