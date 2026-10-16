import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ProductGallery.css';

const PLACEHOLDER = 'https://placehold.co/600x600?text=No+Image';

/**
 * Gallery ảnh sản phẩm: trượt ngang như Banner, có nút prev/next,
 * vuốt trên điện thoại, và dải ảnh nhỏ bên dưới.
 * Props: images = ['url1', 'url2', ...], alt = tên sản phẩm
 */
export default function ProductGallery({ images = [], alt = '' }) {
  const list = images.length > 0 ? images : [PLACEHOLDER];
  const [current, setCurrent] = useState(0);
  const [broken, setBroken] = useState({});
  const touchStartX = useRef(null);
  const thumbRefs = useRef([]);

  // Đổi sản phẩm => về ảnh đầu tiên
  useEffect(() => {
    setCurrent(0);
    setBroken({});
  }, [images.join('|')]);

  // Giữ thumbnail đang chọn luôn nằm trong vùng nhìn thấy
  useEffect(() => {
    thumbRefs.current[current]?.scrollIntoView({
      behavior: 'smooth', block: 'nearest', inline: 'center'
    });
  }, [current]);

  const prev = () => setCurrent(i => (i - 1 + list.length) % list.length);
  const next = () => setCurrent(i => (i + 1) % list.length);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  const src = (url, i) => (broken[i] ? PLACEHOLDER : url);
  const multiple = list.length > 1;

  return (
    <div className="pg" tabIndex={0} onKeyDown={onKeyDown} aria-label="Ảnh sản phẩm">
      <div className="pg-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="pg-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {list.map((url, i) => (
            <div className="pg-slide" key={i}>
              <img
                src={src(url, i)}
                alt={`${alt} - ảnh ${i + 1}`}
                onError={() => setBroken(b => ({ ...b, [i]: true }))}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {multiple && (
          <>
            <button className="pg-arrow pg-arrow-left" onClick={prev} aria-label="Ảnh trước">
              <FaChevronLeft />
            </button>
            <button className="pg-arrow pg-arrow-right" onClick={next} aria-label="Ảnh sau">
              <FaChevronRight />
            </button>
            <span className="pg-counter">{current + 1} / {list.length}</span>
          </>
        )}
      </div>

      {multiple && (
        <div className="pg-thumbs">
          {list.map((url, i) => (
            <button
              key={i}
              ref={el => (thumbRefs.current[i] = el)}
              className={`pg-thumb ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Xem ảnh ${i + 1}`}
            >
              <img src={src(url, i)} alt="" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
