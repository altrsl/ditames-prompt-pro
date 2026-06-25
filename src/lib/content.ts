export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  category: string;
  readTime: string;
  body: string[]; // paragraphs
};

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// Parses the ISO date as a calendar date (no timezone shift) to avoid
// SSR/CSR hydration mismatches between UTC server and local client.
const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} de ${MESES[m - 1]} de ${y}`;
};

export const formatDate = fmt;


export const blogPosts: Post[] = [
  {
    slug: "o-que-e-licenciamento-ambiental",
    title: "O que é Licenciamento Ambiental e quando ele é obrigatório",
    excerpt:
      "Entenda de forma simples o que é o licenciamento, quem precisa e como o processo funciona na prática.",
    date: "2026-06-10",
    category: "Educação Ambiental",
    readTime: "5 min de leitura",
    body: [
      "O Licenciamento Ambiental é o procedimento legal que autoriza uma atividade econômica a se instalar, operar ou se ampliar. Ele garante que o empreendimento atenda às exigências ambientais e atue dentro da lei.",
      "Toda atividade considerada potencialmente poluidora ou que utilize recursos naturais precisa de licença ambiental. Isso vale para indústrias, loteamentos, postos de combustíveis, granjas, minerações e muitos outros.",
      "O processo é dividido em três etapas principais: Licença Prévia (LP), Licença de Instalação (LI) e Licença de Operação (LO). Cada uma delas exige estudos específicos e tem prazos próprios de validade.",
      "Na Ditames, conduzimos o processo do início ao fim — do diagnóstico até a emissão da licença — sem que o cliente precise se preocupar com a complexidade técnica.",
    ],
  },
  {
    slug: "car-e-pra-explicado",
    title: "CAR e PRA: o que todo proprietário rural precisa saber",
    excerpt:
      "Cadastro Ambiental Rural e Programa de Regularização Ambiental explicados em linguagem clara.",
    date: "2026-05-28",
    category: "Rural",
    readTime: "6 min de leitura",
    body: [
      "O Cadastro Ambiental Rural (CAR) é um registro eletrônico obrigatório para todos os imóveis rurais do Brasil. Ele mapeia áreas de preservação, reserva legal e uso consolidado.",
      "O Programa de Regularização Ambiental (PRA) entra quando há passivos — áreas que precisam ser recuperadas para que a propriedade fique em conformidade com o Código Florestal.",
      "Estar regularizado garante acesso a crédito rural, evita multas e protege o valor patrimonial da propriedade.",
    ],
  },
  {
    slug: "drones-e-geoprocessamento",
    title: "Como drones e geoprocessamento aceleram decisões ambientais",
    excerpt:
      "A combinação de imagens aéreas e análise espacial reduz prazos e aumenta a precisão dos estudos.",
    date: "2026-05-15",
    category: "Tecnologia",
    readTime: "4 min de leitura",
    body: [
      "Drones com sensores RGB e multiespectrais capturam dados em alta resolução de áreas extensas em poucas horas. Esse material vira insumo para mapas, modelos digitais de elevação e análises de vegetação.",
      "O geoprocessamento integra essas informações com bases cartográficas oficiais, gerando diagnósticos rápidos e visuais para tomada de decisão.",
      "Na Ditames, essa stack está presente em praticamente todos os projetos — do inventário florestal ao planejamento de loteamentos.",
    ],
  },
  {
    slug: "outorga-de-agua",
    title: "Outorga de uso da água: quando você precisa solicitar",
    excerpt:
      "Captação superficial ou de poço profundo: entenda quando a outorga é obrigatória.",
    date: "2026-04-22",
    category: "Hidrologia",
    readTime: "5 min de leitura",
    body: [
      "A outorga é a autorização do órgão gestor para uso de recursos hídricos. Ela garante o direito de usar a água em quantidade e qualidade definidas.",
      "Indústrias, irrigantes, mineradoras e empreendimentos que captam água de rios, lagos ou poços tubulares normalmente precisam de outorga.",
      "O processo envolve estudos hidrológicos ou hidrogeológicos que comprovem a viabilidade do uso pretendido.",
    ],
  },
  {
    slug: "supressao-de-vegetacao-passo-a-passo",
    title: "Supressão de vegetação: como obter a autorização legal",
    excerpt:
      "Cortar vegetação nativa sem autorização é crime. Veja o caminho correto para regularizar.",
    date: "2026-04-05",
    category: "Florestal",
    readTime: "5 min de leitura",
    body: [
      "A supressão de vegetação nativa só pode ocorrer com autorização do órgão ambiental competente. Sem ela, há multa, embargo e responsabilização criminal.",
      "O caminho começa com inventário florestal e estudos complementares, passa pelo protocolo formal e culmina com a emissão da AuC — Autorização de Corte.",
      "Em muitos casos, há também compensação ambiental obrigatória — que pode ser planejada com bastante antecedência para reduzir custos.",
    ],
  },
  {
    slug: "georreferenciamento-incra",
    title: "Georreferenciamento de imóveis rurais: o que mudou com a Lei 10.267",
    excerpt:
      "Toda transação de imóvel rural exige certificação no INCRA. Entenda os prazos e exigências.",
    date: "2026-03-18",
    category: "Rural",
    readTime: "6 min de leitura",
    body: [
      "A Lei 10.267 tornou obrigatório o georreferenciamento para qualquer alteração registral de imóvel rural — compra, venda, partilha, desmembramento.",
      "O processo define com precisão os vértices da propriedade e a vincula ao Sistema Geodésico Brasileiro, gerando a certificação SIGEF.",
      "A entrega final inclui memorial descritivo, planta georreferenciada e ART do profissional habilitado.",
    ],
  },
];

export const newsPosts: Post[] = [
  {
    slug: "ditames-amplia-atuacao-sc",
    title: "Ditames amplia atuação para mais 12 municípios catarinenses",
    excerpt:
      "Crescimento sustentado leva a Ditames a marcar presença em novas regiões de Santa Catarina.",
    date: "2026-06-18",
    category: "Institucional",
    readTime: "3 min de leitura",
    body: [
      "A Ditames Ambiental fechou o primeiro semestre de 2026 com presença ativa em 47 municípios catarinenses — um avanço de 12 cidades em relação ao ano anterior.",
      "O movimento acompanha a estratégia de capilaridade técnica da empresa, mantendo profissionais próximos das demandas regionais.",
      "Novos projetos já estão em andamento nas regiões do Médio Vale do Itajaí, Planalto Norte e Oeste.",
    ],
  },
  {
    slug: "projeto-industrial-licenca-emitida",
    title: "Projeto industrial em Rio do Sul recebe Licença de Operação",
    excerpt:
      "Após 14 meses de processo, indústria atendida pela Ditames inicia operação regularizada.",
    date: "2026-06-02",
    category: "Projeto",
    readTime: "2 min de leitura",
    body: [
      "Mais um projeto industrial conduzido pela equipe técnica da Ditames foi concluído com sucesso. O empreendimento, localizado em Rio do Sul, recebeu a Licença de Operação após 14 meses de processo.",
      "O trabalho envolveu estudos ambientais completos, projetos de engenharia integrados e acompanhamento contínuo com o órgão ambiental.",
    ],
  },
  {
    slug: "participacao-evento-setor-ambiental",
    title: "Ditames participa de evento nacional do setor ambiental",
    excerpt:
      "Equipe técnica esteve presente em painéis sobre licenciamento e geotecnologia.",
    date: "2026-05-20",
    category: "Evento",
    readTime: "3 min de leitura",
    body: [
      "A Ditames marcou presença em um dos principais eventos do setor ambiental brasileiro, com participação em painéis técnicos e troca de experiências com empresas de todo o país.",
      "O foco esteve em geotecnologia aplicada e nas mudanças regulatórias previstas para os próximos anos.",
    ],
  },
  {
    slug: "novo-escritorio-tecnico",
    title: "Estrutura técnica recebe novos equipamentos e softwares",
    excerpt:
      "Investimento em GPS RTK adicional e novas licenças de SIG amplia capacidade operacional.",
    date: "2026-04-29",
    category: "Institucional",
    readTime: "2 min de leitura",
    body: [
      "A Ditames concluiu mais um ciclo de investimentos em equipamentos e softwares técnicos. Novos receptores GPS RTK e licenças de SIG fortalecem a capacidade de entrega.",
      "O movimento acompanha o crescimento da demanda por levantamentos georreferenciados e estudos de alta complexidade.",
    ],
  },
  {
    slug: "atualizacao-regulatoria-pra",
    title: "Atualização regulatória do PRA exige atenção de proprietários rurais",
    excerpt:
      "Mudanças recentes no Programa de Regularização Ambiental impactam prazos de adesão.",
    date: "2026-04-10",
    category: "Regulatório",
    readTime: "4 min de leitura",
    body: [
      "Recentes atualizações do PRA trouxeram novos prazos e exigências para proprietários rurais com passivos ambientais.",
      "É recomendado revisar a situação do CAR e do PRA o quanto antes para evitar perda de benefícios e enquadramento em sanções.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getNewsPost(slug: string) {
  return newsPosts.find((p) => p.slug === slug);
}
