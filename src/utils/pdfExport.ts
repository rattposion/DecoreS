import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    // Configurações do PDF
    const scale = 2; // Aumenta a qualidade
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Captura o elemento como imagem
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    // Converte o canvas para imagem
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Calcula as dimensões mantendo a proporção
    const imgWidth = canvas.width / scale;
    const imgHeight = canvas.height / scale;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    // Adiciona a imagem ao PDF
    pdf.addImage(
      imgData,
      'JPEG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio,
      undefined,
      'FAST'
    );

    // Salva o PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  }
}; 