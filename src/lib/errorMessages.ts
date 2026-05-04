/**
 * Traduz mensagens de erro do Supabase/PostgreSQL para português amigável.
 * Mensagens não reconhecidas passam por um fallback genérico.
 */

const ERROR_MAP: Record<string, string> = {
  // Auth
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Email ainda não confirmado. Verifique sua caixa de entrada',
  'User already registered': 'Este email já está cadastrado',
  'Signup requires a valid password': 'A senha é obrigatória',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'New password should be different from the old password':
    'A nova senha deve ser diferente da anterior',
  'Auth session missing!': 'Sessão expirada. Faça login novamente',
  'JWT expired': 'Sessão expirada. Faça login novamente',
  'Invalid Refresh Token: Refresh Token Not Found': 'Sessão expirada. Faça login novamente',
  'For security purposes, you can only request this after':
    'Muitas tentativas. Aguarde um momento antes de tentar novamente',

  // Database / RLS
  'new row violates row-level security policy': 'Você não tem permissão para realizar esta ação',
  'duplicate key value violates unique constraint "user_categories_user_id_name_key"':
    'Já existe uma categoria com esse nome',
  'duplicate key value violates unique constraint': 'Este registro já existe',
  'violates foreign key constraint': 'Este item está vinculado a outros registros',
  'null value in column': 'Preencha todos os campos obrigatórios',

  // Network
  'Failed to fetch': 'Sem conexão com o servidor. Verifique sua internet',
  'Network request failed': 'Sem conexão com o servidor. Verifique sua internet',
  'TypeError: Network request failed': 'Sem conexão com o servidor. Verifique sua internet',

  // Storage
  'The resource already exists': 'Este arquivo já existe',
  'Bucket not found': 'Erro ao acessar armazenamento',
  'Object not found': 'Arquivo não encontrado',
};

/**
 * Retorna uma mensagem amigável em português para o erro.
 * Tenta match exato primeiro, depois partial match nas chaves.
 */
export function friendlyError(error: unknown, fallback?: string): string {
  const raw = extractMessage(error);

  // Exact match
  if (ERROR_MAP[raw]) return ERROR_MAP[raw];

  // Partial match (DB errors geralmente incluem detalhes extras)
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) return value;
  }

  return fallback ?? 'Algo deu errado. Tente novamente';
}

function extractMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}
