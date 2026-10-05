const fs = require('fs');
fetch('http://localhost:5237/api/orders').then(r=>r.text()).then(t=>fs.writeFileSync('o.json', t)).catch(console.error);
