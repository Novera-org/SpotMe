const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// The .dark class and @media prefers-color-scheme: dark blocks are overriding the twilight theme!
// We will simply remove them to force the unified :root theme.

// Remove @media (prefers-color-scheme: dark) block
css = css.replace(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\}\n\}/, '');

// Remove .dark block
css = css.replace(/\.dark \{[\s\S]*?\}\n/g, '');

fs.writeFileSync('src/app/globals.css', css);

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
layout = layout.replace('<html lang="en" className="dark">', '<html lang="en">');
fs.writeFileSync('src/app/layout.tsx', layout);
