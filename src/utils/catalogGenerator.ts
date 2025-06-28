import { jsPDF } from 'jspdf';
import { Plant } from '../types';

const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Se uma palavra é muito longa, quebra ela
        lines.push(word);
      }
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

export const generateCatalog = (plants: Plant[], classification: string = 'all', logo?: string): Blob => {
  const pdf = new jsPDF();
  
  // Capa
  pdf.setFillColor(32, 106, 79);
  pdf.rect(0, 0, 210, 297, 'F');
  
  // Logo na capa
  if (logo) {
    try {
      pdf.addImage(logo, 'PNG', 70, 50, 70, 40, undefined, 'FAST');
    } catch (error) {
      console.error('Erro ao adicionar logo na capa:', error);
    }
  }
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(36);
  pdf.setFont(undefined, 'bold');
  
  // Título da capa com quebra de linha
  const titleLines = wrapText('Catálogo de', 20);
  let titleY = logo ? 120 : 100;
  titleLines.forEach(line => {
    pdf.text(line, 105, titleY, { align: 'center' });
    titleY += 20;
  });
  
  const subtitleLines = wrapText(classification === 'all' ? 'Plantas Medicinais' : `Plantas ${classification}s`, 20);
  subtitleLines.forEach(line => {
    pdf.text(line, 105, titleY, { align: 'center' });
    titleY += 20;
  });
  
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 105, titleY + 20, { align: 'center' });
  
  // Ordenar plantas alfabeticamente
  const sortedPlants = [...plants].sort((a, b) => 
    a.nomePopular.localeCompare(b.nomePopular, 'pt-BR')
  );
  
  let currentPage = 1;
  
  // Função para adicionar cabeçalho da página
  const addHeader = () => {
    pdf.setFillColor(32, 106, 79);
    pdf.rect(0, 0, 210, 20, 'F');
    
    if (logo) {
      try {
        pdf.addImage(logo, 'PNG', 10, 2, 25, 15, undefined, 'FAST');
      } catch (error) {
        console.error('Erro ao adicionar logo no cabeçalho:', error);
      }
    }
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(255, 255, 255);
    
    // Título do cabeçalho com quebra de linha
    const headerTitle = classification === 'all' ? 'Catálogo de Plantas Medicinais' : `Catálogo de Plantas ${classification}s`;
    const headerLines = wrapText(headerTitle, 35);
    let headerY = 8;
    headerLines.forEach((line, index) => {
      pdf.text(line, logo ? 40 : 20, headerY + (index * 6));
    });
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Página ${currentPage}`, 180, 13);
    
    return 30;
  };
  
  // Sumário
  pdf.addPage();
  currentPage++;
  let y = addHeader();
  
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(32, 106, 79);
  pdf.text('Sumário', 105, y, { align: 'center' });
  y += 20;
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(60, 60, 60);
  
  sortedPlants.forEach((plant, index) => {
    if (y > 270) {
      pdf.addPage();
      currentPage++;
      y = addHeader();
    }
    
    // Nome popular com quebra de linha no sumário
    const plantNameLines = wrapText(`${index + 1}. ${plant.nomePopular}`, 50);
    plantNameLines.forEach((line, lineIndex) => {
      if (y > 270) {
        pdf.addPage();
        currentPage++;
        y = addHeader();
      }
      pdf.text(line, 30, y);
      if (lineIndex < plantNameLines.length - 1) {
        y += 6;
      }
    });
    
    // Nome científico em itálico com quebra de linha
    pdf.setFont(undefined, 'italic');
    const scientificLines = wrapText(`(${plant.nomeCientifico})`, 40);
    let scientificY = y - ((plantNameLines.length - 1) * 6);
    scientificLines.forEach((line, lineIndex) => {
      if (scientificY > 270) {
        pdf.addPage();
        currentPage++;
        scientificY = addHeader();
      }
      pdf.text(line, 140, scientificY + (lineIndex * 6));
    });
    pdf.setFont(undefined, 'normal');
    
    y += Math.max(6, scientificLines.length * 6);
  });
  
  // Conteúdo das plantas
  sortedPlants.forEach((plant, index) => {
    pdf.addPage();
    currentPage++;
    y = addHeader();
    
    // Título da planta com fundo verde claro
    const titleHeight = Math.max(50, (wrapText(`${index + 1}. ${plant.nomePopular}`, 45).length + wrapText(plant.nomeCientifico, 50).length) * 8 + 20);
    pdf.setFillColor(220, 240, 230);
    pdf.rect(20, y - 5, 170, titleHeight, 'F');
    
    // Número e nome popular com quebra de linha
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(32, 106, 79);
    const nameLines = wrapText(`${index + 1}. ${plant.nomePopular}`, 45);
    let nameY = y + 5;
    nameLines.forEach((line) => {
      pdf.text(line, 25, nameY);
      nameY += 8;
    });
    
    // Nome científico em itálico com quebra de linha
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'italic');
    pdf.setTextColor(80, 80, 80);
    const scientificLines = wrapText(plant.nomeCientifico, 50);
    scientificLines.forEach((line) => {
      pdf.text(line, 25, nameY);
      nameY += 6;
    });
    
    y = nameY + 10;
    
    // Grid de informações principais com quebra de linha
    const infoGrid = [
      { label: 'Família:', value: plant.familia },
      { label: 'Espécie:', value: plant.especie, italic: true },
      { label: 'Canteiro:', value: plant.numeroCanteiro },
      { label: 'Classificação:', value: plant.classificacao },
      { label: 'Princípio Ativo:', value: plant.principioAtivo }
    ];
    
    // Calcular altura necessária para o grid
    let maxGridHeight = 0;
    infoGrid.forEach(info => {
      const lines = wrapText(`${info.label} ${info.value}`, 35);
      maxGridHeight = Math.max(maxGridHeight, lines.length * 6 + 5);
    });
    
    const gridHeight = Math.max(50, maxGridHeight * 2 + 10);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, y, 170, gridHeight, 'F');
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(32, 106, 79);
    pdf.text('Informações Gerais', 25, y + 10);
    
    let gridY = y + 20;
    let gridX = 25;
    
    infoGrid.forEach((info, infoIndex) => {
      if (infoIndex > 0 && infoIndex % 2 === 0) {
        gridY += 25;
        gridX = 25;
      }
      
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(32, 106, 79);
      pdf.text(info.label, gridX, gridY);
      
      pdf.setFont(undefined, info.italic ? 'italic' : 'normal');
      pdf.setTextColor(60, 60, 60);
      
      const valueLines = wrapText(info.value, 30);
      valueLines.forEach((line, lineIndex) => {
        if (gridY + 5 + (lineIndex * 5) < y + gridHeight - 5) {
          pdf.text(line, gridX, gridY + 5 + (lineIndex * 5));
        }
      });
      
      if (infoIndex % 2 === 0) {
        gridX += 85;
      }
    });
    
    y += gridHeight + 10;
    
    // Função para adicionar seções de texto com quebra de linha adequada
    const addTextSection = (title: string, content: string) => {
      if (y > 250) {
        pdf.addPage();
        currentPage++;
        y = addHeader();
      }
      
      pdf.setFillColor(32, 106, 79);
      pdf.rect(20, y, 170, 8, 'F');
      
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text(title, 25, y + 6);
      
      y += 15;
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      // Quebrar texto respeitando margens
      const lines = pdf.splitTextToSize(content, 160);
      lines.forEach(line => {
        if (y > 270) {
          pdf.addPage();
          currentPage++;
          y = addHeader();
        }
        pdf.text(line, 25, y);
        y += 6;
      });
      
      y += 10;
    };
    
    addTextSection('Utilização', plant.utilizacao);
    addTextSection('Forma de Cultivo', plant.formaCultivo);
    addTextSection('Formas de Utilização', plant.formasUtilizacao);
    
    if (plant.observacao) {
      addTextSection('Observações', plant.observacao);
    }
    
    // Adicionar imagem com moldura mantendo proporção original
    if (plant.imagens.length > 0) {
      try {
        if (y > 220) {
          pdf.addPage();
          currentPage++;
          y = addHeader();
        }
        
        // Moldura
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, y - 5, 90, 70, 'F');
        
        // Calcular dimensões mantendo proporção
        const img = new Image();
        img.src = plant.imagens[0];
        
        let imgWidth = 80;
        let imgHeight = 60;
        
        if (img.width && img.height) {
          const aspectRatio = img.width / img.height;
          
          if (aspectRatio > 1) {
            // Paisagem
            imgHeight = imgWidth / aspectRatio;
            if (imgHeight > 60) {
              imgHeight = 60;
              imgWidth = 60 * aspectRatio;
            }
          } else {
            // Retrato
            imgWidth = imgHeight * aspectRatio;
            if (imgWidth > 80) {
              imgWidth = 80;
              imgHeight = 80 / aspectRatio;
            }
          }
        }
        
        // Centralizar imagem na moldura
        const imgX = 25 + (80 - imgWidth) / 2;
        const imgY = y + (60 - imgHeight) / 2;
        
        pdf.addImage(plant.imagens[0], 'JPEG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
        
        // Legenda
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text('Imagem ilustrativa', 65, y + 65, { align: 'center' });
        
      } catch (error) {
        console.error(`Erro ao adicionar imagem para ${plant.nomePopular}:`, error);
      }
    }
  });
  
  // Rodapé em todas as páginas
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return pdf.output('blob');
};