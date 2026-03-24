# PLANO DE OTIMIZAÇÃO V4 — Quiz UX & Mobile
## 23/03/2026

---

## OBJETIVO
Forçar leitura antes do clique, eliminar delays percebidos nos bônus, garantir responsividade mobile impecável.

---

## 1. STAGGER REVEAL — Opções aparecem em sequência

### 1.1 Timing
| Parâmetro | Atual | Novo |
|-----------|-------|------|
| Delay antes das opções | 0ms | 400ms |
| Stagger entre opções | 60ms | 120ms |
| Total (5 opções) | ~0.3s | ~1.0s |
| Total (3 opções) | ~0.18s | ~0.76s |
| Máximo absoluto | ~0.6s | ~1.2s (6 opções Q6/Q10) |

### 1.2 Comportamento
- Pergunta (título) aparece **imediatamente** com animação slide
- Opções começam com `opacity: 0` + `pointer-events: none` → sem clique fantasma
- Cada opção faz fade-up sequencial (0.12s entre cada)
- Ao voltar com "Voltar": delay = 0, stagger = 60ms (a pessoa já leu)
- Multi-select (Q10): mesmo stagger, chips entram em sequência

### 1.3 Animação das opções
- `initial: { opacity: 0, y: 16 }` → `animate: { opacity: 1, y: 0 }`
- `transition: { duration: 0.25, ease: "easeOut" }`
- Opção fica clicável apenas após sua animação completar

### 1.4 Aceite
- Pergunta 1 (4 opções): título aparece, 0.4s depois opções entram uma a uma, tudo visível em ~0.9s
- Voltar da Q5 → Q4: opções aparecem instantaneamente
- Impossível clicar em opção que ainda não apareceu

---

## 2. UNDERLINE ANIMADO NA PERGUNTA

### 2.1 Design
- Linha de 2px, cor `accent/30`, posicionada embaixo do título da pergunta
- Animação: `scaleX(0) → scaleX(1)` da esquerda pra direita
- Duração: 0.4s (sincronizada com o delay das opções — a linha "preenche" enquanto as opções não aparecem)
- `transform-origin: left`

### 2.2 Implementação
- Pseudo-element via div extra dentro do `<h2>` da pergunta
- Usa Framer Motion para animar `scaleX`
- Aparece junto com a pergunta, termina quando primeira opção começa a surgir

### 2.3 Aceite
- Linha dourada sutil aparece embaixo da pergunta, "desenha" L→R em 0.4s
- Visualmente guia o olho pra ler a pergunta antes das opções

---

## 3. TIPOGRAFIA DA PERGUNTA — Melhor quebra de linha

### 3.1 Mudanças
| Propriedade | Atual | Novo |
|------------|-------|------|
| Tamanho mobile | `text-2xl` (24px) | `text-xl` (20px) |
| Tamanho desktop | `sm:text-3xl` (30px) | `sm:text-2xl` (24px) |
| Max-width | nenhum | `max-w-lg` (32rem) |
| Line-height | `leading-snug` (1.375) | `leading-relaxed` (1.625) |

### 3.2 Resultado esperado
- Menos quebras estranhas em 390px viewport
- Mais espaço de respiro entre linhas
- Texto não encoste nas bordas laterais (max-w-lg centraliza)

### 3.3 Aceite
- Nenhuma pergunta corta palavra no meio em viewport 390px
- Texto legível e com boa distribuição de linhas

---

## 4. BONUS BANNER — Toast overlay (não bloqueia quiz)

### 4.1 Mudança de comportamento
| Aspecto | Atual | Novo |
|---------|-------|------|
| Duração | 2s + 300ms exit | 1.5s + 250ms exit |
| Bloqueia quiz | Sim (pendingAdvance) | **Não** — toast sobreposto |
| Próxima pergunta | Espera banner sair | Já carrega por baixo |
| Posição | Fixed bottom | Fixed bottom (mantém) |

### 4.2 Implementação
- Remover lógica de `pendingAdvance` do QuizScreen
- Banner vira puro overlay cosmético — `advance()` roda imediatamente
- Banner aparece e some sozinho em 1.5s enquanto a próxima pergunta já está visível
- O stagger das opções (0.4s delay) garante que a pessoa ainda vê o banner antes das opções aparecerem

### 4.3 Fluxo visual
```
[Responde Q7 (renda)] → Quiz avança pra Q8 imediatamente
                        ↓
              Banner "Bônus 1 Desbloqueado!" aparece como toast
              Pergunta Q8 aparece (título)
              Banner some em 1.5s
              Opções de Q8 começam a aparecer (stagger)
```

### 4.4 Aceite
- Zero delay percebido entre responder Q7 e ver Q8
- Banner aparece como recompensa visual sem interromper
- Não é possível perder o banner (aparece por cima do conteúdo)

---

## 5. RESPONSIVIDADE MOBILE — Audit completo

### 5.1 Touch targets
| Elemento | Atual | Mínimo |
|----------|-------|--------|
| Opções single-select | `p-4 sm:p-5` (~48px) | 48px ✓ já OK |
| Chips multi-select (Q10) | `px-4 py-2.5` (~40px) | `px-4 py-3` (48px) |
| Botão "Confirmar" | `h-14` (56px) | ✓ já OK |
| Botão "Voltar" | `px-3 py-2` (~36px) | `px-3 py-2.5` (44px+) |
| Collapsible headers ResultScreen | `p-5` | `p-5` ✓ já OK |

### 5.2 Fontes mínimas
| Elemento | Atual | Garantir |
|----------|-------|----------|
| Opções single-select | `text-sm sm:text-base` (14/16px) | ✓ OK |
| Chips multi-select | `text-sm sm:text-base` | ✓ OK |
| Curiosity hook | `text-[11px]` | Manter (é decorativo) |
| Progress hint | `text-sm` | ✓ OK |
| Bonus banner title | `text-sm` | ✓ OK |

### 5.3 Viewport 390px — Itens a verificar
- [ ] Chips Q10 não quebram em 2 linhas de forma estranha
- [ ] CTAs do ResultScreen cabem em uma linha
- [ ] Collapsible previews não truncam demais
- [ ] Sticky CTA tem safe-area padding
- [ ] Gauges do Hero não ficam apertados

### 5.4 Aceite
- Todos os elementos interativos ≥ 48px de touch target no mobile
- Nenhum texto de conteúdo abaixo de 14px
- Visual consistente entre 390px e 430px viewport

---

## 6. RESUMO DE ARQUIVOS AFETADOS

| Arquivo | Mudanças |
|---------|----------|
| `QuizScreen.tsx` | Stagger reveal, underline, tipografia, remover pendingAdvance |
| `BonusUnlockBanner.tsx` | Reduzir pra 1.5s, sem bloqueio |
| Nenhum arquivo novo | — |

---

## ORDEM DE EXECUÇÃO

```
1. QuizScreen — stagger reveal + pointer-events guard     (~15min)
2. QuizScreen — underline animado na pergunta              (~10min)
3. QuizScreen — tipografia (text-xl, max-w-lg, leading)   (~5min)
4. BonusBanner → toast overlay (remover pendingAdvance)    (~10min)
5. Mobile audit — touch targets, chips, viewport test      (~15min)
6. Teste visual 390px + desktop → commit + push            (~10min)
```

Total estimado: ~65min

---

## RISCOS

| Risco | Mitigação |
|-------|-----------|
| Stagger muito lento → frustração | 0.4s + 0.12s é rápido o bastante. Se "Voltar", delay = 0 |
| Underline distrai em vez de guiar | Cor accent/30 (sutil), 2px, desaparece com as opções |
| Banner toast some antes de ler | 1.5s é suficiente pra "Bônus Desbloqueado!" + título |
| Reduzir fonte da pergunta → perde impacto | Compensado por leading-relaxed e underline que dá peso visual |

---
*V4 — Otimização UX & Mobile. Aguardando aprovação antes de executar.*
