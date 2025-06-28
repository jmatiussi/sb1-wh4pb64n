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

// Função para processar imagem e garantir que seja carregada corretamente
const processImageForPDF = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageSrc);
          return;
        }
        
        // Definir dimensões do canvas baseadas na imagem original
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        // Desenhar a imagem no canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converter para base64
        const processedImageSrc = canvas.toDataURL('image/jpeg', 0.8);
        resolve(processedImageSrc);
        
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        resolve(imageSrc);
      }
    };
    
    img.onerror = () => {
      console.error('Erro ao carregar imagem:', imageSrc);
      reject(new Error('Falha ao carregar imagem'));
    };
    
    img.src = imageSrc;
  });
};

export const generatePlantPDF = async (plant: Plant, logo?: string): Promise<Blob> => {
  const pdf = new jsPDF();
  let y = 20;
  
  // Logo no cabeçalho de todas as páginas
  const addHeader = (pageY: number = 5) => {
    if (logo) {
      try {
        pdf.addImage(logo, 'PNG', 10, pageY, 25, 15, undefined, 'FAST');
      } catch (error) {
        console.error('Erro ao adicionar logo:', error);
      }
    }
    return pageY + 20;
  };
  
  y = addHeader();
  
  // Cabeçalho principal
  pdf.setFillColor(32, 106, 79);
  pdf.rect(0, y, 210, 40, 'F');
  
  // Título com quebra de linha
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  const titleLines = wrapText('Ficha de Planta Medicinal', 25);
  let titleY = y + 15;
  titleLines.forEach(line => {
    pdf.text(line, 105, titleY, { align: 'center' });
    titleY += 12;
  });
  
  // Data
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, y + 30);
  
  y += 50;
  
  // Nome da planta com quebra de linha adequada
  pdf.setTextColor(32, 106, 79);
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  const nameLines = wrapText(plant.nomePopular, 40);
  nameLines.forEach(line => {
    pdf.text(line, 105, y, { align: 'center' });
    y += 10;
  });
  
  // Nome científico em itálico com quebra de linha
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'italic');
  pdf.setTextColor(100, 100, 100);
  const scientificNameLines = wrapText(`(${plant.nomeCientifico})`, 45);
  scientificNameLines.forEach(line => {
    pdf.text(line, 105, y + 5, { align: 'center' });
    y += 8;
  });
  
  y += 15;
  
  // Seção de Informações Gerais com altura dinâmica
  const infoItems = [
    { label: 'Família:', value: plant.familia },
    { label: 'Espécie:', value: plant.especie },
    { label: 'Canteiro:', value: plant.numeroCanteiro },
    { label: 'Classificação:', value: plant.classificacao },
    { label: 'Princípio Ativo:', value: plant.principioAtivo }
  ];
  
  // Calcular altura necessária para as informações
  let maxInfoHeight = 0;
  infoItems.forEach(item => {
    const lines = wrapText(`${item.label} ${item.value}`, 35);
    maxInfoHeight = Math.max(maxInfoHeight, lines.length * 6);
  });
  
  const infoSectionHeight = Math.max(60, maxInfoHeight + 30);
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, y, 170, infoSectionHeight, 'F');
  
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(32, 106, 79);
  pdf.text('Informações Gerais', 25, y + 10);
  
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  
  // Grid de informações com quebra de linha
  let infoY = y + 20;
  let infoX = 25;
  
  infoItems.forEach((item, index) => {
    if (index > 0 && index % 2 === 0) {
      infoY += 20;
      infoX = 25;
    }
    
    // Label em negrito
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(32, 106, 79);
    pdf.text(item.label, infoX, infoY);
    
    // Valor com quebra de linha
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(60, 60, 60);
    const valueLines = wrapText(item.value, 30);
    valueLines.forEach((line, lineIndex) => {
      if (infoY + 5 + (lineIndex * 5) < y + infoSectionHeight - 5) {
        pdf.text(line, infoX, infoY + 5 + (lineIndex * 5));
      }
    });
    
    if (index % 2 === 0) {
      infoX += 85;
    }
  });
  
  y += infoSectionHeight + 10;
  
  // Função para adicionar seções com título e conteúdo formatado
  const addSection = (title: string, content: string) => {
    if (y > 250) {
      pdf.addPage();
      y = addHeader();
    }
    
    // Título da seção com quebra de linha
    const titleLines = wrapText(title, 35);
    const titleHeight = Math.max(8, titleLines.length * 6);
    
    pdf.setFillColor(32, 106, 79);
    pdf.rect(20, y, 170, titleHeight, 'F');
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    
    let sectionTitleY = y + 6;
    titleLines.forEach(line => {
      pdf.text(line, 25, sectionTitleY);
      sectionTitleY += 6;
    });
    
    y += titleHeight + 5;
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    
    // Quebrar texto em linhas que cabem na página respeitando margens
    const lines = pdf.splitTextToSize(content, 160);
    lines.forEach(line => {
      if (y > 270) {
        pdf.addPage();
        y = addHeader();
      }
      pdf.text(line, 25, y);
      y += 6;
    });
    
    y += 10;
  };
  
  addSection('Utilização', plant.utilizacao);
  addSection('Forma de Cultivo', plant.formaCultivo);
  addSection('Formas de Utilização', plant.formasUtilizacao);
  
  if (plant.observacao) {
    addSection('Observações', plant.observacao);
  }
  
  // Seção de Imagens - processamento síncrono
  if (plant.imagens.length > 0) {
    if (y > 200) {
      pdf.addPage();
      y = addHeader();
    }
    
    pdf.setFillColor(32, 106, 79);
    pdf.rect(20, y, 170, 8, 'F');
    
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Imagens', 25, y + 6);
    
    y += 15;
    
    // Processar imagens sequencialmente
    let currentX = 25;
    let currentRowY = y;
    const maxWidth = 75;
    const maxHeight = 90;
    const margin = 10;
    const pageMargin = 190;
    
    for (let index = 0; index < plant.imagens.length; index++) {
      const imageSrc = plant.imagens[index];
      
      try {
        // Processar imagem de forma síncrona
        const processedImageSrc = await processImageForPDF(imageSrc);
        
        // Calcular dimensões mantendo proporção
        let imgWidth = maxWidth;
        let imgHeight = maxHeight;
        
        // Criar uma nova imagem para obter dimensões
        const img = new Image();
        img.src = processedImageSrc;
        
        // Aguardar carregamento da imagem
        await new Promise<void>((resolve) => {
          img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              
              if (aspectRatio > 1) {
                // Paisagem
                imgHeight = maxWidth / aspectRatio;
                if (imgHeight > maxHeight) {
                  imgHeight = maxHeight;
                  imgWidth = maxHeight * aspectRatio;
                }
              } else {
                // Retrato
                imgWidth = maxHeight * aspectRatio;
                if (imgWidth > maxWidth) {
                  imgWidth = maxWidth;
                  imgHeight = maxWidth / aspectRatio;
                }
              }
            }
            resolve();
          };
          img.onerror = () => resolve();
        });
        
        // Verificar se cabe na linha atual
        if (currentX + imgWidth > pageMargin) {
          currentX = 25;
          currentRowY = y + maxHeight + margin + 15;
          y = currentRowY;
        }
        
        // Verificar se precisa de nova página
        if (currentRowY + imgHeight > 270) {
          pdf.addPage();
          currentRowY = addHeader();
          y = currentRowY;
          currentX = 25;
        }
        
        // Adicionar imagem ao PDF
        pdf.addImage(
          processedImageSrc,
          'JPEG',
          currentX,
          currentRowY,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        
        // Legenda
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.setTextColor(100, 100, 100);
        const legendText = `Imagem ${index + 1}`;
        pdf.text(legendText, currentX + (imgWidth/2), currentRowY + imgHeight + 5, { align: 'center' });
        
        currentX += imgWidth + margin;
        
        // Atualizar y para a próxima seção
        if (currentRowY + imgHeight + 15 > y) {
          y = currentRowY + imgHeight + 15;
        }
        
      } catch (error) {
        console.error(`Erro ao processar imagem ${index + 1}:`, error);
        
        // Placeholder em caso de erro
        const placeholderWidth = maxWidth;
        const placeholderHeight = maxHeight;
        
        if (currentX + placeholderWidth > pageMargin) {
          currentX = 25;
          currentRowY = y + maxHeight + margin + 15;
          y = currentRowY;
        }
        
        if (currentRowY + placeholderHeight > 270) {
          pdf.addPage();
          currentRowY = addHeader();
          y = currentRowY;
          currentX = 25;
        }
        
        pdf.setFillColor(240, 240, 240);
        pdf.rect(currentX, currentRowY, placeholderWidth, placeholderHeight, 'F');
        
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Imagem não disponível', currentX + (placeholderWidth/2), currentRowY + (placeholderHeight/2), { align: 'center' });
        
        currentX += placeholderWidth + margin;
        
        if (currentRowY + placeholderHeight + 15 > y) {
          y = currentRowY + placeholderHeight + 15;
        }
      }
    }
    
    y += 10;
  }
  
  // Adicionar logo no cabeçalho de todas as páginas
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    if (i > 1 && logo) { // Primeira página já tem logo
      try {
        pdf.addImage(logo, 'PNG', 10, 5, 25, 15, undefined, 'FAST');
      } catch (error) {
        console.error('Erro ao adicionar logo na página:', error);
      }
    }
    // Rodapé
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return pdf.output('blob');
};

export const generateCatalog = async (plants: Plant[], classification: string = 'all', logo?: string): Promise<Blob> => {
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
  for (let plantIndex = 0; plantIndex < sortedPlants.length; plantIndex++) {
    const plant = sortedPlants[plantIndex];
    
    pdf.addPage();
    currentPage++;
    y = addHeader();
    
    // Título da planta com fundo verde claro
    const titleHeight = Math.max(50, (wrapText(`${plantIndex + 1}. ${plant.nomePopular}`, 45).length + wrapText(plant.nomeCientifico, 50).length) * 8 + 20);
    pdf.setFillColor(220, 240, 230);
    pdf.rect(20, y - 5, 170, titleHeight, 'F');
    
    // Número e nome popular com quebra de linha
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(32, 106, 79);
    const nameLines = wrapText(`${plantIndex + 1}. ${plant.nomePopular}`, 45);
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
    
    // Adicionar imagem com moldura mantendo proporção
    if (plant.imagens.length > 0) {
      try {
        if (y > 220) {
          pdf.addPage();
          currentPage++;
          y = addHeader();
        }
        
        // Processar imagem
        const processedImageSrc = await processImageForPDF(plant.imagens[0]);
        
        // Moldura
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, y - 5, 90, 70, 'F');
        
        // Calcular dimensões mantendo proporção
        let imgWidth = 80;
        let imgHeight = 60;
        
        const img = new Image();
        img.src = processedImageSrc;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              
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
            resolve();
          };
          img.onerror = () => resolve();
        });
        
        // Centralizar imagem na moldura
        const imgX = 25 + (80 - imgWidth) / 2;
        const imgY = y + (60 - imgHeight) / 2;
        
        pdf.addImage(processedImageSrc, 'JPEG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
        
        // Legenda
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'italic');
        pdf.setTextColor(100, 100, 100);
        pdf.text('Imagem ilustrativa', 65, y + 65, { align: 'center' });
        
      } catch (error) {
        console.error(`Erro ao adicionar imagem para ${plant.nomePopular}:`, error);
      }
    }
  }
  
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