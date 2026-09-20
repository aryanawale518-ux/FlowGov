import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GovernmentFile, AuditLog } from '../src/types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qptakshpxktkyfsihxcy.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || 'sb_publishable_euneVJEU1VF50nT_uScLqg_sIMNpdN1';

let supabaseClient: SupabaseClient | null = null;
let tablesAvailable: boolean | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return supabaseClient;
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  projectId: string;
  url: string;
  tablesAvailable: boolean;
  message: string;
}> {
  try {
    const client = getSupabase();
    // Test auth service
    const { error: authError } = await client.auth.getSession();
    if (authError && !authError.message.includes('Auth session missing')) {
      return {
        connected: false,
        projectId: 'qptakshpxktkyfsihxcy',
        url: SUPABASE_URL,
        tablesAvailable: false,
        message: authError.message
      };
    }

    // Test government_files table
    const { error: tableError } = await client
      .from('government_files')
      .select('id')
      .limit(1);

    if (tableError) {
      tablesAvailable = false;
      return {
        connected: true,
        projectId: 'qptakshpxktkyfsihxcy',
        url: SUPABASE_URL,
        tablesAvailable: false,
        message: `Connected to Supabase. Table 'government_files' not yet created in PostgreSQL schema (${tableError.message}).`
      };
    }

    tablesAvailable = true;
    return {
      connected: true,
      projectId: 'qptakshpxktkyfsihxcy',
      url: SUPABASE_URL,
      tablesAvailable: true,
      message: 'Connected to Supabase. PostgreSQL database tables are active and synchronized.'
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      projectId: 'qptakshpxktkyfsihxcy',
      url: SUPABASE_URL,
      tablesAvailable: false,
      message: msg
    };
  }
}

export async function syncFileToSupabase(file: GovernmentFile): Promise<boolean> {
  try {
    const client = getSupabase();
    const payload = {
      id: file.id,
      file_number: file.fileNumber,
      title: file.title,
      description: file.description || '',
      department_id: file.departmentId,
      department_name: file.departmentName,
      workflow_template_id: file.workflowTemplateId,
      workflow_template_name: file.workflowTemplateName,
      status: file.status,
      priority: file.priority,
      sla_status: file.slaStatus,
      created_at: file.createdAt,
      updated_at: file.updatedAt,
      created_by_user_id: file.createdBy,
      created_by_user_name: file.createdByName,
      current_stage_id: file.currentStageId,
      current_stage_name: file.currentStageName,
      loops_count: file.loopsCount || 0,
      total_duration_hours: file.totalDurationHours,
      expected_total_duration_hours: file.expectedTotalDurationHours,
      data: file
    };

    const { error } = await client
      .from('government_files')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncAuditLogToSupabase(log: AuditLog): Promise<boolean> {
  try {
    const client = getSupabase();
    const payload = {
      id: log.id,
      file_id: log.fileId,
      file_number: log.fileNumber,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      action: log.action,
      description: log.description,
      created_at: log.createdAt,
      metadata: log.metadata || {},
      data: log
    };

    const { error } = await client.from('audit_logs').insert(payload);
    return !error;
  } catch {
    return false;
  }
}

