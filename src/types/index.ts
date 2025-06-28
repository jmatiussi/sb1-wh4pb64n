export interface Plant {
  id: string;
  nomePopular: string;
  familia: string;
  especie: string;
  nomeCientifico: string;
  numeroCanteiro: string;
  utilizacao: string;
  principioAtivo: string;
  observacao: string;
  formaCultivo: string;
  formasUtilizacao: string;
  imagens: string[];
  dataCadastro: string;
  classificacao: string;
}

export interface Classification {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  dataCriacao: string;
}

export interface AppConfig {
  logo?: string;
}

export type SearchField = 'nomePopular' | 'especie' | 'nomeCientifico' | 'familia';