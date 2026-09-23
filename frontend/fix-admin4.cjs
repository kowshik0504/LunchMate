const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(
`              </div>
            </div>
          )}

        {/* TAB 2: ANALYTICS */}`,
`              </div>
              </>
            </div>
          )}

        {/* TAB 2: ANALYTICS */}`
);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code, 'utf8');
console.log('Fixed');
