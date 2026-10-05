const fs = require('fs');
const content = JSON.stringify({
  gateway: "MBBank",
  transactionDate: "2023-11-20 15:15:00",
  accountNumber: "038",
  subAccount: null,
  transferType: "in",
  transferAmount: 55000.0,
  accumulated: 100000.0,
  code: null,
  content: "Thanh toan cho ORD-20260407030134",
  referenceCode: "MB1234777"
});

fetch('https://unscalded-depreciatory-michell.ngrok-free.dev/api/sepay/webhook', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'PetShop_Webhook_d7e4f9b2_8a1c_4c9e_b3a1_1234abcd5678'
    },
    body: content
}).then(r => r.text().then(t => fs.writeFileSync('response.html', t))).catch(console.error);
