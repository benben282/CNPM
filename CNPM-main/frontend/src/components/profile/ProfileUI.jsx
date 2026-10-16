import React, { useId, useState, useEffect } from 'react';

/* =====================================================================
   BỘ THÀNH PHẦN DÙNG CHUNG CHO CÁC TAB HỒ SƠ
   Giao diện nằm trong ProfileVip.css (các class bắt đầu bằng "pv-").
   Tab nào cũng dùng bộ này để nhìn đồng bộ với nhau.
   ===================================================================== */

/* Ảnh đại diện: có ảnh thì hiện ảnh, lỗi/không có thì hiện chữ cái đầu */
export function Avatar({ src, name, size = 112 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const letter = (name || 'U').trim().charAt(0).toUpperCase();
  return (
    <div className="pv-avatar" style={{ width: size, height: size }}>
      {src && !failed
        ? <img src={src} alt="Avatar" onError={() => setFailed(true)} />
        : <span style={{ fontSize: size * 0.42 }}>{letter}</span>}
    </div>
  );
}

/* Tiêu đề đầu mỗi tab: icon + tiêu đề + mô tả, nút hành động nằm bên phải */
export function PageHeader({ icon, title, subtitle, action }) {
  return (
    <header className="pv-pagehead">
      <div className="pv-pagehead-main">
        {icon && <span className="pv-pagehead-ic">{icon}</span>}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action && <div className="pv-pagehead-action">{action}</div>}
    </header>
  );
}

/* Khung trắng bo góc. Có title thì hiện tiêu đề nhỏ kèm icon */
export function Card({ title, icon, pad = true, className = '', children }) {
  const cls = ['pv-card', pad && 'pv-pad', className].filter(Boolean).join(' ');
  return (
    <section className={cls}>
      {title && (
        <h3 className="pv-title">
          {icon && <span className="pv-title-ic">{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

/* Ô nhập chữ: nhãn + icon + input (mọi thuộc tính của input truyền thẳng vào) */
export function TextField({ label, icon, suffix, ...inputProps }) {
  const id = useId();
  return (
    <>
      {label && <label className="pv-label" htmlFor={id}>{label}</label>}
      <div className="pv-field">
        {icon}
        <input id={id} className="pv-input" {...inputProps} />
        {suffix}
      </div>
    </>
  );
}

/* Ô chọn (dropdown): dùng như <SelectField label="..."><option>..</option></SelectField> */
export function SelectField({ label, children, ...selectProps }) {
  const id = useId();
  return (
    <>
      {label && <label className="pv-label" htmlFor={id}>{label}</label>}
      <select id={id} className="pv-input-plain pv-select" {...selectProps}>
        {children}
      </select>
    </>
  );
}

/* Ô tích chọn */
export function CheckRow({ label, ...inputProps }) {
  return (
    <label className="pv-check">
      <input type="checkbox" {...inputProps} />
      <span>{label}</span>
    </label>
  );
}

/* Nút bấm. variant: solid | ghost | soft | danger. size: md | sm */
export function Button({ variant = 'solid', size = 'md', icon, loading = false, className = '', children, ...props }) {
  const cls = ['pv-btn', `pv-btn-${variant}`, size === 'sm' && 'pv-btn-sm', className].filter(Boolean).join(' ');
  return (
    <button type="button" {...props} className={cls} disabled={loading || props.disabled}>
      {icon}
      {children}
    </button>
  );
}

/* Nhãn nhỏ. tone: muted | orange | ok | warn | danger | info */
export function Badge({ tone = 'muted', icon, children }) {
  return (
    <span className={`pv-badge pv-badge-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

/* Màn hình trống ("Chưa có đơn hàng", "Ví rỗng"...) */
export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="pv-empty">
      {icon && <span className="pv-empty-ic">{icon}</span>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/* Khung xám nhấp nháy lúc đang tải */
export function Skeleton({ height = 120 }) {
  return <div className="pv-skeleton" style={{ height }} />;
}

/* Hàng nút lọc dạng viên thuốc (dùng cho trạng thái đơn hàng) */
export function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="pv-pills" role="tablist">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={`pv-pill${active === t.id ? ' on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {typeof t.count === 'number' && <em>{t.count}</em>}
        </button>
      ))}
    </div>
  );
}