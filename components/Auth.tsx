import React, { useState } from 'react';
import { getSupabase } from '../supabaseClient';
import { Lock, Mail, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Entity } from '../types';

interface AuthProps {
  currentEntity?: Entity | null;
  onChangeEntity?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ currentEntity, onChangeEntity }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabase(); // Garante que temos a instância correta
      
      // Apenas Login é permitido. O cadastro deve ser feito via convite no painel Supabase.
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
            throw new Error('E-mail ou senha incorretos.');
        }
        throw error;
      }
      
    } catch (error: any) {
      setMessage(error.message || 'Ocorreu um erro ao tentar entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 relative">
      
      {/* Entity Banner / Back Button */}
      {currentEntity && onChangeEntity && (
        <div className="absolute top-6 left-6">
           <button 
             onClick={onChangeEntity}
             className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
           >
             <ArrowLeft className="h-4 w-4" />
             Voltar para Seleção
           </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">LicitaPlano</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {currentEntity ? `Acesso Restrito: ${currentEntity.name}` : 'Gestão de Processos Licitatórios'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-black transition-all"
                placeholder="nome@prefeitura.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-black transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <div className="text-sm p-3 rounded bg-red-100 text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acessar Sistema'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-700 pt-4">
          <p className="text-xs text-slate-400">
            Não possui acesso? Entre em contato com o administrador do setor de licitações.
          </p>
        </div>
      </div>
    </div>
  );
};