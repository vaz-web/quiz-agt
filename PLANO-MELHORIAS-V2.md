# PLANO DE MELHORIAS V2 — Com Sistema de Bônus
## Salvo em 23/03/2026

### FASE 1 — Fundação (fixes que tudo mais depende)
- 1.1 Máscara visual WhatsApp (11) 99999-9999
- 1.2 Campo nome → "Seu primeiro nome"
- 1.3 Touch targets mínimos (chips py-3, textos 12px min)
- 1.4 Fix "agora" → "em breve" na confirmação WhatsApp
- 1.5 Save state no localStorage (progresso + respostas)

### FASE 2 — Sistema de bônus (coração da mudança)
- 2.1 Estrutura de dados dos bônus (bonusSystem.ts)
  - Bônus 1: "Os 3 erros que custam caro" — todo mundo (após Q5)
  - Bônus 2: "Aula: Regra dos 10 tiros" — patrimônio>10k OU renda>3k OU já investe (~70%)
  - Bônus 3: "Sessão estratégica 1-a-1" — apenas alto/elite (~15-20%)
- 2.2 Tela de desbloqueio (componente novo — cofre/presente abrindo, 3-4s)
- 2.3 Integração no fluxo: Q5→Bônus1→Q6...Q8→Bônus2(se qualificou)→Q9
- 2.4 Counter de bônus no LeadCapture ("2 bônus + diagnóstico")
- 2.5 Bônus 3 no resultado (badge exclusivo alto/elite)

### FASE 3 — ResultScreen reorganizada
- 3.1 CTA primário logo após hero + gauges + loss frame
- 3.2 Seções de suporte como deep dive (colapsável/carrossel)
- 3.3 CTAs diferenciados (copy progressiva)
- 3.4 Ranking social ("Top X% dos perfis")

### FASE 4 — Processing Screen rica
- 4.1 Animação visual de análise (barras crescendo)
- 4.2 Mensagens personalizadas com contexto real
- 4.3 Estender pra 6.5 segundos
- 4.4 Step "Verificando seus bônus desbloqueados..."

### FASE 5 — WelcomeScreen + Quiz polish
- 5.1 Headline com loss aversion
- 5.2 Micro-animação no CTA
- 5.3 Blur progressivo mais dramático (20→12→6→2)
- 5.4 Progress indicator emocional

### FASE 6 — Social + Retenção
- 6.1 Share button no resultado
- 6.2 Keyboard/viewport handling no LeadCapture
- 6.3 Dados de bônus na mensagem WhatsApp pro atendente

### CONEXÃO ENTRE FASES
```
WELCOME → QUIZ → LEAD CAPTURE → PROCESSING → RESULTADO
  │         │          │             │            │
  Loss    Bônus 1    Counter      "Verificando   Bônus 3
  aversion Bônus 2   "X bônus +   bônus..."     (badge
           Save      diagnóstico"               exclusivo)
           state     Blur dramático
```
