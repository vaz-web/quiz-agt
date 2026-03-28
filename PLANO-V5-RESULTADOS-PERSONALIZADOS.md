# PLANO V5 — Resultados Hiperpersonalizados + Gráfico + Bônus Intersticial

## Visão Geral

3 frentes de trabalho, executadas em sequência:
1. **Gráfico de Evolução** (ResultScreen) — "Você está aqui → Onde pode chegar"
2. **Bloco de Custo da Inação personalizado** (ResultScreen) — números reais por faixa
3. **Bônus Intersticial** (QuizScreen) — tela dedicada entre perguntas

---

## FASE 1: Gráfico de Evolução Patrimonial (ResultScreen)

### O que é
Um gráfico de área com duas curvas (12 meses):
- **Curva cinza** ("Sem método"): patrimônio rendendo CDI (~1% a.m.)
- **Curva dourada** ("Com AGT"): patrimônio crescendo com estratégia de opções

Valores calculados dinamicamente a partir da resposta de patrimônio (Q6, answers[4]).

### Mapeamento de valores base (patrimônio)

| Resposta Q6 | Faixa | Valor base usado |
|-------------|-------|-----------------|
| A | < R$ 10k | R$ 5.000 |
| B | R$ 10k–100k | R$ 50.000 |
| C | R$ 100k–500k | R$ 250.000 |
| D | R$ 500k–1M | R$ 750.000 |
| E | > R$ 1M | R$ 1.500.000 |

### Taxas de simulação

| Cenário | Taxa mensal | Justificativa |
|---------|-------------|---------------|
| Sem método (CDI) | 0.9% a.m. | CDI médio 2024/2025 |
| Com AGT (conservador) | 2.5% a.m. | Operações com opções, retorno conservador |

> **Disclaimer obrigatório**: "Simulação ilustrativa baseada em médias históricas. Resultados passados não garantem retornos futuros."

### Cálculo do gap em 12 meses

Exemplo para patrimônio C (R$ 250k):
- Sem método: R$ 250k × (1.009)^12 = ~R$ 278.400 (+R$ 28.400)
- Com AGT: R$ 250k × (1.025)^12 = ~R$ 334.700 (+R$ 84.700)
- **Gap: ~R$ 56.300 deixados na mesa**

### Implementação técnica

- Componente `EvolutionChart` usando Recharts (AreaChart)
- Dados gerados por função `generateProjection(baseValue, months=12)`
- Animação: curvas desenham progressivamente com delay entre elas
- Badge no gap final: "R$ XX.XXX" pulsando em accent
- Posição no layout: **ENTRE o Hero e o Loss Frame** (novo bloco 1.5)
- Para leads com patrimônio A (< R$10k): trocar gráfico de valor absoluto por gráfico de **% de crescimento** com foco no tempo (eixo Y = %, não R$)

### Variação por perfil

| Perfil | Label curva AGT | Tom |
|--------|----------------|-----|
| C (Iniciante) | "Com proteção + método" | Segurança |
| M (Moderado) | "Com estratégia estruturada" | Consistência |
| A (Arrojado) | "Com assimetria otimizada" | Escala |

---

## FASE 2: Bloco de Custo da Inação Personalizado

### O que muda
O bloco de Loss Frame atual (seção 2) usa copy genérica por potencial. Vamos substituir por **números calculados reais** baseados no patrimônio + renda do lead.

### Nova estrutura do bloco

```
┌─────────────────────────────────────────────┐
│ ⚠️  O que você está deixando na mesa         │
│                                             │
│  Com R$ 250k investidos, nos últimos 12     │
│  meses você pode ter deixado de capturar:   │
│                                             │
│  ┌─────────────────────────────────┐        │
│  │   R$ 56.300                     │        │
│  │   em rentabilidade adicional    │        │
│  └─────────────────────────────────┘        │
│                                             │
│  Isso equivale a:                           │
│  · 7.5 meses da sua renda                   │
│  · 2.3% a.m. que ficou na mesa              │
│                                             │
│  (copy personalizada por perfil)            │
└─────────────────────────────────────────────┘
```

### Copy matrix (perfil × potencial)

**Elite (patrimônio ≥ 100k):**
- "Com o patrimônio que você já construiu, cada mês sem uma estratégia de proteção com opções representa de R$ {gapMensal} a R$ {gapMensal×2} que ficam na mesa. Em 12 meses, isso é R$ {gap12m}."

**Alto (renda > 20k ou patrimônio 10k-100k):**
- "Sua renda te dá uma vantagem que a maioria não tem: capacidade de aportar com consistência. Sem método, cada aporte rende {cdiRate}. Com estratégia, a mesma grana pode render {agtRate}."

**Médio (renda 3k-20k):**
- "Com disciplina pra investir R$ {aporteEstimado}/mês da sua renda, em 12 meses com CDI você teria R$ {valorCdi}. Com o método: R$ {valorAgt}. Diferença: R$ {gap}."

**Baixo (renda ≤ 3k, capital < 10k):**
- "O maior custo agora não é perder dinheiro — é perder tempo. Cada mês sem método é um mês que seu capital não está compondo. Com R$ {capital} trabalhando direito, em 12 meses a diferença começa a R$ {gap} e só cresce."

### "Equivale a" — comparações relativas

Para gerar impacto emocional, calcular automaticamente:
- Gap em meses de renda: `gap12m / rendaMensal`
- Gap em % do patrimônio: `(gap12m / patrimonio) × 100`
- Gap por dia: `gap12m / 365` → "R$ XX por dia que não volta"

### Para faixas baixas (< R$ 10k):
Em vez de mostrar gap de valor (que seria pequeno e não impressiona), focar em:
- % de crescimento potencial (ex: "seu capital poderia ter crescido 35% em vez de 11%")
- Comparação temporal: "a diferença entre 5 anos pra independência vs 15 anos"

### Implementação técnica

- Função `calculateInactionCost(patrimonio, renda, profile)` em novo arquivo `src/data/projections.ts`
- Componente `InactionCostBlock` que substitui o loss frame genérico
- CountUp animation nos números grandes (já temos useCountUp)
- Aceitar variáveis: gap12m, gapMensal, rendaMeses, gapPct

---

## FASE 3: Bônus Intersticial (QuizScreen)

### Problema atual
Toast overlay não-bloqueante: quiz avança por baixo, bônus aparece por 1.5s e some. Pessoa não percebe valor.

### Solução: Tela intersticial com controle do usuário

```
┌─────────────────────────────────────────────┐
│              Pergunta 7 de 10               │
│  ████████████████████░░░░░░░  70%           │
│                                             │
│                                             │
│         🎯  BÔNUS DESBLOQUEADO              │
│              ─── BRONZE ───                 │
│                                             │
│  "Os 3 Erros Que Custam Caro a             │
│   Investidores Iniciantes"                  │
│                                             │
│  Vídeo exclusivo revelando os 3 erros       │
│  que custam mais caro — e como evitá-los.   │
│                                             │
│  ┌─────────────────────────────────┐        │
│  │  ✓  Garantido — entregue no    │        │
│  │     final do diagnóstico       │        │
│  └─────────────────────────────────┘        │
│                                             │
│       [ Continuar diagnóstico → ]           │  ← aparece após 2s
│                                             │
└─────────────────────────────────────────────┘
```

### Mecânica

1. Lead responde Q6 (patrimônio) → `advance()` detecta bônus desbloqueado
2. Em vez de ir pra Q7 direto, **renderiza tela intersticial do bônus**
3. Tela do bônus tem:
   - Header do quiz (progress bar + "Pergunta X de 10") mantido pra contexto
   - Animação de entrada rica (ícone com spring, texto fade-up)
   - Badge do tier com cor (bronze/silver/gold)
   - Título + descrição do bônus
   - Nota "Garantido — entregue no final" pra não gerar ansiedade
   - Botão "Continuar diagnóstico →" que aparece após **2 segundos**
4. Lead clica "Continuar" → Q7 faz stagger reveal normalmente
5. Mesmo fluxo se ganhar Silver/Gold após Q7

### Timing

- 0ms: tela intersticial aparece com animação
- 0-2000ms: botão não existe ainda (lead é forçado a ler)
- 2000ms: botão "Continuar" faz fade-in
- Lead clica quando quiser → próxima pergunta

### Vantagens vs abordagens anteriores

| Aspecto | Bloqueante (V2) | Toast (V4) | Intersticial (V5) |
|---------|-----------------|------------|-------------------|
| Percepção de valor | ✅ Alta | ❌ Baixa | ✅ Alta |
| Controle do lead | ❌ Timer fixo | ❌ Some sozinho | ✅ Lead decide |
| Fluidez | ❌ Trava | ✅ Sem pausa | ✅ Pausa controlada |
| Mobile friendly | ⚠️ Overlay | ⚠️ Toast pequeno | ✅ Tela cheia |

### Implementação técnica

- Novo componente `BonusInterstitial` (renomear/refatorar BonusUnlockBanner)
- QuizScreen: novo estado `pendingBonus: string | null`
- Se `pendingBonus` existe, renderiza `BonusInterstitial` em vez das opções
- Quando lead clica "Continuar", limpa `pendingBonus` e faz `doAdvance()`
- Manter haptic feedback (vibrate) + som

---

## ORDEM DE EXECUÇÃO

| # | Tarefa | Arquivos | Estimativa |
|---|--------|----------|------------|
| 1 | Criar `src/data/projections.ts` | Novo | Lógica de projeção |
| 2 | Criar componente `EvolutionChart` | Novo | Recharts AreaChart |
| 3 | Criar componente `InactionCostBlock` | Novo | Bloco custo da inação |
| 4 | Integrar no `ResultScreen.tsx` | Editar | Substituir loss frame, inserir gráfico |
| 5 | Criar componente `BonusInterstitial` | Novo (ou refatorar Banner) | Tela dedicada |
| 6 | Refatorar `QuizScreen.tsx` | Editar | Mecânica intersticial |
| 7 | Type check + teste visual mobile/desktop | — | Validação |
| 8 | Commit + push | — | — |

---

## RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Números de rentabilidade parecem golpe | Alto — perde credibilidade | Usar taxas conservadoras (2.5% a.m.), disclaimer visível, comparar com CDI real |
| Gráfico pesado em mobile | Médio — performance | Recharts é leve, limitar a 12 pontos, lazy load se necessário |
| Copy repetitiva entre gráfico e bloco | Médio — cansativo | Gráfico = visual/numérico, Bloco = emocional/comparativo. Funções diferentes. |
| Intersticial do bônus irrita | Médio — desistência | Botão aparece em 2s (rápido), e é só 1-2 vezes no quiz todo |
| Patrimônio A (< R$10k) tem gap pequeno | Médio — não impressiona | Usar % em vez de R$ absoluto, foco em aceleração temporal |

---

## CRITÉRIOS DE ACEITE

- [ ] Gráfico renderiza com valores corretos para todas as 5 faixas de patrimônio
- [ ] Bloco de custo mostra R$ calculado dinamicamente (não hardcoded)
- [ ] Copy varia por perfil × potencial (testar pelo menos 4 combinações)
- [ ] Bônus intersticial bloqueia opções por 2s, depois mostra "Continuar"
- [ ] Funciona em 390px mobile sem scroll no intersticial
- [ ] Disclaimer de simulação visível no gráfico
- [ ] Zero erros no console
- [ ] TypeScript compila sem erros
