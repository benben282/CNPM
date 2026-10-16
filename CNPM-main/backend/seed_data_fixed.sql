USE QL_thucanchomeo;
GO

-- Xóa dữ liệu cũ (nếu có) để tránh trùng lặp khi chạy lại script
DELETE FROM OrderItems;
DELETE FROM Orders;
DELETE FROM CartItems;
DELETE FROM Carts;
DELETE FROM Products;
DELETE FROM Categories;
GO

-- Đặt lại Identity về 1
DBCC CHECKIDENT ('Products', RESEED, 0);
DBCC CHECKIDENT ('Categories', RESEED, 0);
GO

-- 1. Thêm danh mục (Categories)
INSERT INTO Categories (Name, Description) VALUES 
(N'Thức ăn cho Chó', N'Các loại hạt, pate và xương gặm cho cún cưng'),
(N'Thức ăn cho Mèo', N'Hạt, pate và súp thưởng dinh dưỡng cho mèo'),
(N'Chăm sóc & Vệ sinh', N'Sữa tắm, nước hoa, lược chải lông và cát vệ sinh'),
(N'Phụ kiện & Đồ chơi', N'Chuồng xích, đồ chơi và phụ kiện huấn luyện');
GO

-- Lấy ID của các danh mục vừa tạo
DECLARE @CatCho INT = (SELECT Id FROM Categories WHERE Name = N'Thức ăn cho Chó');
DECLARE @CatMeo INT = (SELECT Id FROM Categories WHERE Name = N'Thức ăn cho Mèo');
DECLARE @CatPhuKien INT = (SELECT Id FROM Categories WHERE Name = N'Phụ kiện & Đồ chơi');
DECLARE @CatVeSinh INT = (SELECT Id FROM Categories WHERE Name = N'Chăm sóc & Vệ sinh');

-- 2. Thêm đồ ăn cho Chó
INSERT INTO Products (Name, Description, Price, OriginalPrice, ImageUrl, Stock, CategoryId, IsActive, CreatedAt, UpdatedAt) VALUES 
(N'Hạt thức ăn Royal Canin Mini Adult 2kg', N'Thức ăn hạt dinh dưỡng cao cấp dành cho chó cỡ nhỏ (Mini) từ 10 tháng đến 8 tuổi', 450000, 520000, N'/images/royal_canin_mini.png', 50, @CatCho, 1, GETDATE(), GETDATE()),
(N'Hạt mềm Zenith vị thịt cừu và khoai tây 1.2kg', N'Thức ăn hạt mềm cao cấp Hàn Quốc, dễ tiêu hóa, tốt cho đường ruột', 280000, 310000, N'/images/hat_zenith_soft.png', 30, @CatCho, 1, GETDATE(), GETDATE()),
(N'Pate Pedigree vị gan nướng và rau củ 130g', N'Pate dinh dưỡng thơm ngon vị gan nướng, bổ sung vitamin và khoáng chất', 25000, NULL, N'/images/pate_pedigree_gan_bo.png', 100, @CatCho, 1, GETDATE(), GETDATE()),
(N'Xương gặm sạch răng Pedigree Dentastix', N'Xương gặm giúp làm sạch mảng bám, giảm cao răng cho chó', 55000, 65000, N'/images/xuong_gam_pedigree.png', 80, @CatCho, 1, GETDATE(), GETDATE());

-- 3. Thêm đồ ăn cho Mèo
INSERT INTO Products (Name, Description, Price, OriginalPrice, ImageUrl, Stock, CategoryId, IsActive, CreatedAt, UpdatedAt) VALUES 
(N'Hạt Whiskas vị cá ngừ 1.2kg', N'Thức ăn hạt cho mèo lớn với hương vị cá ngừ đại dương hấp dẫn', 135000, 150000, N'/images/hat_whiskas_ca_ngu.png', 60, @CatMeo, 1, GETDATE(), GETDATE()),
(N'Pate Sheba lon vị cá hồi hoàng gia 85g', N'Pate cao cấp cho mèo với thịt cá hồi thật, kích thích vị giác', 35000, NULL, N'/images/pate_sheba_ca_hoi.png', 150, @CatMeo, 1, GETDATE(), GETDATE()),
(N'Súp thưởng Wanpy nắp vặn 90g', N'Súp dinh dưỡng bổ tự nước và dạng sệt dễ tiêu hóa cho mèo', 20000, 25000, N'/images/sup_wanpy.png', 200, @CatMeo, 1, GETDATE(), GETDATE());

-- 4. Thêm phụ kiện
INSERT INTO Products (Name, Description, Price, OriginalPrice, ImageUrl, Stock, CategoryId, IsActive, CreatedAt, UpdatedAt) VALUES 
(N'Vòng cổ dây chuông họa tiết dễ thương', N'Vòng cổ có khóa bấm an toàn, kèm chuông nhỏ âm thanh vui tai', 30000, NULL, N'/images/vong_co_chuong.png', 100, @CatPhuKien, 1, GETDATE(), GETDATE()),
(N'Cần câu mèo mồi lông vũ', N'Đồ chơi tương tác giúp mèo vận động, kích thích bản năng săn mồi', 25000, NULL, N'/images/can_cau_meo.png', 120, @CatPhuKien, 1, GETDATE(), GETDATE()),
(N'Trụ cào móng bọc thảm sisal', N'Trụ cào móng giúp bảo vệ đồ nội thất, cho mèo mài móng thoải mái', 150000, 180000, N'/images/tru_cao_mong.png', 40, @CatPhuKien, 1, GETDATE(), GETDATE());

-- 5. Thêm đồ vệ sinh & chăm sóc
INSERT INTO Products (Name, Description, Price, OriginalPrice, ImageUrl, Stock, CategoryId, IsActive, CreatedAt, UpdatedAt) VALUES 
(N'Cát đậu nành Tofu hữu cơ khử mùi tốt 6L', N'Cát vệ sinh tự nhiên, an toàn, có thể xả trực tiếp vào bồn cầu', 110000, 130000, N'/images/cat_dau_nanh_tofu.png', 50, @CatVeSinh, 1, GETDATE(), GETDATE()),
(N'Sữa tắm định hình lông SOS 530ml', N'Dầu gội sữa tắm SOS nhiều loại dành riêng cho từng màu lông', 125000, 145000, N'/images/sua_tam_sos.png', 60, @CatVeSinh, 1, GETDATE(), GETDATE()),
(N'Nước hoa Forcans Baby Powder 300ml', N'Nước hoa khử mùi cho chó mèo với hương phấn em bé dịu nhẹ', 180000, 210000, N'/images/nuoc_hoa_forcans.png', 30, @CatVeSinh, 1, GETDATE(), GETDATE()),
(N'Lược chải lông rụng tự làm sạch nút bấm', N'Lược gỡ rối và chải lông rụng, có nút bấm đẩy lông ra dễ dàng', 85000, 100000, N'/images/luoc_chai_long.png', 70, @CatVeSinh, 1, GETDATE(), GETDATE());
GO

SELECT Id, Name FROM Categories ORDER BY Id;   -- phải ra Id 1,2,3,4
SELECT Id, Name, CategoryId, Price FROM Products ORDER BY Id;

INSERT INTO ProductVariants (ProductId, Name, Price, OriginalPrice, Stock) VALUES
-- 1: Royal Canin Mini Adult
(1, N'800g', 190000, 220000, 30),
(1, N'2kg',  450000, 520000, 50),
(1, N'4kg',  850000, 980000, 20),
-- 2: Zenith thịt cừu và khoai tây
(2, N'1.2kg', 280000, 310000, 30),
(2, N'2.5kg', 520000, 580000, 15),
-- 5: Whiskas vị cá ngừ
(5, N'1.2kg', 135000, 150000, 30),
(5, N'2kg',   210000, 230000, 20),
(5, N'3kg',   295000, 330000, 10),
-- 11: Cát đậu nành Tofu
(11, N'6L',  110000, 130000, 30),
(11, N'18L', 290000, 340000, 20);
GO

-- Đồng bộ giá chính của sản phẩm = giá loại nhỏ nhất, và bỏ chữ kích cỡ khỏi tên
UPDATE Products SET Name = N'Hạt thức ăn Royal Canin Mini Adult', Price = 190000, OriginalPrice = 220000 WHERE Id = 1;
UPDATE Products SET Name = N'Hạt mềm Zenith vị thịt cừu và khoai tây' WHERE Id = 2;
UPDATE Products SET Name = N'Hạt Whiskas vị cá ngừ' WHERE Id = 5;
UPDATE Products SET Name = N'Cát đậu nành Tofu hữu cơ khử mùi tốt' WHERE Id = 11;
GO

PRINT '====== SEED DATA SUCCESSFUL ======'
GO

INSERT INTO ProductVariants (ProductId, Name, Price, OriginalPrice, Stock) VALUES
(5, N'1.2kg', 135000, 150000, 30),
(5, N'2kg',    210000, 230000, 20),
(5, N'3kg',    295000, 330000, 10);

INSERT INTO ProductImages (ProductId, Url, SortOrder) VALUES
(5, N'/images/hat_whiskas_ca_ngu.png',   0),
(5, N'/images/hat_whiskas_ca_ngu_2.png', 1),
(5, N'/images/hat_whiskas_ca_ngu_3.png', 2),
(1, N'/images/royal_canin_mini.png',     0),
(1, N'/images/royal_canin_mini_2.png',   1);
(1, N'/images/royal_canin_mini_3.png',   2);
GO

SELECT name FROM sys.tables WHERE name LIKE 'Product%';
SELECT Id, ProductId, Name FROM ProductVariants ORDER BY ProductId, Name, Id;

DELETE FROM ProductVariants
WHERE Id NOT IN (
    SELECT MIN(Id) FROM ProductVariants GROUP BY ProductId, Name
);
