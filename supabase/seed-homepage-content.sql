-- ============================================================
-- DITAMES — Popular homepage_content com todos os fallbacks
-- Execute no SQL Editor do Supabase
-- Usa ON CONFLICT DO NOTHING para não sobrescrever edições já feitas
-- ============================================================

insert into homepage_content (key, value, type) values

-- ─── HERO ────────────────────────────────────────────────────
('hero_title',    'Transformamos desafios ambientais em oportunidades de crescimento, segurança e desenvolvimento.', 'text'),
('hero_subtitle', 'Fortalecemos pessoas, propriedades e empresas por meio de soluções ambientais completas, promovendo segurança, conformidade legal e crescimento sustentável.', 'text'),

-- ─── PÚBLICO-ALVO ────────────────────────────────────────────
('publico_title', 'Soluções para quem precisa crescer com segurança', 'text'),
('publico_desc',  'Atendemos desde proprietários rurais até grandes empreendimentos industriais, oferecendo soluções ambientais que unem técnica, estratégia e segurança para cada realidade.', 'text'),

-- ─── NÚMEROS ─────────────────────────────────────────────────
('numeros_anos',          '4',   'text'),
('numeros_clientes',      '687', 'text'),
('numeros_municipios',    '47',  'text'),
('numeros_profissionais', '40',  'text'),

-- ─── MÉTODO ──────────────────────────────────────────────────
('metodo_title', 'Método Ditames', 'text'),
('metodo_desc',  'Um processo claro e rastreável que assegura previsibilidade e qualidade em cada etapa do projeto.', 'text'),

-- ─── DIFERENCIAIS ────────────────────────────────────────────
('diferenciais_title',  'Por que escolher a Ditames', 'text'),
('diferencial_0_title', 'Soluções Integradas', 'text'),
('diferencial_0_desc',  'Engenharia, ambiental e geotecnologia em um único interlocutor técnico.', 'text'),
('diferencial_1_title', 'Compromisso com Resultados', 'text'),
('diferencial_1_desc',  'Conduzimos o projeto até a aprovação — sem terceirizar a responsabilidade.', 'text'),
('diferencial_2_title', 'Tecnologia e Inovação', 'text'),
('diferencial_2_desc',  'Drones, GPS RTK, SIG e modelagem aplicados a cada entrega.', 'text'),
('diferencial_3_title', 'Entendimento e Solução', 'text'),
('diferencial_3_desc',  'Diagnóstico preciso e caminho prático para o que parece complexo.', 'text'),

-- ─── CULTURA (seção na Home) ──────────────────────────────────
('cultura_title', 'A cultura que sustenta nossos resultados', 'text'),
('cultura_desc',  'Excelência técnica e desenvolvimento humano caminham juntos na Ditames.', 'text'),

-- ─── CTA FINAL ────────────────────────────────────────────────
('cta_title', 'Tem um desafio ambiental?', 'text'),
('cta_desc',  'Nossa Recepcionista Ambiental ouve sua situação, identifica o que você precisa e indica o caminho certo — antes mesmo de falar com um especialista.', 'text'),

-- ─── PÁGINA CULTURA ──────────────────────────────────────────
('cultura_hero_title',           'A cultura que sustenta nossos resultados', 'text'),
('cultura_pilares_eyebrow',      'Os 5 pilares', 'text'),
('cultura_pilares_title',        'O comportamento que define quem somos', 'text'),
('cultura_pilares_desc',         'Cinco princípios que orientam cada decisão, cada entrega e cada relação da Ditames.', 'text'),
('pilar_1_titulo', 'Obstinação por Resultados', 'text'),
('pilar_1_desc',   'Não medimos esforço. Medimos entrega. Cada projeto avança até a conclusão com responsabilidade integral.', 'text'),
('pilar_2_titulo', 'Excelência Técnica', 'text'),
('pilar_2_desc',   'Trabalhamos no padrão mais alto da engenharia ambiental. Sem atalhos, sem improviso, sem retrabalho.', 'text'),
('pilar_3_titulo', 'Autorresponsabilidade', 'text'),
('pilar_3_desc',   'Cada profissional Ditames assume o que prometeu. Responsabilidade é vivida, não delegada.', 'text'),
('pilar_4_titulo', 'Cliente no Centro', 'text'),
('pilar_4_desc',   'Decisões e processos existem para devolver tempo, clareza e segurança a quem confia na Ditames.', 'text'),
('pilar_5_titulo', 'Resiliência Adaptativa', 'text'),
('pilar_5_desc',   'Cenário muda. Cliente muda. Norma muda. A Ditames se reorganiza rápido sem perder rigor técnico.', 'text'),
('cultura_eudaimonia_eyebrow',   'Filosofia', 'text'),
('cultura_eudaimonia_titulo',    'Eudaimonia', 'text'),
('cultura_eudaimonia_subtitulo', 'A vida que vale a pena ser vivida', 'text'),
('cultura_eudaimonia_p1', 'A Ditames se inspira no conceito grego de Eudaimonia — o florescimento humano que acontece quando técnica, propósito e desenvolvimento pessoal se alinham.', 'text'),
('cultura_eudaimonia_p2', 'Acreditamos que o trabalho deixa de ser apenas execução quando passa a desenvolver quem o faz. Por isso investimos em formação contínua, autonomia técnica e cultura de excelência.', 'text'),
('cultura_eudaimonia_p3', 'Resultado: equipes que crescem rápido, projetos entregues com rigor e clientes que voltam.', 'text'),
('cultura_comportamento_eyebrow', 'Comportamento organizacional', 'text'),
('cultura_comportamento_titulo',  'Como nos comportamos', 'text'),
('cultura_comportamento_item_1',  'Comunicação direta e respeitosa entre times e clientes.', 'text'),
('cultura_comportamento_item_2',  'Decisões baseadas em dados técnicos e em campo, não em achismo.', 'text'),
('cultura_comportamento_item_3',  'Erros são aprendizado público, acertos são reconhecidos.', 'text'),
('cultura_comportamento_item_4',  'Hierarquia de ideias, não de cargos.', 'text'),
('cultura_entrega_eyebrow', 'Forma de trabalho', 'text'),
('cultura_entrega_titulo',  'Como entregamos', 'text'),
('cultura_entrega_item_1',  'Cada projeto tem responsável técnico nomeado e rastreável.', 'text'),
('cultura_entrega_item_2',  'Cronograma, escopo e premissas são pactuados por escrito.', 'text'),
('cultura_entrega_item_3',  'Tecnologia (SIG, drones, GPS RTK) é usada em todas as etapas.', 'text'),
('cultura_entrega_item_4',  'Acompanhamento contínuo do cliente até a aprovação final.', 'text')

on conflict (key) do nothing;
