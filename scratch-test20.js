const { execSync } = require('child_process');

const sql = `
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'notification_outbox';
`;

require('fs').writeFileSync('get_schema.sql', sql);
try {
  execSync('npx supabase db query -f get_schema.sql --linked', { stdio: 'inherit' });
} catch(err) {
  console.log("Failed");
}
