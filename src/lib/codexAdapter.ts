/**
 * Codex adapter
 * Fetches codex snippets from Supabase and returns a combined string
 */

type SupabaseClient = {
  from: (table: string) => any;
};

export const fetchCodex = async (
  supabase: SupabaseClient,
  snippetIds: string[] = ['principles', 'transparency', 'guide_role']
): Promise<string> => {
  const { data, error } = await supabase
    .from('codex_snippets')
    .select('*')
    .in('id', snippetIds);

  if (error) {
    console.error('fetchCodex error:', error);
    return '';
  }

  return (
    data?.map((s: any) => `[${s.title}]: ${s.text}`).join('\n') || ''
  );
};
