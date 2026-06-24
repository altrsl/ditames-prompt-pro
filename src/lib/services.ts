import {
  FileCheck,
  ScrollText,
  Ruler,
  MapPin,
  Leaf,
  Scissors,
  Droplets,
  Waves,
  Layers,
  PencilRuler,
  LandPlot,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  title: string;
  short: string;
  icon: LucideIcon;
  whatIs: string;
  whenNeeded: string[];
  steps: string[];
  keywords: string[];
};

export const services: Service[] = [
  {
    slug: "licenciamento-ambiental",
    title: "Licenciamento Ambiental",
    short: "Autorização legal para instalar, operar ou ampliar empreendimentos.",
    icon: FileCheck,
    whatIs:
      "Processo que avalia os impactos de uma atividade e define as condições para que ela opere em conformidade com a legislação ambiental.",
    whenNeeded: [
      "Implantação de uma indústria ou empreendimento",
      "Exigência de órgão ambiental para iniciar a operação",
      "Ampliação de atividade já existente",
      "Renovação de licenças vencidas",
    ],
    steps: [
      "Diagnóstico inicial do empreendimento",
      "Definição da modalidade de licença",
      "Elaboração dos estudos exigidos",
      "Protocolo junto ao órgão competente",
      "Acompanhamento até a emissão da licença",
    ],
    keywords: ["indústria", "licença", "empreendimento", "operar", "abrir negócio"],
  },
  {
    slug: "regularizacao-ambiental",
    title: "Regularização Ambiental",
    short: "Adequação de imóveis e atividades às exigências ambientais vigentes.",
    icon: ScrollText,
    whatIs:
      "Conjunto de ações que coloca propriedades e atividades em conformidade com o Código Florestal, CAR, PRA e demais normas ambientais.",
    whenNeeded: [
      "Propriedade rural sem CAR ou com pendências",
      "Áreas de Preservação Permanente comprometidas",
      "Necessidade de adesão ao PRA",
      "Compra ou venda de imóvel rural",
    ],
    steps: [
      "Análise da situação documental e fundiária",
      "Vistoria técnica e mapeamento da propriedade",
      "Elaboração ou retificação do CAR",
      "Plano de regularização e PRA",
      "Acompanhamento até a quitação ambiental",
    ],
    keywords: ["car", "rural", "propriedade", "regularizar", "imóvel rural", "pra"],
  },
  {
    slug: "topografia",
    title: "Topografia",
    short: "Levantamento preciso do terreno para projetos e regularizações.",
    icon: Ruler,
    whatIs:
      "Medição detalhada de um terreno, com altimetria e planimetria, base para qualquer projeto de engenharia, ambiental ou urbanístico.",
    whenNeeded: [
      "Elaboração de projetos de construção",
      "Loteamentos e desmembramentos",
      "Cálculo de volumes e movimentação de terra",
      "Disputas de divisas e regularizações",
    ],
    steps: [
      "Reconhecimento da área",
      "Levantamento de campo com GPS RTK e estação total",
      "Processamento dos dados",
      "Geração de plantas e memoriais",
      "Entrega técnica assinada",
    ],
    keywords: ["terreno", "planta", "divisas", "construção", "medição"],
  },
  {
    slug: "georreferenciamento",
    title: "Georreferenciamento",
    short: "Certificação de imóveis rurais junto ao INCRA conforme a Lei 10.267.",
    icon: MapPin,
    whatIs:
      "Levantamento técnico que define com precisão os limites de um imóvel rural e o vincula ao Sistema Geodésico Brasileiro.",
    whenNeeded: [
      "Compra, venda ou transferência de imóvel rural",
      "Desmembramento, remembramento ou retificação",
      "Inventários e partilhas",
      "Exigência cartorária ou do INCRA",
    ],
    steps: [
      "Análise documental e cadastral",
      "Levantamento georreferenciado em campo",
      "Processamento e certificação SIGEF",
      "Memorial descritivo e ART",
      "Acompanhamento até averbação em cartório",
    ],
    keywords: ["incra", "sigef", "rural", "cartório", "matrícula"],
  },
  {
    slug: "inventario-florestal",
    title: "Inventário Florestal",
    short: "Quantificação e qualificação da vegetação em uma área.",
    icon: Leaf,
    whatIs:
      "Estudo técnico que mensura e classifica a vegetação existente, base para autorizações de supressão e manejo florestal.",
    whenNeeded: [
      "Pedido de autorização para supressão de vegetação",
      "Planos de manejo florestal",
      "Estudos ambientais e EIA/RIMA",
      "Cálculo de compensação ambiental",
    ],
    steps: [
      "Delimitação e amostragem da área",
      "Coleta de dados dendrométricos",
      "Análise estatística e fitossociológica",
      "Relatório técnico com ART",
      "Suporte ao protocolo no órgão ambiental",
    ],
    keywords: ["vegetação", "floresta", "árvores", "supressão", "manejo"],
  },
  {
    slug: "supressao-de-vegetacao",
    title: "Supressão de Vegetação",
    short: "Autorização para corte legalizado de vegetação nativa.",
    icon: Scissors,
    whatIs:
      "Processo de obtenção da autorização ambiental para remoção de vegetação visando uso alternativo do solo.",
    whenNeeded: [
      "Implantação de empreendimentos ou loteamentos",
      "Abertura de áreas para agricultura ou pecuária",
      "Construção de acessos, barragens ou estradas",
      "Manejo de áreas com vegetação nativa",
    ],
    steps: [
      "Diagnóstico da vegetação",
      "Inventário florestal",
      "Estudos ambientais complementares",
      "Protocolo junto ao órgão competente",
      "Acompanhamento até a emissão da AuC",
    ],
    keywords: ["corte", "desmate", "vegetação", "auc", "uso do solo"],
  },
  {
    slug: "estudos-hidrologicos",
    title: "Estudos Hidrológicos",
    short: "Análise do comportamento das águas superficiais em uma bacia.",
    icon: Droplets,
    whatIs:
      "Estudo do regime de chuvas, vazões e escoamento superficial, fundamental para obras hidráulicas, outorgas e drenagem.",
    whenNeeded: [
      "Pedido de outorga de uso da água",
      "Projetos de barragens e açudes",
      "Drenagem urbana e rural",
      "Estudos de impacto ambiental",
    ],
    steps: [
      "Delimitação da bacia hidrográfica",
      "Coleta e tratamento de dados pluviométricos",
      "Modelagem hidrológica",
      "Cálculo de vazões e vazão de projeto",
      "Relatório técnico com ART",
    ],
    keywords: ["água", "chuva", "vazão", "outorga", "drenagem", "barragem"],
  },
  {
    slug: "estudos-hidrogeologicos",
    title: "Estudos Hidrogeológicos",
    short: "Análise das águas subterrâneas para uso e proteção do recurso.",
    icon: Waves,
    whatIs:
      "Estudo do comportamento dos aquíferos, vazão e qualidade da água subterrânea para fins de captação e proteção.",
    whenNeeded: [
      "Perfuração de poços tubulares",
      "Outorga de poços profundos",
      "Avaliação de áreas contaminadas",
      "Estudos de viabilidade hídrica",
    ],
    steps: [
      "Levantamento geológico e hidrogeológico",
      "Ensaios de bombeamento",
      "Análise de qualidade da água",
      "Modelagem do aquífero",
      "Laudo técnico e protocolo de outorga",
    ],
    keywords: ["poço", "água subterrânea", "aquífero", "nascente", "outorga"],
  },
  {
    slug: "geoprocessamento",
    title: "Geoprocessamento",
    short: "Análise espacial de dados para decisões territoriais inteligentes.",
    icon: Layers,
    whatIs:
      "Aplicação de técnicas de SIG para integrar mapas, imagens de satélite e bases cadastrais, gerando informação estratégica.",
    whenNeeded: [
      "Análise de viabilidade de áreas",
      "Mapeamento temático ambiental",
      "Monitoramento por satélite",
      "Subsídio a estudos e licenciamentos",
    ],
    steps: [
      "Coleta de bases geográficas",
      "Estruturação do banco de dados espacial",
      "Análise e cruzamento de informações",
      "Geração de mapas e relatórios",
      "Entrega georreferenciada",
    ],
    keywords: ["sig", "mapa", "satélite", "análise espacial", "imagem"],
  },
  {
    slug: "projetos-de-engenharia",
    title: "Projetos de Engenharia",
    short: "Projetos técnicos integrados ao componente ambiental.",
    icon: PencilRuler,
    whatIs:
      "Elaboração de projetos de engenharia com responsabilidade técnica e integração com exigências ambientais e urbanísticas.",
    whenNeeded: [
      "Obras civis em áreas sensíveis",
      "Projetos de drenagem, terraplenagem e contenção",
      "Infraestrutura para loteamentos e indústrias",
      "Aprovações junto a órgãos públicos",
    ],
    steps: [
      "Levantamento de demandas e restrições",
      "Anteprojeto técnico",
      "Projeto executivo com ART",
      "Compatibilização com exigências ambientais",
      "Acompanhamento de aprovação",
    ],
    keywords: ["projeto", "obra", "engenharia", "drenagem", "infraestrutura"],
  },
  {
    slug: "loteamentos",
    title: "Loteamentos",
    short: "Aprovação e estruturação completa de empreendimentos imobiliários.",
    icon: LandPlot,
    whatIs:
      "Condução técnica de loteamentos urbanos e rurais, do estudo de viabilidade à aprovação no município e órgãos ambientais.",
    whenNeeded: [
      "Implantação de novo loteamento",
      "Desmembramento de gleba",
      "Aprovação junto à prefeitura e órgão ambiental",
      "Regularização de loteamento existente",
    ],
    steps: [
      "Estudo de viabilidade técnica e legal",
      "Levantamento topográfico e ambiental",
      "Projeto urbanístico e de infraestrutura",
      "Licenciamento e protocolos",
      "Acompanhamento até registro em cartório",
    ],
    keywords: ["loteamento", "imobiliário", "incorporação", "gleba", "urbano"],
  },
  {
    slug: "consultoria-ambiental",
    title: "Consultoria Ambiental",
    short: "Apoio técnico estratégico para decisões com componente ambiental.",
    icon: Lightbulb,
    whatIs:
      "Atendimento consultivo recorrente ou pontual para orientar decisões e antecipar riscos ambientais em empreendimentos.",
    whenNeeded: [
      "Dúvidas técnicas sobre legislação ambiental",
      "Avaliação de áreas para investimento",
      "Estruturação de gestão ambiental interna",
      "Atendimento a notificações e exigências",
    ],
    steps: [
      "Reunião de diagnóstico",
      "Análise documental e técnica",
      "Plano de ação personalizado",
      "Execução acompanhada",
      "Relatórios periódicos",
    ],
    keywords: ["consultoria", "dúvida", "estratégia", "risco ambiental", "notificação"],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export const WHATSAPP_URL = "https://wa.me/5547996910055?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Ditames";
