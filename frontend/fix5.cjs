const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// The missing </>
code = code.replace(
/              <\/div>\s*<\/div>\s*}\)\s*{\/\* TAB 2: ANALYTICS \*\//g,
`              </div>\n            </>\n          </div>\n        )}\n\n        {/* TAB 2: ANALYTICS */}`
);

// The unterminated regular expression near line 426
// This must mean I have an unclosed string or a stray slash in the hero section.
fs.writeFileSync('src/pages/AdminDashboard.jsx', code, 'utf8');
