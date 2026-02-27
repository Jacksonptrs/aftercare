const fs = require('fs');

const signoutRoute = [
  "import { createClient } from '@/lib/supabase/server'",
  "import { redirect } from 'next/navigation'",
  "",
  "export async function POST() {",
  "  const supabase = await createClient()",
  "  await supabase.auth.signOut()",
  "  redirect('/auth/login')",
  "}"
].join('\n');

fs.mkdirSync('src/app/auth/signout', { recursive: true });
fs.writeFileSync('src/app/auth/signout/route.ts', signoutRoute);
console.log('Done!');
console.log('signout route: ' + fs.statSync('src/app/auth/signout/route.ts').size);
