const fs = require('fs');
let code = fs.readFileSync('src/pages/DriverDashboard.jsx', 'utf8');

code = code.replace('Rating: ?', 'Rating: ⭐');
code = code.replace("{activeDriver.status === 'Verified' ? '? ' : '? '}", "{activeDriver.status === 'Verified' ? '✅ ' : '⚠️ '}");
code = code.replace("{ id: 'home', label: '?? Route Dashboard' }", "{ id: 'home', label: '🗺️ Route Dashboard' }");
code = code.replace("{ id: 'earnings', label: '?? Earnings & Payments' }", "{ id: 'earnings', label: '💰 Earnings & Payments' }");
code = code.replace("{ id: 'history', label: '?? Delivery History' }", "{ id: 'history', label: '📜 Delivery History' }");
code = code.replace("?{activeDriver.earningsToday}", "₹{activeDriver.earningsToday}");
code = code.replace("?1,420", "₹1,420");
code = code.replace("?? Nearby Delivery Requests", "📡 Nearby Delivery Requests");
code = code.replace("Earn ?{Math.round(ord.price * 0.85)}", "Earn ₹{Math.round(ord.price * 0.85)}");
code = code.replace("?? Pickup:", "📍 Pickup:");
code = code.replace("?? Drop:", "🏫 Drop:");
code = code.replace("? Target:", "⏰ Target:");

// Let's also do regex just in case there are multiple spaces or something
code = code.replace(/Rating: \?/g, 'Rating: ⭐');
code = code.replace(/\{\s*id: 'home', label: '\?\? Route Dashboard'\s*\}/g, "{ id: 'home', label: '🗺️ Route Dashboard' }");
code = code.replace(/\{\s*id: 'earnings', label: '\?\? Earnings & Payments'\s*\}/g, "{ id: 'earnings', label: '💰 Earnings & Payments' }");
code = code.replace(/\{\s*id: 'history', label: '\?\? Delivery History'\s*\}/g, "{ id: 'history', label: '📜 Delivery History' }");
code = code.replace(/\?\{activeDriver.earningsToday\}/g, "₹{activeDriver.earningsToday}");
code = code.replace(/\?1,420/g, "₹1,420");
code = code.replace(/\?\? Nearby Delivery Requests/g, "📡 Nearby Delivery Requests");
code = code.replace(/Earn \?\{Math\.round\(ord\.price \* 0\.85\)\}/g, "Earn ₹{Math.round(ord.price * 0.85)}");
code = code.replace(/\?\? Pickup:/g, "📍 Pickup:");
code = code.replace(/\?\? Drop:/g, "🏫 Drop:");
code = code.replace(/\? Target:/g, "⏰ Target:");
code = code.replace(/\{activeDriver\.status === 'Verified' \? '\? ' : '\? '\}/g, "{activeDriver.status === 'Verified' ? '✅ ' : '⚠️ '}");


fs.writeFileSync('src/pages/DriverDashboard.jsx', code, 'utf8');
