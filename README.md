WEB 3
Overview:  Deposit -> Purchase -> Claim -> Withdraw
Crypto: USDT-BEP20
1. Deposit: mỗi User được tạo 1 balance để nhận số lượng token nạp vào.Ví nạp random từ nhiều ví (5 ) được admin tạo ra trong Database.
2. Purchase: mua gói Invest(*) thanh toán bằng Balance
3. Claim: Countdown đếm ngược 24h User sẽ nhận 1 lần. Công thức tính: 
 ClaimAmount = package * (perday/100)
 MaxClaimable = package * (perday/100) * quarter
4. Withdraw = User rút USDT auto từ WITHDRAW_WALLET_ADDRESS về ví cá nhân thông qua WITHDRAW_WALLET_KEY và trừ vào Balance của User.

*Invest:
- Plan: Tên gói Invest
- Package: giá gói Invest  
- Perday: phần trăm thu nhập mỗi 24h (Ex: 1.2, 1.5.....)
- Quarter: chu kỳ thu nhập gói Invest (Ex:: 30 ngày, 60 ngày,....)
- Image: hình ảnh minh họa
