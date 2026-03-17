const fs = require('fs');
let s = fs.readFileSync('src/app/globals.css', 'utf8');
s = s.replace(/  text-align: center;\r?\n  font-size: 0\.875rem;\r?\n  color: var\(--muted\);\r?\n\}/, '.auth-footer {\n  margin-top: 1.25rem;\n  text-align: center;\n  font-size: 0.875rem;\n  color: var(--muted);\n}');
fs.writeFileSync('src/app/globals.css', s);
