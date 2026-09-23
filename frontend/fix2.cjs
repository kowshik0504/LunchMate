const fs = require('fs');
const files = [
  'src/pages/AdminDashboard.jsx',
  'src/pages/ParentDashboard.jsx',
  'src/pages/DriverDashboard.jsx',
  'src/components/Navbar.jsx'
];

for (let file of files) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/â€¢/g, '•');
  c = c.replace(/ðŸ”’/g, '🔒');
  c = c.replace(/â­/g, '⭐');
  c = c.replace(/âœ…/g, '✅');
  c = c.replace(/âš/g, '⚠️');
  c = c.replace(/â‚¹/g, '₹');
  fs.writeFileSync(file, c, 'utf8');
}
console.log('Fixed');
