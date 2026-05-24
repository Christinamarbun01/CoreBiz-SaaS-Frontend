import { createClient } from '@supabase/supabase-js';
import WebSocket from '../CoreBiz-SaaS-Backend/node_modules/ws/index.js';

const supabaseUrl = 'https://fessujdyhofjplyfeybu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3N1amR5aG9manBseWZleWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIzMzE5NywiZXhwIjoyMDkzODA5MTk3fQ.OCbcmdd-60TpRo9kdcGfRkoTyQNnW7-ckvCHCuw7u5U';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

async function test() {
  console.log('--- USERS IN AUTH ---');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    users.forEach(u => console.log(`Auth User: ID=${u.id}, Email=${u.email}, Confirmed=${u.email_confirmed_at}`));
  }

  console.log('\n--- USERS TABLE ---');
  const { data: dbUsers, error: dbUsersError } = await supabase.from('users').select('*');
  if (dbUsersError) {
    console.error('Error fetching users:', dbUsersError);
  } else {
    dbUsers.forEach(u => console.log(`DB User: ID=${u.id}, Email=${u.email}, Name=${u.full_name}`));
  }

  console.log('\n--- TENANTS TABLE ---');
  const { data: dbTenants, error: dbTenantsError } = await supabase.from('tenants').select('*');
  if (dbTenantsError) {
    console.error('Error fetching tenants:', dbTenantsError);
  } else {
    dbTenants.forEach(t => console.log(`Tenant: ID=${t.id}, Name=${t.name}, Owner=${t.owner_name}`));
  }

  console.log('\n--- TENANT USERS TABLE ---');
  const { data: tenantUsers, error: tenantUsersError } = await supabase.from('tenant_users').select('*');
  if (tenantUsersError) {
    console.error('Error fetching tenant users:', tenantUsersError);
  } else {
    tenantUsers.forEach(tu => console.log(`TenantUser: UserID=${tu.user_id}, TenantID=${tu.tenant_id}, Role=${tu.role}, Active=${tu.is_active}`));
  }
}

test();
