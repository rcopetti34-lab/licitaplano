import React, { useState } from 'react';
import { getSupabase } from '../supabaseClient';
import { Lock, Mail, Loader2, ArrowLeft, AlertTriangle, Waypoints } from 'lucide-react';
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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      
      {/* Background Image & Overlay (Consistent with EntitySelector) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop" 
          alt="Office Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Entity Banner / Back Button */}
      {currentEntity && onChangeEntity && (
        <div className="absolute top-6 left-6 z-20">
           <button 
             onClick={onChangeEntity}
             className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10"
           >
             <ArrowLeft className="h-4 w-4" />
             Voltar para Seleção
           </button>
        </div>
      )}

      <div className="relative z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="inline-flex h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl items-center justify-center shadow-lg shadow-blue-600/20">
              <Waypoints className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">LicitaPlano</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {currentEntity ? currentEntity.name : 'Gestão de Processos Licitatórios'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
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
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <div className="text-sm p-3 rounded bg-red-100 text-red-700 flex items-center gap-2 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center transform active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acessar Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-700 pt-6">
          <p className="text-xs text-slate-400">
            Acesso restrito e monitorado. <br/> Para suporte, contate o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};