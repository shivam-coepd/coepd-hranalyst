const { execSync } = require('child_process');

const sql = `
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
`;

require('fs').writeFileSync('enable_repl.sql', sql);
try {
  execSync('npx supabase db query -f enable_repl.sql --linked', { stdio: 'inherit' });
} catch(err) {
  console.log("Failed");
}
