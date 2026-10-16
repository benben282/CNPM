import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const PaymentQRCode = ({
  orderId,
  amount = 0,
  bankCode = "vietcombank",
  accountName = "PetShop",
  accountNumber = "123456789",
  onSuccess
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Dùng ref để tránh onSuccess thay đổi reference gây re-trigger effect
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

  const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${amount}&des=${orderId}&template=compact`;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleCopyMemo = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Lỗi sao chép: ', err);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    let isCancelled = false;

    // Polling mỗi 5 giây — chỉ chạy 1 lần khi orderId thay đổi
    const intervalId = setInterval(async () => {
      if (isCancelled) return;
      try {
        // Thêm ?t=... để vô hiệu hóa cache của trình duyệt khi GET lặp đi lặp lại
        const res = await api.get(`/orders/${orderId}?t=${new Date().getTime()}`);
        if (isCancelled) return;

        if (res.data && res.data.paymentStatus === 'Paid') {
          clearInterval(intervalId);
          setPaymentStatus('success');
          // Đợi 1.5s để hiện tick xanh, rồi mới chuyển trang
          setTimeout(() => {
            if (!isCancelled && onSuccessRef.current) {
              onSuccessRef.current();
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra thanh toán: ', err);
      }
    }, 5000);

    // Cleanup: huỷ interval và đánh dấu cancelled khi unmount
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [orderId]); // ← Chỉ depend vào orderId, không depend vào paymentStatus hay onSuccess

  const LoaderIcon = () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  );

  const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const CopyIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  );

  const InfoIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="w-full mt-4 bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 mb-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Thanh toán qua QR Code</h3>
        <p className="text-gray-500 text-sm mt-1">Mở app Ngân hàng hoặc Ví nhận diện quét mã</p>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

        {/* QR column */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <div className="relative group p-4 bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-[28px] shadow-[0_8px_30px_rgb(249,115,22,0.12)] transition-all hover:shadow-[0_8px_30px_rgb(249,115,22,0.25)] hover:-translate-y-1 duration-300">

            {/* Tùy biến 4 góc viền bo kiểu Scanner */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-[28px] opacity-70"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-[28px] opacity-70"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-[28px] opacity-70"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-[28px] opacity-70"></div>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 relative z-10">
              <img
                src={qrUrl}
                alt="QR Code Thanh Toán"
                className="w-full h-auto rounded-xl"
                style={{ width: '190px', minHeight: '190px', objectFit: 'contain' }}
              />
            </div>

            {/* Logo/Icon overlay in the center of QR */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-white p-1 rounded-full shadow-lg border-2 border-orange-400">
                <span className="text-xl leading-none">🐾</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 px-6 py-2 bg-orange-50 rounded-full border border-orange-100 text-orange-600 font-semibold text-sm shadow-sm transition-all">
            {paymentStatus === 'pending' ? (
              <>
                <LoaderIcon />
                <span className="tracking-wide">ĐANG CHỜ THANH TOÁN...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-600 tracking-wide">THANH TOÁN THÀNH CÔNG!</span>
              </>
            )}
          </div>
        </div>

        {/* Info column */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
              <span className="text-gray-500 text-sm">Ngân hàng</span>
              <span className="font-semibold text-gray-800 uppercase">{bankCode}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
              <span className="text-gray-500 text-sm">Chủ tài khoản</span>
              <span className="font-semibold text-gray-800">{accountName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
              <span className="text-gray-500 text-sm">Số tài khoản</span>
              <span className="font-semibold tracking-wider text-lg text-gray-800">{accountNumber}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500 text-sm">Số tiền</span>
              <span className="font-bold text-xl text-orange-600">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <span className="block text-sm text-orange-800 mb-2 font-medium">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-orange-200 text-gray-800 font-bold tracking-widest px-3 py-2 rounded-md text-center">
                {orderId}
              </div>
              <button
                type="button"
                onClick={handleCopyMemo}
                className={`flex items-center justify-center p-2.5 rounded-md transition-all duration-200 ${isCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30'
                  }`}
                title="Sao chép nội dung"
              >
                {isCopied ? <CheckCircleIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 text-left rounded-lg border border-amber-100">
            <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p><strong>Lưu ý:</strong> Vui lòng sao chép chính xác <span className="font-semibold underline">Nội dung chuyển khoản</span> để hệ thống duyệt đơn tự động.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentQRCode;
