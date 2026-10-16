import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  FaCamera, FaEnvelope, FaPhoneAlt, FaCheck, FaTimes, FaUser, FaCalendarAlt,
  FaBirthdayCake, FaBoxOpen, FaWallet, FaMedal, FaGem, FaShieldAlt, FaPen
} from 'react-icons/fa';
import api, { getUserOrders } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { AuthContext } from '../../context/AuthContext';
import './ProfileVip.css';
import { Avatar } from './ProfileUI';

/* ---- Hạng thành viên: chỉnh mốc chi tiêu (VNĐ) tại đây ---- */
const TIERS = [
  { key: 'bronze', name: 'Đồng',      min: 0,          icon: <FaMedal /> },
  { key: 'silver', name: 'Bạc',       min: 2_000_000,  icon: <FaMedal /> },
  { key: 'gold',   name: 'Vàng',      min: 5_000_000,  icon: <FaMedal /> },
  { key: 'diamond',name: 'Kim cương', min: 10_000_000, icon: <FaGem /> },
];

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const PHONE_REGEX = /^(0|\+84)\d{9}$/;



export default function ProfileInfo() {
  const { user } = useContext(AuthContext);
  const showToast = useToast();

  const [profile, setProfile] = useState({ fullName: '', phoneNumber: '', dateOfBirth: '', gender: 'Khác', avatar: '' });
  const [initial, setInitial] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({ orders: 0, spent: 0 });

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState('');

  const [editingPhone, setEditingPhone] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState('');

  /* Lấy hồ sơ */
  useEffect(() => {
    if (!user) return;
    api.get(`/users/${user.id}`).then(res => {
      const d = res.data;
      const loaded = {
        fullName: d.fullName || '',
        phoneNumber: d.phoneNumber || '',
        dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split('T')[0] : '',
        gender: d.gender || 'Khác',
        avatar: d.avatar || ''
      };
      setProfile(loaded);
      setInitial(loaded);
      setCreatedAt(d.createdAt);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  /* Thống kê từ đơn hàng (đơn đã giao tính vào chi tiêu) */
  useEffect(() => {
    if (!user) return;
    getUserOrders(user.id).then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      const spent = list.filter(o => o.status === 'Delivered')
                        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      setStats({ orders: list.length, spent });
    }).catch(() => {});
  }, [user]);

  const dirty = initial && JSON.stringify(profile) !== JSON.stringify(initial);

  const tierIndex = useMemo(() => {
    let idx = 0;
    TIERS.forEach((t, i) => { if (stats.spent >= t.min) idx = i; });
    return idx;
  }, [stats.spent]);
  const tier = TIERS[tierIndex];
  const nextTier = TIERS[tierIndex + 1];
  const tierPct = nextTier
    ? Math.min(100, ((stats.spent - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  const completeness = useMemo(() => {
    const checks = [
      { ok: !!profile.fullName.trim(), hint: 'họ và tên' },
      { ok: !!profile.phoneNumber, hint: 'số điện thoại' },
      { ok: !!profile.dateOfBirth, hint: 'ngày sinh' },
      { ok: !!profile.avatar, hint: 'ảnh đại diện' },
    ];
    const done = checks.filter(c => c.ok).length;
    return { pct: Math.round((done / checks.length) * 100), missing: checks.filter(c => !c.ok).map(c => c.hint) };
  }, [profile]);

  const onChange = (e) => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!profile.fullName.trim()) {
      showToast('Thiếu thông tin', 'Họ và tên không được để trống', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/users/${user.id}/profile`, profile);
      setInitial(profile);
      showToast('Thành công', 'Hồ sơ đã được cập nhật', 'success');
    } catch {
      showToast('Lỗi', 'Không thể cập nhật hồ sơ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyAvatar = () => {
    setProfile(p => ({ ...p, avatar: avatarDraft.trim() }));
    setAvatarOpen(false);
  };

  const sendOtp = () => {
    if (!PHONE_REGEX.test(newPhone.trim())) {
      showToast('Số không hợp lệ', 'Nhập số điện thoại 10 số, ví dụ 0912345678', 'error');
      return;
    }
    setShowOtp(true);
  };

  const verifyOtp = async () => {
    if (otp !== '123456') {            // OTP giả lập, thay bằng SMS thật sau này
      showToast('Sai mã', 'Mã OTP không đúng', 'error');
      return;
    }
    const next = { ...profile, phoneNumber: newPhone.trim() };
    try {
      await api.put(`/users/${user.id}/profile`, next);
      setProfile(next);
      setInitial(i => ({ ...i, phoneNumber: next.phoneNumber }));
      showToast('Thành công', 'Đã lưu số điện thoại mới', 'success');
      cancelPhone();
    } catch {
      showToast('Lỗi', 'Không thể lưu số điện thoại', 'error');
    }
  };

  const cancelPhone = () => {
    setEditingPhone(false); setShowOtp(false); setNewPhone(''); setOtp('');
  };

  if (loading) {
    return (
      <div className="pv-wrap">
        <div className="pv-skeleton" style={{ height: 260 }} />
        <div className="pv-skeleton" style={{ height: 110 }} />
        <div className="pv-skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  const displayName = profile.fullName || user?.email;

  return (
    <div className="pv-wrap">
      {/* ===== HERO ===== */}
      <section className="pv-card pv-hero">
        <div className="pv-cover" />
        <div className="pv-hero-body">
          <div className="pv-avatar-wrap">
            <Avatar src={profile.avatar} name={displayName} />
            <button
              className="pv-cam"
              onClick={() => { setAvatarDraft(profile.avatar); setAvatarOpen(o => !o); }}
              aria-label="Đổi ảnh đại diện"
            ><FaCamera /></button>
          </div>

          <div className="pv-identity">
            <h2>{displayName}</h2>
            <p>{user?.email}</p>
            <div className="pv-chips">
              <span className={`pv-tier pv-tier-${tier.key}`}>{tier.icon} Hạng {tier.name}</span>
              {createdAt && (
                <span className="pv-chip">
                  <FaCalendarAlt /> Thành viên từ {new Date(createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div className="pv-complete" title="Độ hoàn thiện hồ sơ">
            <div className="pv-ring" style={{ '--pct': completeness.pct }}>
              <span>{completeness.pct}%</span>
            </div>
            <div className="pv-complete-text">
              <strong>{completeness.pct === 100 ? 'Hồ sơ hoàn hảo!' : 'Hoàn thiện hồ sơ'}</strong>
              <small>
                {completeness.pct === 100 ? 'Bạn đã điền đủ thông tin' : `Thêm ${completeness.missing[0]}`}
              </small>
            </div>
          </div>
        </div>

        {avatarOpen && (
          <div className="pv-avatar-panel">
            <Avatar src={avatarDraft} name={displayName} size={64} />
            <input
              className="pv-input pv-input-plain"
              placeholder="Dán đường dẫn ảnh (https://... hoặc /images/...)"
              value={avatarDraft}
              onChange={e => setAvatarDraft(e.target.value)}
            />
            <button className="pv-btn pv-btn-ghost" onClick={() => setAvatarOpen(false)}><FaTimes /> Hủy</button>
            <button className="pv-btn pv-btn-solid" onClick={applyAvatar}><FaCheck /> Dùng ảnh này</button>
          </div>
        )}
      </section>

      {/* ===== THỐNG KÊ + HẠNG ===== */}
      <section className="pv-stats">
        <div className="pv-stat">
          <span className="pv-stat-icon pv-ic-blue"><FaBoxOpen /></span>
          <div><b>{stats.orders}</b><small>Đơn hàng đã đặt</small></div>
        </div>
        <div className="pv-stat">
          <span className="pv-stat-icon pv-ic-green"><FaWallet /></span>
          <div><b>{formatVND(stats.spent)}</b><small>Đã mua (đơn đã giao)</small></div>
        </div>
        <div className="pv-stat pv-stat-tier">
          <div className="pv-tier-head">
            <span>{nextTier ? `Còn ${formatVND(nextTier.min - stats.spent)} lên hạng ${nextTier.name}` : 'Bạn đang ở hạng cao nhất'}</span>
            <b>{Math.round(tierPct)}%</b>
          </div>
          <div className="pv-bar"><i style={{ width: `${tierPct}%` }} /></div>
          <div className="pv-tier-labels">
            {TIERS.map((t, i) => <em key={t.key} className={i <= tierIndex ? 'on' : ''}>{t.name}</em>)}
          </div>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <div className="pv-grid">
        <section className="pv-card pv-pad">
          <h3 className="pv-title"><span className="pv-title-ic"><FaUser /></span> Thông tin cá nhân</h3>

          <label className="pv-label">Họ và tên</label>
          <div className="pv-field">
            <FaUser />
            <input name="fullName" value={profile.fullName} onChange={onChange} className="pv-input" placeholder="Nhập họ và tên" />
          </div>

          <label className="pv-label">Ngày sinh</label>
          <div className="pv-field">
            <FaBirthdayCake />
            <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={onChange} className="pv-input" />
          </div>

          <label className="pv-label">Giới tính</label>
          <div className="pv-seg">
            {['Nam', 'Nữ', 'Khác'].map(g => (
              <button
                key={g} type="button"
                className={profile.gender === g ? 'on' : ''}
                onClick={() => setProfile(p => ({ ...p, gender: g }))}
              >{g}</button>
            ))}
          </div>

          <button className="pv-btn pv-btn-solid pv-btn-block" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? 'Đang lưu...' : dirty ? 'Lưu thay đổi' : 'Đã lưu'}
          </button>
        </section>

        <section className="pv-card pv-pad">
          <h3 className="pv-title"><span className="pv-title-ic"><FaShieldAlt /></span> Thông tin liên hệ</h3>

          <div className="pv-row">
            <span className="pv-stat-icon pv-ic-blue"><FaEnvelope /></span>
            <div className="pv-row-text"><b>Địa chỉ Email</b><small>{user?.email || 'Chưa cập nhật'}</small></div>
          </div>

          <div className="pv-row">
            <span className="pv-stat-icon pv-ic-green"><FaPhoneAlt /></span>
            <div className="pv-row-text">
              <b>Số điện thoại</b>
              <small>{profile.phoneNumber || 'Chưa có số điện thoại'}</small>
            </div>
            {!editingPhone && (
              <button className="pv-link" onClick={() => setEditingPhone(true)}>
                <FaPen /> {profile.phoneNumber ? 'Thay đổi' : 'Thêm'}
              </button>
            )}
          </div>

          {editingPhone && (
            <div className="pv-otp">
              {!showOtp ? (
                <>
                  <label className="pv-label">Số điện thoại mới</label>
                  <div className="pv-inline">
                    <input className="pv-input pv-input-plain" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="09xxxxxxxx" />
                    <button className="pv-btn pv-btn-solid" onClick={sendOtp}>Gửi OTP</button>
                  </div>
                </>
              ) : (
                <>
                  <label className="pv-label">Nhập mã OTP gửi tới {newPhone} <em>(thử: 123456)</em></label>
                  <div className="pv-inline">
                    <input className="pv-input pv-input-plain pv-otp-input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="------" maxLength={6} />
                    <button className="pv-btn pv-btn-solid" onClick={verifyOtp}>Xác nhận</button>
                  </div>
                </>
              )}
              <button className="pv-link pv-link-muted" onClick={cancelPhone}>Hủy thay đổi</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
