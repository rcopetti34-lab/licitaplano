export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
};

export const formatMonthYear = (value: string): string => {
  if (!value) return '-';
  const [year, month] = value.split('-');
  if (!year || !month) return value;
  return `${month}/${year}`;
};

export const calculateElapsedDays = (startStr: string, endStr: string | null | undefined): { total: number; business: number } => {
  if (!startStr) return { total: 0, business: 0 };

  // Helper para converter string YYYY-MM-DD para data local (evita problemas de UTC)
  const parseLocalDate = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const start = parseLocalDate(startStr);
  
  if (isNaN(start.getTime())) return { total: 0, business: 0 };

  let end: Date;
  // Se existir data final e não for string vazia, usa ela
  if (endStr && endStr.trim() !== '') {
    end = parseLocalDate(endStr);
  } else {
    // Se não tiver data final, considera HOJE
    const today = new Date();
    // Normaliza para meia-noite para cálculo de dias inteiros
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  // Se a data de início for no futuro em relação ao fim/hoje, retorna 0
  if (end < start) return { total: 0, business: 0 };

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let businessDays = 0;
  const curDate = new Date(start);
  
  // Loop dia a dia
  while (curDate < end) {
    const dayOfWeek = curDate.getDay();
    // 0 = Domingo, 6 = Sábado
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
      businessDays++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }

  return { total: totalDays, business: businessDays };
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'aguardando início': return 'bg-gray-200 text-gray-800 border-gray-400';
    case 'em elaboração': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'finalizado': return 'bg-green-100 text-green-800 border-green-300';
    case 'prorrogado': return 'bg-purple-100 text-purple-800 border-purple-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgente': return 'text-red-600 font-bold';
    case 'alta': return 'text-orange-500 font-semibold';
    default: return 'text-gray-600';
  }
};

export const getConsistentColor = (text: string): string => {
  if (!text) return 'text-slate-600';
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Colors tailored for light/dark mode readability
  const colors = [
    'text-blue-600 dark:text-blue-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-violet-600 dark:text-violet-400',
    'text-fuchsia-600 dark:text-fuchsia-400',
    'text-pink-600 dark:text-pink-400',
    'text-indigo-600 dark:text-indigo-400',
    'text-cyan-600 dark:text-cyan-400',
    'text-amber-600 dark:text-amber-400',
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};