import React from 'react';

const TermsOfUseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[80] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center sticky top-0 bg-white dark:bg-dark-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Termos de Uso e Política de Privacidade</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto text-gray-700 dark:text-gray-300 text-sm space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">TERMOS DE USO – SIMPLIFIKA POST</h3>
            <p className="mb-2">Simplifika Post LTDA.ME, inscrita no CNPJ nº 21.209.071/0001-79, com sede no Rio de Janeiro/RJ, doravante denominada “Simplifika Post”, estabelece os presentes Termos de Uso para regular o acesso e a utilização de sua plataforma de agendamento de postagens em redes sociais, pelos usuários que voluntariamente se cadastram e utilizam o sistema, doravante denominados “Usuários”.</p>
            
            <h4 className="font-bold mt-4 mb-2">1. Objeto</h4>
            <p className="mb-2">A Simplifika Post disponibiliza uma ferramenta online para agendamento e publicação automática de conteúdos em redes sociais, mediante conexão segura por autenticação OAuth 2.0 com plataformas como Meta (Facebook e Instagram), TikTok, YouTube e Gemini.</p>
            <p className="mb-2">A Simplifika Post não é responsável pela hospedagem, visualização ou interação com o conteúdo publicado, sendo seu papel estritamente técnico, limitado ao agendamento e execução das postagens.</p>

            <h4 className="font-bold mt-4 mb-2">2. Aceitação dos Termos</h4>
            <p className="mb-2">Ao criar uma conta e utilizar a plataforma, o Usuário declara que leu, compreendeu e concorda integralmente com as disposições aqui descritas.</p>
            <p className="mb-2">O uso da plataforma implica aceite automático e irrevogável destes Termos.</p>

            <h4 className="font-bold mt-4 mb-2">3. Responsabilidade pelo Conteúdo</h4>
            <p className="mb-2">O Usuário é exclusivamente responsável por todo conteúdo agendado e publicado por meio da Simplifika Post.</p>
            <p className="mb-2">É dever do Usuário respeitar as políticas de uso e comunidade de cada rede social conectada.</p>
            <p className="mb-2">A Simplifika Post não se responsabiliza, direta ou indiretamente, por:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Conteúdos ilegais, ofensivos, políticos, sexuais, discriminatórios ou que infrinjam direitos autorais;</li>
              <li>Penalizações, suspensões ou exclusões aplicadas pelas plataformas;</li>
              <li>Perdas financeiras, danos morais ou de imagem decorrentes de publicações agendadas pelo Usuário.</li>
            </ul>

            <h4 className="font-bold mt-4 mb-2">4. Uso Indevido e Penalidades</h4>
            <p className="mb-2">É terminantemente proibido utilizar a Simplifika Post para:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Enviar spam, mensagens automáticas em massa ou conteúdos que contrariem a lei;</li>
              <li>Violar direitos de terceiros;</li>
              <li>Utilizar automações externas ou engenharia reversa sobre o sistema.</li>
            </ul>
            <p className="mt-2">O descumprimento acarretará exclusão imediata da conta sem aviso prévio, sem direito a reembolso, e sem qualquer responsabilidade financeira da Simplifika Post.</p>

            <h4 className="font-bold mt-4 mb-2">5. Planos, Pagamentos e Cancelamento</h4>
            <p className="mb-2">Os serviços da Simplifika Post são disponibilizados em planos mensais e anuais, mediante pagamento via cartão de crédito.</p>
            <p className="mb-2">Os planos anuais possuem desconto promocional e renovação automática até cancelamento pelo Usuário.</p>
            <p className="mb-2">O cancelamento pode ser solicitado a qualquer momento, porém não haverá reembolso de períodos já pagos.</p>
            <p className="mb-2">Todos os pagamentos são processados por operadoras de cartão de crédito parceiras, de forma segura.</p>
            <p className="mb-2">A Simplifika Post emite nota fiscal eletrônica correspondente aos serviços prestados.</p>

            <h4 className="font-bold mt-4 mb-2">6. Limitação de Responsabilidade</h4>
            <p className="mb-2">A Simplifika Post atua apenas como intermediária tecnológica.</p>
            <p className="mb-2">Não é responsável por:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Falhas de conexão ou indisponibilidade das APIs das redes sociais integradas;</li>
              <li>Erros, atrasos ou falhas no agendamento decorrentes de instabilidade externa;</li>
              <li>Qualquer dano indireto, perda de lucro, ou interrupção de negócios.</li>
            </ul>

            <h4 className="font-bold mt-4 mb-2">7. Encerramento de Conta</h4>
            <p className="mb-2">A Simplifika Post reserva-se o direito de encerrar, suspender ou excluir contas que violem estes Termos ou a legislação aplicável.</p>
            <p className="mb-2">O encerramento pode ocorrer sem aviso prévio e sem obrigação de reembolso.</p>

            <h4 className="font-bold mt-4 mb-2">8. Alterações dos Termos</h4>
            <p className="mb-2">A Simplifika Post poderá atualizar este documento a qualquer momento.</p>
            <p className="mb-2">O uso contínuo da plataforma após a publicação das alterações será interpretado como aceitação tácita das novas condições.</p>

            <h4 className="font-bold mt-4 mb-2">9. Foro e Legislação Aplicável</h4>
            <p className="mb-2">Os presentes Termos são regidos pelas leis da República Federativa do Brasil, em especial pela Lei nº 13.709/2018 (LGPD).</p>
            <p className="mb-2">Fica eleito o Foro da Comarca do Rio de Janeiro – RJ para dirimir quaisquer controvérsias oriundas deste instrumento.</p>
          </section>

          <div className="border-t border-gray-200 dark:border-dark-border my-4"></div>

          <section>
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">🔒 POLÍTICA DE PRIVACIDADE – SIMPLIFIKA POST</h3>
            <p className="mb-2">Esta Política de Privacidade descreve como a Simplifika Post LTDA.ME (CNPJ 21.209.071/0001-79) coleta, utiliza, armazena e compartilha os dados pessoais dos Usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).</p>
            
            <h4 className="font-bold mt-4 mb-2">1. Dados Coletados</h4>
            <p className="mb-2">A Simplifika Post coleta os seguintes dados:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Dados cadastrais: nome, e-mail e senha;</li>
              <li>Dados técnicos: endereço IP, cookies e informações de navegação;</li>
              <li>Dados de integração: nomes e IDs das contas conectadas via OAuth 2.0 (Meta, TikTok, YouTube, Gemini), sem armazenamento de senhas externas.</li>
            </ul>

            <h4 className="font-bold mt-4 mb-2">2. Finalidade da Coleta</h4>
            <p className="mb-2">Os dados são utilizados para:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Identificar e autenticar o Usuário;</li>
              <li>Permitir o funcionamento do sistema de agendamento;</li>
              <li>Processar pagamentos e emitir notas fiscais;</li>
              <li>Cumprir obrigações legais;</li>
              <li>Oferecer comunicações e oportunidades comerciais relacionadas à Simplifika Post.</li>
            </ul>

            <h4 className="font-bold mt-4 mb-2">3. Compartilhamento de Dados</h4>
            <p className="mb-2">A Simplifika Post poderá compartilhar dados com:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Operadoras de cartão de crédito (para processamento de pagamentos);</li>
              <li>Parceiros comerciais, mediante consentimento do Usuário, limitados a nome, e-mail e telefone;</li>
              <li>Autoridades legais, quando houver exigência judicial ou administrativa.</li>
            </ul>
            <p className="mt-2">Nenhum dado é vendido a terceiros.</p>

            <h4 className="font-bold mt-4 mb-2">4. Armazenamento e Segurança</h4>
            <p className="mb-2">Todos os dados são armazenados em servidores seguros, com criptografia e controles de acesso restrito.</p>
            <p className="mb-2">A Simplifika Post adota medidas de segurança administrativas e tecnológicas para proteger contra acesso não autorizado, alteração, perda ou destruição de informações.</p>

            <h4 className="font-bold mt-4 mb-2">5. Direitos do Usuário</h4>
            <p className="mb-2">Conforme a LGPD, o Usuário poderá a qualquer momento:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Solicitar acesso, correção, portabilidade ou exclusão de seus dados;</li>
              <li>Revogar o consentimento de uso e compartilhamento;</li>
              <li>Solicitar esclarecimentos sobre o tratamento de suas informações.</li>
            </ul>
            <p className="mt-2">Os pedidos podem ser enviados ao e-mail: contato@simplifikapost.com.br.</p>

            <h4 className="font-bold mt-4 mb-2">6. Cookies e Tecnologias de Rastreamento</h4>
            <p className="mb-2">O site da Simplifika Post utiliza cookies para otimizar a experiência do Usuário e medir estatísticas de uso.</p>
            <p className="mb-2">O Usuário pode configurar seu navegador para bloquear cookies, ciente de que isso pode afetar o funcionamento do sistema.</p>

            <h4 className="font-bold mt-4 mb-2">7. Alterações desta Política</h4>
            <p className="mb-2">Esta Política poderá ser atualizada periodicamente.</p>
            <p className="mb-2">A Simplifika Post notificará os Usuários sobre alterações relevantes por meio de aviso no site ou por e-mail.</p>

            <h4 className="font-bold mt-4 mb-2">8. Contato e Foro</h4>
            <p className="mb-2">Em caso de dúvidas ou solicitações relacionadas à privacidade, o Usuário poderá entrar em contato via contato@simplifikapost.com.br.</p>
            <p className="mb-2">Esta Política é regida pelas leis brasileiras e eventuais controvérsias serão resolvidas no Foro da Comarca do Rio de Janeiro – RJ.</p>
          </section>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button onClick={onClose} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseModal;
