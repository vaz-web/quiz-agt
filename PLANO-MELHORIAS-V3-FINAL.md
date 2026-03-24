# PLANO DE MELHORIAS V3 — FINAL (com riscos e mitigações)
## Quiz Diagnóstico AGT · 23/03/2026

---

## RISCOS IDENTIFICADOS E MITIGAÇÕES

| # | Risco | Impacto | Mitigação |
|---|-------|---------|-----------|
| R1 | Tela de bônus interrompe fluxo do quiz → abandono | Alto | Bônus inline (banner 1.5-2s dentro do quiz), não tela separada |
| R2 | Save state + bônus condicionais → inconsistência se mudar respostas | Médio | Nunca persistir bônus. Sempre recalcular como função pura das answers |
| R3 | Só primeiro nome → atendente não identifica lead no banco (15 "João") | Alto | Manter nome completo no form. Adicionar lead_id curto (6 chars) no código WhatsApp |
| R4 | UPDATE whatsapp_clicked sem lead ID no ResultScreen | Alto | INSERT deve retornar id (.select('id')), guardar no state, passar como prop |
| R5 | Loss frame com R$ exato sem fonte → perde credibilidade | Médio | Usar ranges ou percentuais de benchmark, não valores absolutos |
| R6 | Seções colapsáveis matam engagement antes do CTA | Médio | Manter seções-chave visíveis (Hero+Bônus+Dois Caminhos), colapsar só secundárias |
| R7 | IDs das questões ≠ posição no array → bônus no momento errado | Alto | Mapear por INDEX no array, não por ID. Patrimônio=index 5, Renda=index 6 |
| R8 | ALTER TABLE em prod + código novo = timing de deploy | Médio | Migration ANTES do deploy. Campos novos com DEFAULT, INSERT gradual |

---

## DECISÕES PENDENTES (precisam de resposta sua antes de executar)

- **D1**: Bônus 1 — o PDF/aula "Os 3 Erros" já existe ou eu crio um placeholder?
- **D2**: Bônus 2 — a "Aula Regra dos 10 Tiros" tem URL? Ou é promessa pro WhatsApp?
- **D3**: Bônus 3 — "Sessão 1-a-1" é real ou é gancho pro atendente agendar?
- **D4**: Nome completo ou primeiro nome? (Recomendo: manter completo, usar firstName só na copy)
- **D5**: Lead ID no código WhatsApp — `AGT-M-AL-B12-J4K9X2` — aprova esse formato?
- **D6**: Executar migration no Supabase agora ou só quando o código estiver pronto?

---

## FASE 1 — Fundação (pré-requisitos técnicos)
> Dependência: nenhuma. Tudo aqui desbloqueia as fases seguintes.

### 1.1 Máscara visual WhatsApp
- Input exibe `(11) 99999-9999` enquanto armazena só dígitos
- Regex atual `/^\d{10,11}$/` continua no submit
- **Aceite**: digitar "11999887766" exibe "(11) 99988-7766", submit salva "11999887766"

### 1.2 Touch targets e legibilidade mobile
- Chips Q11: mínimo `py-3 px-4`, font 14px
- Opções single-select: mínimo 48px altura
- Textos mínimo 12px em qualquer viewport
- **Aceite**: nenhum elemento interativo < 48px no mobile (390px viewport)

### 1.3 Save state (localStorage)
- Salvar progresso (current index) + respostas a cada questão
- Ao reabrir, perguntar "Continuar de onde parou?" com botão "Recomeçar"
- **Aceite**: fechar na Q7, reabrir → pergunta se quer continuar da Q7
- **Cuidado R2**: nunca salvar bônus calculados, só answers

### 1.4 Schema do banco (Supabase)
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_short_id text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bonuses_unlocked text[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bonus_code text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS renda_faixa text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS patrimonio_faixa text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quiz_completed_at timestamptz DEFAULT now();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_clicked boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign text;
```
- `lead_short_id`: 6 chars alfanumérico único (resolve R3)
- INSERT deve retornar `id` e `lead_short_id` via `.select()` (resolve R4)
- **Aceite**: migration roda sem erro, campos existem com defaults corretos
- **Timing R8**: executar migration ANTES de qualquer mudança no código

### 1.5 INSERT atualizado no Index.tsx
- `.insert({...}).select('id, lead_short_id')` — guardar no state
- Passar `leadId` como prop pro ResultScreen
- Adicionar campos: `bonuses_unlocked`, `bonus_code`, `renda_faixa`, `patrimonio_faixa`, `lead_short_id`
- **Aceite**: lead aparece no Supabase com todos os campos preenchidos

---

## FASE 2 — Sistema de Bônus (coração da gamificação)
> Dependência: Fase 1.4 (schema) e 1.5 (INSERT atualizado)

### 2.1 Estrutura de dados (`bonusSystem.ts`)
```
Bônus 1: "Os 3 Erros Que Custam Caro"
  → Qualificação: todo mundo (após index 6 — quando já respondeu patrimônio + renda)
  → ~100% qualifica
  → Decisão pendente D1: conteúdo real ou placeholder?

Bônus 2: "Aula: Regra dos 10 Tiros"
  → Qualificação: patrimônio > 10k (Q4 ≥ B) OU renda > 3k (Q5 ≥ B) OU experiência ≥ B (Q3)
  → ~70% qualifica
  → Decisão pendente D2: URL da aula?

Bônus 3: "Sessão Estratégica 1-a-1"
  → Qualificação: classifyPotential() === "alto" || "elite"
  → ~15-20% qualifica
  → Decisão pendente D3: real ou gancho?
```
- Função `calculateBonuses(answers)` → retorna `string[]`
- Função pura, sem side effects, recalculável a qualquer momento (resolve R2)
- **Aceite**: dado answers de teste, retorna bônus corretos pra cada cenário

### 2.2 Componente inline de desbloqueio (`BonusUnlockBanner.tsx`)
- Banner animado DENTRO do QuizScreen (não tela separada — resolve R1)
- Aparece entre questões, auto-dismiss em 2s
- Som de reward + haptic
- Badge bronze/prata (bônus 1/2). Ouro fica pra ResultScreen (bônus 3)
- **Aceite**: banner aparece, não interrompe fluxo, some sozinho

### 2.3 Integração no fluxo do quiz
Mapeamento por INDEX no array (resolve R7):
```
Index 0: Q1 (id:1)  — bolsa de valores
Index 1: Q2 (id:3)  — histórico
Index 2: Q3 (id:7)  — impedimento
Index 3: Q4 (id:2)  — R$500
Index 4: Q5 (id:9)  — decisão grande
Index 5: Q6 (id:4)  — patrimônio ← usado pra bônus
Index 6: Q7 (id:5)  — renda ← usado pra bônus
           ↓
      🎁 BÔNUS 1 (todos — após index 6)
           ↓
Index 7: Q8 (id:8)  — tempo por dia
           ↓
      🎁 BÔNUS 2 (se qualificou — após index 7)
           ↓
Index 8: Q9 (id:10) — resultado em 6 meses
Index 9: Q10 (id:11) — onde dinheiro está (multi-select)
           ↓
      LEAD CAPTURE
```
- **Aceite**: bônus 1 aparece após renda, bônus 2 após tempo dedicado

### 2.4 Counter de bônus no LeadCapture
- Texto dinâmico: "Seu diagnóstico + {n} bônus estão prontos"
- Bônus listados com ícone + título, mas borrados
- Blur revela conforme preenche campos
- **Aceite**: com 2 bônus, exibe "2 bônus"; com 1, "1 bônus"

### 2.5 Bônus 3 na ResultScreen
- Seção destacada antes do CTA para leads alto/elite
- Badge dourado + copy de exclusividade
- Para leads baixo/médio: seção não aparece
- **Aceite**: perfil elite vê bônus 3; perfil baixo não vê

---

## FASE 3 — ResultScreen reorganizada
> Dependência: Fase 2 (bônus precisam existir) e 1.5 (lead ID pra tracking)

### 3.1 Novo layout
```
HERO (perfil + gauges)
  ↓
LOSS FRAME (percentual/range, não valor absoluto — resolve R5)
  ↓
BÔNUS DESBLOQUEADOS (cards visuais — inclui bônus 3 se qualificou)
  ↓
DOIS CAMINHOS (com/sem método) ← mantém visível (resolve R6)
  ↓
🟢 CTA PRIMÁRIO ("Quero meu plano de ação gratuito")
  ↓
DEEP DIVE (colapsável — só secundárias):
  - Raio-X Financeiro
  - Análise de Assimetria
  - Você vs Média
  - Ponto Forte / Reframe
  ↓
RESULTADOS DO PERFIL
  ↓
🟡 CTA SECUNDÁRIO ("Garantir minha estratégia personalizada")
  ↓
🔴 CTA FINAL (FOMO — "Vagas limitadas esta semana")
```
- **Aceite**: CTA primário visível sem scroll em mobile (390px viewport)

### 3.2 Loss frame personalizado
- Baseado em patrimônio (Q4) e renda (Q5)
- Usa percentuais e ranges: "85% dos investidores com seu patrimônio rendem abaixo da inflação"
- Não usa valores absolutos fabricados (resolve R5)
- **Aceite**: cada tier tem copy diferente, nenhum afirma valor exato sem fonte

### 3.3 CTAs com copy progressiva
- CTA 1 (suave): "Quero meu plano de ação gratuito"
- CTA 2 (urgente): "Garantir minha estratégia personalizada"
- CTA 3 (FOMO): "Últimas vagas — falar com especialista agora"
- **Aceite**: 3 CTAs com copy distinta, todos apontam pro mesmo WhatsApp URL

### 3.4 Ranking social
- "Você está no Top X% dos perfis diagnosticados"
- elite=5%, alto=15%, medio=40%, baixo=70%
- **Aceite**: cada tier mostra percentual diferente

### 3.5 Seções colapsáveis (apenas secundárias)
- Raio-X, Assimetria, Comparação, Ponto Forte começam colapsadas
- Preview de 2 linhas + "Ver mais"
- Seções-chave (Hero, Loss Frame, Bônus, Dois Caminhos) ficam abertas
- **Aceite**: scroll total reduz ~40% vs atual, conteúdo disponível via tap

### 3.6 Tracking whatsapp_clicked
- Ao clicar qualquer CTA → `supabase.from('leads').update({ whatsapp_clicked: true }).eq('id', leadId)`
- Usa leadId passado como prop (resolve R4)
- **Aceite**: Supabase mostra `whatsapp_clicked = true` após clique

---

## FASE 4 — Mensagem WhatsApp codificada
> Dependência: Fase 2.1 (bônus calculados) e 1.4 (lead_short_id no banco)

### 4.1 Formato do código
```
AGT-{PERFIL}-{POTENCIAL}-B{BÔNUS}-{LEAD_ID}

PERFIL:    C | M | A
POTENCIAL: BX | MD | AL | EL
BÔNUS:     B1 | B12 | B123
LEAD_ID:   6 chars alfanumérico (ex: J4K9X2)

Exemplos:
  AGT-A-EL-B123-J4K9X2  → Arrojado, Elite, 3 bônus, ID J4K9X2
  AGT-C-MD-B1-T7R2P1    → Conservador, Médio, 1 bônus
```
- Decisão pendente D5: aprovar formato com lead_id?

### 4.2 Mensagem final
```
Olá! Sou {nome}, fiz o Diagnóstico AGT 🎯
Código: {bonus_code}
```
- **Aceite**: mensagem < 80 chars, código decifrável a olho nu

### 4.3 `generateBonusCode()` em bonusSystem.ts
- Recebe: profile, potential, bonuses[], leadShortId
- Retorna: string formatada
- **Aceite**: testes unitários passam pra todos os cenários

---

## FASE 5 — Processing Screen rica
> Dependência: Fase 2 (precisa saber quantos bônus pra step final)

### 5.1 Animação de análise visual
- Mini barras crescendo durante processamento
- **Aceite**: visualmente distinta da tela atual

### 5.2 Mensagens contextualizadas
- Referencia respostas reais (ex: "Analisando seus investimentos em ações e cripto...")
- **Aceite**: mensagens mudam baseado nas answers

### 5.3 Duração 6.5s + step de bônus
- Step final: "Verificando seus bônus desbloqueados..." com ícone de cofre
- **Aceite**: processing roda 6.5s, último step mostra contagem de bônus

---

## FASE 6 — WelcomeScreen + Quiz polish
> Dependência: nenhuma (pode rodar em paralelo com Fase 3)

### 6.1 Headline com loss aversion
- "Descubra o que seu perfil está deixando na mesa"
- **Aceite**: nova headline renderiza corretamente

### 6.2 Micro-animação CTA
- Shimmer/glow sutil no botão (já tem `animate-pulse-glow`, refinar)
- **Aceite**: animação visível mas não intrusiva

### 6.3 Blur progressivo mais dramático
- De: `Math.max(15 - filledCount * 3.5, 5)` → Para: `Math.max(20 - filledCount * 5, 2)`
- **Aceite**: diferença entre 0 e 3 campos preenchidos é visualmente óbvia

### 6.4 Progress indicator emocional
- Substituir "Pergunta X de 11" por micro-copy contextual
- **Aceite**: copy muda a cada 2-3 questões

### 6.5 Keyboard/viewport handling
- `visualViewport` API no LeadCapture
- **Aceite**: form fields acessíveis com teclado aberto no iOS/Android

---

## FASE 7 — Social + UTM
> Dependência: Fase 1.4 (campos utm no banco)

### 7.1 UTM tracking
- Capturar `utm_source` e `utm_campaign` da URL no mount
- Salvar no INSERT junto com lead
- **Aceite**: acessar `?utm_source=instagram&utm_campaign=test` → valores no banco

### 7.2 Share button (opcional/posterior)
- Card visual gerável com perfil
- Open Graph meta tags
- **Aceite**: compartilhar gera preview visual no WhatsApp

---

## ORDEM DE EXECUÇÃO

```
FASE 1 (Fundação)       → ~1.5h  — migration + INSERT + fixes
  ↓ desbloqueia tudo
FASE 2 (Bônus)          → ~2h    — bonusSystem + banner + integração quiz
  ↓ desbloqueia 3, 4, 5
FASE 4 (WhatsApp)       → ~30m   — generateBonusCode + mensagem
FASE 5 (Processing)     → ~45m   — animações + step de bônus
FASE 3 (ResultScreen)   → ~2.5h  — reorganização + CTAs + loss frame + tracking
FASE 6 (Polish)         → ~1h    — welcome + quiz + blur + keyboard
FASE 7 (UTM)            → ~20m   — utm params + share
```
Total estimado: ~8.5h

```
Grafo de dependências:

FASE 1 ──→ FASE 2 ──→ FASE 3
  │            │          │
  │            ├──→ FASE 4 (WhatsApp)
  │            └──→ FASE 5 (Processing)
  │
  └──→ FASE 7 (UTM)

FASE 6 ──→ (independente, paralela)
```

---
*V3 Final — com riscos, mitigações, critérios de aceite, dependências, e decisões pendentes.*
