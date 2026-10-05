const { execSync } = require('child_process');

const sql = `
SELECT pubname, tablename
FROM pg_publication_tables
WHERE tablename = 'notifications';
`;

require('fs').writeFileSync('get_repl.sql', sql);
try {
  execSync('npx supabase db query -f get_repl.sql --linked', { stdio: 'inherit' });
} catch(err) {
  console.log("Failed");
}
