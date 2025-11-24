import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Process } from '../types';
import { formatDate } from './helpers';

const HEADERS = [
  'ID', 'Anterior', 'Venc. Ant.', 'PCA', 'Status', 'Start', 'Prioridade', 'Mod.', 
  'Objeto', 'Resp.', 'Prorrog.', 'Início Plan.', 'Fim Plan.', 'Remessa', 'Gestores'
];

const mapProcessToRow = (p: Process) => [
  p.id?.slice(0,4),
  p.processo_anterior,
  formatDate(p.vencimento_anterior),
  p.previsao_pca === 'previsto no PCA' ? 'Sim' : 'Não',
  p.status,
  p.previsao_start,
  p.prioridade,
  p.modalidade,
  p.objeto,
  p.responsavel_demanda,
  p.prorrogavel,
  formatDate(p.inicio_efetivo_planejamento),
  formatDate(p.termino_efetivo_planejamento),
  formatDate(p.data_remessa_compras),
  p.fiscais_gestores
];

export const exportToPDF = (processes: Process[]) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  
  doc.setFontSize(18);
  doc.text("Relatório de Planejamento de Licitações", 14, 22);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [HEADERS],
    body: processes.map(mapProcessToRow),
    styles: { fontSize: 6, overflow: 'linebreak' },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save('relatorio-licitaplano.pdf');
};

export const exportToExcel = (processes: Process[]) => {
  const worksheet = XLSX.utils.json_to_sheet(processes.map(p => ({
    ...p,
    criado_em: formatDate(p.created_at)
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Processos");
  
  XLSX.writeFile(workbook, "licitaplano-export.xlsx");
};