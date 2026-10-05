import React, { useState } from 'react';
import { FaPaw, FaCheckCircle, FaImage } from 'react-icons/fa';

export default function ProductReviewsSection({ reviews = [], hasPurchasedAndReceived }) {
  const [filter, setFilter] = useState('all'); // all, 5star, hasImage
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Tính toán rating trung bình
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Tính % progress bar
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++; });

  const getPercent = (count) => reviews.length > 0 ? (count / reviews.length) * 100 : 0;

  // Render Paw rating thay cho Star
  const renderPaws = (score, size = 16, interactive = false) => {
    return (
      <div className="flex gap-1" onMouseLeave={() => interactive && setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = interactive ? star <= (hoverRating || rating) : star <= score;
          return (
            <FaPaw
              key={star}
              size={size}
              className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-110' : ''} ${isFilled ? 'text-orange-500' : 'text-gray-300'}`}
              onClick={() => interactive && setRating(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
            />
          );
        })}
      </div>
    );
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === '5star') return r.rating === 5;
    if (filter === 'hasImage') return r.images && r.images.length > 0;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 md:p-16 mt-24 mb-24">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-10 border-b-2 border-orange-100 pb-4 inline-block">Đánh giá từ khách hàng</h2>

      {/* Overview Block */}
      <div className="flex flex-col md:flex-row gap-10 mb-12">
        <div className="flex flex-col items-center justify-center p-8 md:p-10 bg-orange-50 rounded-3xl md:w-1/3 border border-orange-100 shadow-inner">
          <span className="text-5xl font-black text-orange-600 mb-2">{avgRating}/5</span>
          {renderPaws(Math.round(avgRating), 24)}
          <span className="text-sm text-gray-500 mt-2 font-medium">{reviews.length} đánh giá</span>
        </div>

        <div className="flex-1 flex flex-col gap-3 justify-center">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-600 w-12 flex gap-1 items-center">{star} <FaPaw size={12} className="text-orange-500" /></span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${getPercent(ratingCounts[star])}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-gray-500 w-8">{ratingCounts[star]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form Area (Tuỳ thuộc vào DB SQL truyền xuống) */}
      <div className="mb-12 bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 transition-all">
        {hasPurchasedAndReceived ? (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span> Bạn đã trải nghiệm sản phẩm này? Hãy chia sẻ cảm nhận nhé!
            </h3>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <span className="font-semibold text-gray-700">Chất lượng sản phẩm:</span>
                {renderPaws(rating, 28, true)}
                <span className="text-sm text-orange-600 font-bold ml-2">
                  {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm được' : rating === 1 ? 'Quá tệ' : ''}
                </span>
              </div>

              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[120px] resize-none text-gray-700"
                placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với những khách hàng khác nhé..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              ></textarea>

              <div className="flex justify-between items-center mt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200 text-sm">
                  <FaImage size={16} /> Thêm hình ảnh
                </button>
                <button
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md transform ${rating > 0 && reviewText.trim() ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:-translate-y-1 hover:shadow-orange-500/30' : 'bg-gray-300 cursor-not-allowed hidden md:block'}`}
                  disabled={!rating || !reviewText.trim()}
                >
                  Gửi Đánh Giá
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-block p-4 bg-gray-200 rounded-full mb-3 text-gray-400 shadow-inner">
              <FaPaw size={24} />
            </div>
            <p className="text-gray-500 font-medium italic">"Chỉ những khách hàng đã mua và nhận sản phẩm này mới có thể viết đánh giá."</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: '5star', label: '5 Dấu chân' },
          { id: 'hasImage', label: 'Có hình ảnh' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all border outline-none ${filter === f.id
              ? 'bg-orange-100 text-orange-600 border-orange-200 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Review List */}
      <div className="flex flex-col bg-white">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 uppercase text-sm font-black tracking-wider border-2 border-dashed border-gray-100 rounded-2xl">Chưa có đánh giá nào thỏa mãn</div>
        ) : (
          filteredReviews.map((review, idx) => (
            <div key={idx} className="flex gap-10 border-b border-gray-100 py-16 first:pt-8 last:border-0 last:pb-0 animate-fade-in">
              <img src={review.avatar || 'https://placehold.co/100x100'} alt={review.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
              <div className="flex-1">
                <div className="flex items-center gap-5 mb-2">
                  <span className="font-extrabold text-gray-800">{review.name}</span>
                  {review.isVerified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-green-100">
                      <FaCheckCircle size={10} /> Đã mua hàng
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  {renderPaws(review.rating, 14)}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{review.content}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-4 mt-4 flex-wrap">
                    {review.images.map((img, i) => (
                      <img key={i} src={img} alt="Review" className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-3 font-medium">{review.date}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
