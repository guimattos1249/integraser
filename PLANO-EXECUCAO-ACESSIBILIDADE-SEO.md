# Plano de execução — acessibilidade, SEO e desempenho

## 1. Objetivo

Implementar as melhorias identificadas na auditoria das três páginas públicas do Espaço IntegraSer:

- `index.html`
- `colaboradores.html`
- `identidade-corporativa.html`

O domínio público futuro será `https://www.integraserguara.com.br`, mas ainda não foi contratado. Nesta fase, não executar tarefas que dependam do domínio, DNS, hospedagem, certificado TLS, Google Search Console ou publicação. Essas ações estão registradas na seção **Trabalho adiado até a contratação do domínio**.

## 2. Instruções para o agente executor

1. Leia integralmente este plano antes de editar qualquer arquivo.
2. Inspecione `git status` e preserve alterações preexistentes do usuário.
3. Trabalhe apenas nos arquivos relacionados às tarefas abaixo.
4. Não invente informações profissionais, horários, redes sociais, credenciais ou dados comerciais.
5. Não altere o texto editorial, nomes, registros profissionais ou descrições das profissionais sem necessidade técnica.
6. Não remova `alt` existentes. Imagens decorativas devem continuar com `alt=""`; imagens informativas devem manter descrição contextual.
7. Não substitua ainda `DOMINIO-DO-SITE.example` pelo domínio futuro. Essa troca faz parte do checklist de publicação adiado.
8. Preserve a identidade visual. Quando uma cor não atender ao contraste mínimo, use preferencialmente uma cor já existente na paleta antes de criar outra.
9. Faça as alterações em etapas pequenas e verifique cada etapa antes de avançar.
10. Ao concluir, apresente um resumo dos arquivos alterados, testes executados, resultados e itens que permaneceram adiados.

## 3. Estado atual confirmado

- Existem 23 elementos `img` nas três páginas e todos possuem atributo `alt`.
- Oito imagens usam `alt=""` de forma intencional por serem decorativas ou repetirem informação textual adjacente.
- Todas as páginas possuem `lang="pt-BR"`, link de salto, `header`, `nav`, `main`, `footer` e um único `h1`.
- Os três blocos JSON-LD possuem sintaxe JSON válida.
- Há suporte parcial a `prefers-reduced-motion`.
- O menu móvel atualiza `aria-expanded` e fecha com `Escape`, mas não gerencia completamente o foco.
- A página de colaboradores salta de `h1` para `h3` nos nomes das profissionais.
- Apenas `assets/atuacao.jpg` possui no HTML `width`, `height`, `loading="lazy"` e `decoding="async"`.
- Os arquivos `assets/arvore-integraser.jpg` e `assets/logo-simbolo.jpg` são binariamente idênticos.
- Combinações de contraste medidas:
  - `#2f9d8c` sobre branco: 3,32:1;
  - `#2f9d8c` sobre creme: 3,20:1;
  - `#e96f57` sobre creme: 2,94:1;
  - `#125f57` sobre creme: 7,22:1;
  - `#5f7471` sobre creme: 4,79:1.

## 4. Escopo desta execução

### Incluído agora

- Semântica e hierarquia de títulos.
- Indicação acessível da página atual.
- Contraste de textos e componentes.
- Indicadores de foco.
- Navegação por teclado no menu móvel.
- Acessibilidade do carrossel de avaliações.
- Otimização local das imagens.
- Dimensões, carregamento e decodificação das imagens.
- Ícones locais do site.
- Dados estruturados que possam ser derivados exclusivamente de informações já visíveis no site.
- Testes locais e revisão estática.

### Fora do escopo por enquanto

- Compra do domínio.
- Configuração de DNS.
- Hospedagem e redirecionamentos do servidor.
- Emissão de certificado HTTPS.
- Troca das URLs fictícias pelo domínio futuro.
- Google Search Console e ferramentas de produção.
- Informações comerciais que ainda precisem ser confirmadas pelo responsável.

## 5. Ordem obrigatória de execução

### Fase A — Semântica e navegação

#### A1. Corrigir a hierarquia de títulos da equipe

Arquivo principal: `colaboradores.html`.

1. Revisar a estrutura que começa no `h1` da equipe.
2. Transformar os nomes das profissionais em `h2`, desde que isso mantenha uma hierarquia coerente com o restante da página.
3. Manter subtítulos internos em `h3` quando forem subordinados ao nome da profissional.
4. Não usar níveis de título apenas por aparência; ajustar o CSS se necessário.

Critério de aceite:

- não há salto direto de `h1` para `h3`;
- a navegação por títulos apresenta uma estrutura compreensível;
- a aparência visual original foi preservada.

#### A2. Identificar a página atual no menu

Arquivos: os três HTMLs e, se necessário, `styles.css`.

1. Adicionar `aria-current="page"` ao item correspondente em cada página.
2. Na página inicial, definir qual item representa de fato a página atual sem marcar links de âncora incorretamente.
3. Criar estado visual que não dependa apenas de cor, por exemplo sublinhado persistente ou marcador equivalente.
4. Garantir que o estado continue perceptível em desktop e celular.

Critério de aceite:

- existe no máximo um `aria-current="page"` em cada navegação principal;
- o item atual é identificado visualmente e por leitor de tela.

#### A3. Revisar links que abrem nova aba

Arquivos: os três HTMLs.

1. Manter `target="_blank"` apenas quando houver benefício claro, como Google Maps e WhatsApp.
2. Manter `rel="noopener noreferrer"` em todos esses links.
3. Incluir uma indicação acessível de “abre em nova aba” sem poluir excessivamente o texto visual. Pode ser usado texto `.sr-only` dentro do link.
4. Não duplicar a indicação quando o nome acessível já for suficientemente explícito e o comportamento tiver sido padronizado de outra maneira.

Critério de aceite:

- nenhum link externo com nova aba perde `rel="noopener noreferrer"`;
- a mudança de contexto é anunciada de forma consistente.

### Fase B — Contraste e foco

#### B1. Corrigir contrastes insuficientes

Arquivos: `styles.css`, `colaboradores.css` e `identidade-corporativa.css`.

Direção recomendada:

1. Usar `--green-900: #125f57` como fundo de botões com texto branco e de cards de contato que contenham texto pequeno.
2. Manter `--green-700: #2f9d8c` em elementos decorativos, bordas ou componentes grandes onde o contraste aplicável seja atendido.
3. Usar `--rust: #9e3420` no lugar de `--terracotta: #e96f57` para textos pequenos sobre fundos claros.
4. Manter terracota em elementos decorativos e textos grandes apenas quando a razão aplicável for atendida.
5. Remover ou aumentar opacidades muito baixas de textos essenciais em fundos verdes.
6. Conferir especialmente:
   - `.button`;
   - `.eyebrow`;
   - `.professional-role`;
   - `.pillar-label`;
   - `.profile-number`;
   - `.review-source-label`;
   - `.contact-card`;
   - `.team-contact-card`;
   - `.identity-contact-card`;
   - textos auxiliares dos accordions escuros.

Critério de aceite:

- texto normal: contraste mínimo de 4,5:1;
- texto grande: contraste mínimo de 3:1;
- componentes e indicadores essenciais: contraste mínimo de 3:1;
- nenhuma informação depende somente da cor.

#### B2. Criar foco visível consistente

Arquivo principal: `styles.css`; complementar nos CSS específicos se necessário.

1. Criar regras `:focus-visible` para links, botões, `summary` e controles personalizados.
2. Usar contorno com pelo menos 2 ou 3 pixels e `outline-offset` perceptível.
3. Definir variação adequada para fundos claros e escuros.
4. Evitar remover o `outline` nativo sem substituto equivalente.
5. Confirmar foco em:
   - link de salto;
   - logotipo clicável;
   - menu principal;
   - botão do menu móvel;
   - CTAs;
   - accordions;
   - avaliações;
   - links do rodapé;
   - botão de voltar ao topo.

Critério de aceite:

- toda ação acessível por teclado possui foco claramente identificável;
- o indicador não é cortado por `overflow: hidden`;
- o contraste do indicador é de pelo menos 3:1 com o entorno.

### Fase C — Menu móvel e conteúdo dinâmico

#### C1. Implementar gerenciamento completo de foco no menu móvel

Arquivos: `script.js` e possivelmente os três HTMLs.

Comportamento esperado:

1. Ao abrir, salvar o elemento que possuía foco.
2. Atualizar `aria-expanded` e o nome acessível do botão.
3. Mover o foco para o primeiro link do menu ou para o próprio contêiner com foco programático.
4. Conter `Tab` e `Shift+Tab` dentro do menu enquanto ele funcionar como sobreposição modal.
5. Fechar com `Escape`.
6. Fechar ao selecionar um item.
7. Fechar ao acionar o backdrop.
8. Ao fechar, devolver o foco ao botão que abriu o menu.
9. Aplicar `inert` ao conteúdo externo enquanto o menu estiver aberto; se for necessária compatibilidade sem `inert`, implementar fallback seguro.
10. Remover `inert` e restaurar o estado ao fechar ou ao mudar para largura desktop.
11. Não interferir na navegação desktop.
12. Respeitar `prefers-reduced-motion` nas animações.

Critério de aceite:

- o foco nunca alcança conteúdo atrás do menu aberto;
- `Escape` fecha e devolve o foco;
- `Tab` e `Shift+Tab` percorrem apenas os controles do menu;
- não há foco preso depois do fechamento ou redimensionamento.

#### C2. Melhorar a acessibilidade das avaliações

Arquivos: `index.html`, `script.js` e `styles.css`.

1. Dar ao componente um nome acessível claro.
2. Considerar `role="region"` com `aria-roledescription="carrossel"`, sem adicionar ARIA desnecessária.
3. Manter botões anterior e próxima com nomes claros.
4. Garantir que o contador em `aria-live` não gere anúncios excessivos durante rolagem manual.
5. Não mover o foco automaticamente ao mudar de avaliação.
6. Preservar estados `disabled` corretos.
7. Garantir que avaliações continuem disponíveis com JavaScript desabilitado ou que haja fallback textual adequado, quando viável.

Critério de aceite:

- o componente é compreensível por leitor de tela;
- pode ser operado somente por teclado;
- não produz anúncios repetitivos ou inesperados.

### Fase D — Imagens e Core Web Vitals

#### D1. Criar inventário antes da conversão

Arquivos: todos os HTMLs e `assets/`.

Para cada imagem efetivamente usada, registrar temporariamente:

- arquivo de origem;
- páginas onde aparece;
- dimensão original;
- dimensão aproximada de exibição em desktop e celular;
- uso informativo ou decorativo;
- posição acima ou abaixo da primeira dobra;
- formato de saída recomendado.

Não entregar arquivos temporários desnecessários no commit final.

#### D2. Redimensionar e converter imagens

1. Gerar WebP para fotos e imagens rasterizadas.
2. Avaliar AVIF apenas se a cadeia de ferramentas local for confiável e houver fallback adequado.
3. Para ícones atualmente com 1563×1563, gerar arquivos próximos do maior tamanho real de exibição, incluindo densidade 2x.
4. Não ampliar imagens pequenas.
5. Preservar qualidade visual de retratos e imagens clínicas.
6. Não sobrescrever os originais sem antes confirmar todas as referências e a qualidade do resultado.
7. Consolidar `arvore-integraser.jpg` e `logo-simbolo.jpg` em um único recurso publicado, atualizando as referências.
8. Remover arquivos antigos somente depois de confirmar que não são usados por HTML, CSS, JSON-LD, Open Graph ou documentação.

Critério de aceite:

- redução material do peso total transferido;
- nenhum ícone pequeno depende de imagem 1563×1563;
- não há imagens quebradas;
- aparência aprovada em tamanhos desktop e celular.

#### D3. Atualizar a marcação das imagens

Arquivos: os três HTMLs.

1. Adicionar `width` e `height` correspondentes à proporção intrínseca de todas as imagens.
2. Adicionar `decoding="async"` às imagens rasterizadas quando apropriado.
3. Usar `loading="lazy"` nas imagens abaixo da primeira dobra.
4. Não usar lazy loading na provável imagem LCP.
5. Adicionar `fetchpriority="high"` somente à provável imagem LCP da página inicial, após confirmar que ela é realmente a imagem crítica.
6. Adicionar `srcset` e `sizes` às fotos que variam significativamente de tamanho entre breakpoints.
7. Manter os `alt` existentes, revisando apenas se o arquivo visual mudar de conteúdo.
8. Imagens decorativas devem continuar com `alt=""` e não receber `aria-label` redundante.

Critério de aceite:

- nenhuma imagem causa mudança de layout por ausência de proporção conhecida;
- imagens abaixo da dobra não são carregadas imediatamente sem necessidade;
- a imagem LCP não é atrasada por lazy loading;
- `srcset` entrega arquivos proporcionais ao dispositivo.

#### D4. Criar ícones locais do site

1. Criar favicon em SVG ou PNG adequado.
2. Adicionar versões 32×32 e 16×16 somente se necessárias.
3. Criar `apple-touch-icon`.
4. Atualizar os três HTMLs de forma consistente.
5. Não criar manifest nesta etapa, a menos que haja uma finalidade definida para instalação/PWA.

Critério de aceite:

- ícones existem e usam caminhos locais válidos;
- não há favicon JPEG desnecessariamente pesado;
- as três páginas usam o mesmo conjunto de ícones.

### Fase E — SEO local que não depende do domínio

#### E1. Adicionar entidades `Person` verificáveis

Arquivo principal: `colaboradores.html`.

1. Criar uma entidade `Person` para cada profissional usando exclusivamente dados visíveis na página.
2. Relacionar cada pessoa ao Espaço IntegraSer por `worksFor` usando o `@id` já definido para a organização.
3. Incluir `name`, `jobTitle`, `image` e credenciais somente quando já publicadas no conteúdo.
4. Não inventar `sameAs`, redes sociais, universidades, especializações ou números de conselho.
5. Manter o `CollectionPage` e o `BreadcrumbList` existentes.

Critério de aceite:

- o JSON continua válido;
- dados estruturados e conteúdo visível não divergem;
- todas as referências internas de `@id` são consistentes, mesmo ainda usando o domínio marcador.

#### E2. Revisar dados do negócio sem inventar campos

Arquivo principal: `index.html`.

1. Manter endereço, telefone, mapa, serviços e coordenadas já confirmados no conteúdo.
2. Não adicionar horários de atendimento, faixa de preço, formas de pagamento ou redes sociais sem confirmação.
3. Não adicionar `aggregateRating` baseado nas avaliações exibidas sem validar as políticas atuais do Google para negócios locais e conteúdo de terceiros.
4. Manter FAQ estruturada sincronizada com o texto visível.

Critério de aceite:

- todo dado estruturado pode ser verificado no conteúdo ou em informação fornecida pelo responsável;
- nenhuma marcação tenta obter resultado enriquecido de maneira incompatível com as políticas aplicáveis.

### Fase F — Testes e revisão final local

#### F1. Testes estáticos obrigatórios

1. Procurar imagens sem `alt`.
2. Procurar IDs duplicados.
3. Verificar que todo `aria-labelledby` aponta para ID existente.
4. Validar os três blocos JSON-LD como JSON.
5. Verificar referências locais de `href` e `src`.
6. Conferir que não foram introduzidos caminhos absolutos locais.
7. Confirmar que `DOMINIO-DO-SITE.example` permanece apenas nos locais já destinados à futura troca e em documentação explicativa.

#### F2. Testes manuais obrigatórios

Executar nas três páginas:

1. Percorrer toda a interface com `Tab` e `Shift+Tab`.
2. Abrir e fechar menu com teclado.
3. Fechar menu com `Escape`.
4. Confirmar retorno correto do foco.
5. Acionar accordions com teclado.
6. Operar avaliações com teclado.
7. Testar zoom de 200% e, quando possível, 400%.
8. Testar largura equivalente a 320 CSS pixels.
9. Testar `prefers-reduced-motion: reduce`.
10. Confirmar que nenhum texto fica cortado ou sobreposto.
11. Conferir foco em fundos claros e escuros.

#### F3. Ferramentas automatizadas, se disponíveis localmente

Executar sem instalar dependências globais desnecessárias:

- Lighthouse;
- axe;
- validador HTML;
- verificador de links;
- ferramenta de contraste.

Metas orientativas, não substitutas dos testes manuais:

- Lighthouse Acessibilidade: 100, salvo limitação documentada;
- Lighthouse SEO: 100, desconsiderando apenas itens que dependam do domínio ainda não contratado;
- nenhum problema crítico ou sério no axe;
- nenhum erro de HTML que altere semântica ou árvore de acessibilidade.

## 6. Trabalho adiado até a contratação do domínio

Domínio definido para futura publicação: `https://www.integraserguara.com.br`.

Não executar agora. Manter como checklist de go-live:

### Domínio e infraestrutura

- contratar e registrar `integraserguara.com.br`;
- configurar `www.integraserguara.com.br` como host canônico;
- decidir o comportamento de `integraserguara.com.br` sem `www`;
- configurar redirecionamento permanente 301 de uma versão para a outra;
- configurar DNS conforme a hospedagem;
- emitir e validar certificado TLS;
- forçar HTTPS;
- garantir uma única versão indexável de cada URL;
- configurar página 404 com resposta HTTP 404 real;
- configurar cache, compressão Brotli/Gzip e cabeçalhos de segurança na hospedagem.

### Alterações no código no momento da publicação

- substituir globalmente `https://DOMINIO-DO-SITE.example` por `https://www.integraserguara.com.br`, sem barra final no valor-base;
- atualizar canonical das três páginas;
- atualizar `og:url`, `og:image`, Twitter Cards e todos os `@id`/URLs do JSON-LD;
- atualizar `robots.txt`;
- atualizar todas as URLs de `sitemap.xml`;
- atualizar `lastmod` com datas reais de alteração;
- decidir se as URLs finais manterão `.html`; se a hospedagem usar URLs limpas, atualizar navegação, canonical, sitemap e redirecionamentos em conjunto;
- remover comentários e documentação de placeholder que deixarem de ser necessários.

### Ferramentas externas após publicação

- criar e validar propriedade no Google Search Console;
- preferir propriedade de domínio quando o DNS estiver disponível;
- enviar `https://www.integraserguara.com.br/sitemap.xml`;
- solicitar indexação das três páginas principais;
- testar robots e canonicals pela inspeção de URL;
- validar Rich Results Test e Schema Markup Validator com URLs públicas;
- testar Open Graph e compartilhamento social;
- cadastrar ou revisar o site no Perfil da Empresa no Google;
- confirmar consistência de nome, endereço e telefone entre site e Perfil da Empresa;
- configurar ferramenta de métricas somente após decisão sobre privacidade, consentimento e finalidade.

### Critérios de aceite do go-live

- `https://www.integraserguara.com.br` responde com HTTPS válido;
- a versão sem `www` redireciona em um único salto para a versão canônica;
- todas as páginas públicas respondem 200;
- páginas inexistentes respondem 404;
- nenhum HTML público contém `DOMINIO-DO-SITE.example`;
- canonical, sitemap, Open Graph e JSON-LD apontam para URLs públicas corretas;
- o sitemap é aceito pelo Search Console;
- não há bloqueio acidental de indexação.

## 7. Entrega esperada do agente executor

Ao final, o agente deve fornecer:

1. lista objetiva dos arquivos modificados;
2. resumo das correções por fase;
3. comparação de peso das imagens antes e depois;
4. resultados de contraste relevantes;
5. testes automatizados executados e seus resultados;
6. testes manuais executados;
7. limitações encontradas;
8. confirmação explícita de que as tarefas de domínio permaneceram adiadas;
9. lista curta de qualquer decisão que ainda dependa do responsável pelo site.

## 8. Definição de pronto desta fase

Esta fase estará concluída quando:

- a hierarquia de títulos estiver coerente;
- a página atual estiver identificada no menu;
- textos e controles atenderem aos contrastes WCAG AA aplicáveis;
- todo elemento interativo possuir foco visível;
- o menu móvel funcionar integralmente por teclado e gerenciar o foco;
- avaliações forem operáveis e compreensíveis por tecnologia assistiva;
- imagens tiverem dimensões, carregamento e formatos adequados;
- não houver imagens quebradas ou perda visual perceptível;
- os dados estruturados locais forem válidos e fiéis ao conteúdo;
- os testes locais não apresentarem problemas críticos;
- nenhuma ação dependente do domínio tiver sido executada prematuramente.
