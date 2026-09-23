const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(/â€¢/g, '•');
code = code.replace(/ðŸ”’/g, '🔒');
code = code.replace(/â­/g, '⭐');
code = code.replace(/âœ…/g, '✅');
code = code.replace(/âš/g, '⚠️');
code = code.replace(/â‚¹/g, '₹');
code = code.replace(/ï¿½/g, '•');
code = code.replace(//g, '•');

fs.writeFileSync('src/pages/AdminDashboard.jsx', code, 'utf8');

// Do the same for ParentDashboard and DriverDashboard just in case
function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/â€¢/g, '•');
  c = c.replace(/ðŸ”’/g, '🔒');
  c = c.replace(/â­/g, '⭐');
  c = c.replace(/âœ…/g, '✅');
  c = c.replace(/âš/g, '⚠️');
  c = c.replace(/â‚¹/g, '₹');
  c = c.replace(/ï¿½/g, '•');
  c = c.replace(//g, '•');
  fs.writeFileSync(file, c, 'utf8');
}
fixFile('src/pages/ParentDashboard.jsx');
fixFile('src/pages/DriverDashboard.jsx');
fixFile('src/components/Navbar.jsx');

console.log('Fixed');
