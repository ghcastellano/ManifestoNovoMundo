# Manifesto Novo Mundo

> *"Estamos presos no desejo. Mas o que buscamos é conexão."*

Um manifesto interativo em 3D (Web/Tablet/Mobile) sobre o ciclo do desejo, o resgate da espontaneidade e da vida compartilhada, apoiado por evidências científicas e ferramentas práticas para criar grupos de colaboração sem foco em dinheiro.

## O que este projeto inclui

- **Cena 3D guiada por rolagem (`three-scene.js`)**: motor 3D próprio sem dependências externas que se transforma ao longo dos 7 capítulos — de um cristal solitário cercado por fragmentos de desejo até uma constelação harmônica e um círculo público de assinaturas.
- **O Manifesto em 6 Atos (`index.html`)**: elaboração completa das ideias centrais sobre desejo, contentamento, infância, individualismo e a alegria da doação.
- **Pare para Pensar (`data.js`)**: cartões interativos de contraste entre o roteiro automático da sociedade e o que realmente queremos.
- **O Núcleo da Felicidade**: exploração interativa dos 4 pilares (*Contentamento*, *Conexão*, *Pertencimento*, *Contribuição*) sincronizada com a cena 3D.
- **Base Científica**: 6 estudos reais e revisados por pares (Harvard Study of Adult Development, Brickman et al., Dunn et al., Holt-Lunstad et al., Kasser & Ryan, Robin Dunbar) com filtros temáticos.
- **Ideias de Movimento & Ferramentas Práticas**:
  - 6 formatos de ação sem dinheiro (*Sexta da Mesa Aberta*, *Clube do Brincar Adulto*, *Rota Compartilhada*, *Banco de Tempo & Escuta*, etc.)
  - **Gerador de Encontro Espontâneo** com convites prontos para copiar em 1 clique
  - **Baralho de Conversas Reais** com efeito 3D interativo
  - **Guia em 3 passos** para iniciar um Núcleo de Conexão no seu bairro ou prédio
- **Pacto Aberto & Mural de Signatários**: formulário de assinatura com persistência local (`localStorage`) e geração de cartão SVG para baixar e compartilhar.

## Como rodar localmente

Por não depender de build nem de pacotes externos, basta servir os arquivos com qualquer servidor HTTP estático:

```bash
python3 -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Como publicar na Vercel e abrir para assinaturas públicas globais

1. **Publicar na Vercel**:
   - Acesse [vercel.com/new](https://vercel.com/new), importe o repositório `ghcastellano/ManifestoNovoMundo` e clique em **Deploy** (nenhum comando de build é necessário; o `vercel.json` já está configurado).
2. **Persistência global de assinaturas (opcional)**:
   - Atualmente o mural salva novas assinaturas no navegador (`localStorage`) além das assinaturas fundadoras.
   - Para compartilhar todas as assinaturas entre todos os visitantes do mundo, conecte o formulário `#sign-form` em `main.js` a uma tabela gratuita no **Supabase** ou a uma **Vercel Serverless Function + Vercel KV / Postgres**.
