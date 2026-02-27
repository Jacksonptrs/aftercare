const fs = require('fs');

const signoutRoute = [
  "import { createClient } from '@/lib/supabase/server'",
  "import { NextResponse } from 'next/server'",
  "",
  "export async function POST() {",
  "  const supabase = await createClient()",
  "  await supabase.auth.signOut()",
  "  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))",
  "}"
].join('\n');

fs.mkdirSync('src/app/auth/signout', { recursive: true });
fs.writeFileSync('src/app/auth/signout/route.ts', signoutRoute);
console.log('Done!');
console.log('signout route: ' + fs.statSync('src/app/auth/signout/route.ts').size);
