import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Ditames Ambiental" },
      { name: "description", content: "Saiba como a Ditames Ambiental coleta, utiliza e protege seus dados pessoais, em conformidade com a LGPD." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacidadePage,
});

const LAST_UPDATE = "02 de julho de 2025";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl uppercase text-ink mb-4">{title}</h2>
      <div className="space-y-3 text-foreground/80 leading-relaxed text-base">
        {children}
      </div>
    </section>
  );
}

function PrivacidadePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Política de Privacidade"
        subtitle={`Última atualização: ${LAST_UPDATE}`}
      />

      <div className="bg-background py-16 md:py-20">
        <div className="container-x max-w-3xl">

          <Section title="1. Quem somos">
            <p>
              A <strong>Ditames Ambiental Ltda.</strong>, inscrita no CNPJ sob o nº{" "}
              <strong>47.591.981/0001-52</strong>, com sede na Rua Brasil, 22 — Sumaré,
              Rio do Sul/SC — CEP 89165-613, é a controladora dos dados pessoais tratados
              por meio deste site e de seus canais de atendimento.
            </p>
            <p>
              Para dúvidas ou solicitações relacionadas a esta política, entre em contato
              pelo e-mail{" "}
              <a href="mailto:ambiental@ditames.com.br" className="text-primary hover:underline">
                ambiental@ditames.com.br
              </a>.
            </p>
          </Section>

          <Section title="2. Dados coletados">
            <p>Coletamos apenas os dados necessários para cada finalidade:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Formulário de contato:</strong> nome, e-mail, telefone (opcional),
                serviço de interesse (opcional) e mensagem.
              </li>
              <li>
                <strong>Recepcionista Ambiental (IA):</strong> o conteúdo das mensagens
                trocadas durante a conversa, quando o usuário opta por encaminhar o
                atendimento a um especialista humano.
              </li>
              <li>
                <strong>Navegação:</strong> dados técnicos de acesso (endereço IP, tipo
                de navegador, páginas visitadas) registrados automaticamente pela
                infraestrutura de hospedagem, conforme exigido pelo Marco Civil da
                Internet (Lei 12.965/2014).
              </li>
              <li>
                <strong>Autenticação interna:</strong> e-mail e senha de usuários do
                painel administrativo (equipe Ditames). Esses dados não são coletados de
                visitantes do site.
              </li>
            </ul>
          </Section>

          <Section title="3. Finalidade do tratamento">
            <ul className="list-disc pl-5 space-y-2">
              <li>Responder solicitações e dúvidas enviadas pelo formulário de contato.</li>
              <li>Realizar o primeiro atendimento por meio da Recepcionista Ambiental e encaminhar ao especialista quando necessário.</li>
              <li>Manter registros de comunicação para controle interno e cumprimento de obrigações legais.</li>
              <li>Melhorar continuamente os serviços e a experiência do usuário no site.</li>
            </ul>
          </Section>

          <Section title="4. Base legal">
            <p>O tratamento dos seus dados é fundamentado nas seguintes hipóteses previstas na LGPD (Lei 13.709/2018):</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Consentimento</strong> — quando você preenche o formulário de contato ou inicia uma conversa com a Recepcionista Ambiental.</li>
              <li><strong>Legítimo interesse</strong> — para registros de acesso exigidos pela Lei 12.965/2014 (Marco Civil da Internet).</li>
              <li><strong>Cumprimento de obrigação legal</strong> — quando exigido por autoridades competentes.</li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de dados">
            <p>
              A Ditames não vende, aluga nem compartilha seus dados pessoais com terceiros
              para fins comerciais. Os dados podem ser compartilhados apenas com:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Supabase Inc.</strong> — plataforma de banco de dados utilizada
                para armazenamento seguro dos dados coletados.
              </li>
              <li>
                <strong>Autoridades públicas</strong> — quando exigido por lei, ordem
                judicial ou regulamentação aplicável.
              </li>
            </ul>
          </Section>

          <Section title="6. Retenção dos dados">
            <ul className="list-disc pl-5 space-y-2">
              <li>Dados de contato e conversas com a RA: retidos por até <strong>2 anos</strong> a partir da coleta, salvo necessidade legal de retenção por prazo maior.</li>
              <li>Registros de acesso (logs): retidos por <strong>6 meses</strong>, conforme o Marco Civil da Internet.</li>
              <li>Dados de usuários administrativos: retidos enquanto o vínculo profissional estiver ativo.</li>
            </ul>
          </Section>

          <Section title="7. Seus direitos">
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação dos seus dados.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Obter informações sobre com quem compartilhamos seus dados.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail{" "}
              <a href="mailto:ambiental@ditames.com.br" className="text-primary hover:underline">
                ambiental@ditames.com.br
              </a>{" "}
              com o assunto <strong>"LGPD — Solicitação de dados"</strong>. Responderemos
              em até 15 dias úteis.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Este site utiliza cookies estritamente necessários para o funcionamento da
              autenticação do painel administrativo. Não utilizamos cookies de rastreamento
              ou publicidade. Você pode desativar cookies no seu navegador, mas isso pode
              impedir o acesso ao painel administrativo.
            </p>
          </Section>

          <Section title="9. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus
              dados contra acesso não autorizado, perda ou destruição, incluindo
              criptografia em trânsito (HTTPS), controle de acesso por autenticação e
              armazenamento em infraestrutura segura.
            </p>
          </Section>

          <Section title="10. Alterações desta política">
            <p>
              Esta política pode ser atualizada periodicamente. Alterações relevantes
              serão comunicadas nesta página com a atualização da data no topo.
              Recomendamos verificá-la periodicamente.
            </p>
          </Section>

          <Section title="11. Contato e encarregado de dados (DPO)">
            <p>
              Responsável pelo tratamento de dados pessoais na Ditames Ambiental:
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li><strong>Empresa:</strong> Ditames Ambiental Ltda.</li>
              <li><strong>CNPJ:</strong> 47.591.981/0001-52</li>
              <li><strong>E-mail:</strong>{" "}
                <a href="mailto:ambiental@ditames.com.br" className="text-primary hover:underline">
                  ambiental@ditames.com.br
                </a>
              </li>
              <li><strong>Endereço:</strong> Rua Brasil, 22 — Sumaré, Rio do Sul/SC — CEP 89165-613</li>
            </ul>
          </Section>

        </div>
      </div>
    </>
  );
}
