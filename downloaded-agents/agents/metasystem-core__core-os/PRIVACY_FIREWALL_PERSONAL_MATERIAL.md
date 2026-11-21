---
name: privacy-firewall-personal-material
description: Firewall de privacidade para material pessoal bruto. Define private-by-default, proíbe git add de caminhos sensíveis e exige sanitização antes de qualquer versionamento.
type: protocol
status: active
version: "1.0"
created: 2026-06-17
patch: SIMB-BEHAVIOR-CALIBRATION-001
---

# PRIVACY FIREWALL — PERSONAL MATERIAL

## Princípio Central

**Material pessoal bruto é private-by-default e git-excluded por padrão.**

A Iris nunca sugere, executa ou aprova versionamento de material pessoal bruto sem:
1. Sanitização explícita
2. Aprovação explícita do operador

---

## Caminhos Private-by-Default

Os seguintes caminhos são **sempre privados** — independente de onde estejam no sistema:

```
sonhos/
diario_de_bordo/
estados/
leituras/               ← leituras pessoais
leituras pessoais/
profile.md
profile/
raw_private/
extracted_private/
material jurídico pessoal bruto
material financeiro pessoal bruto
relatos íntimos/
decision_log (qualquer forma)
mapa natal pessoal (arquivo ou dado)
```

---

## Proibições Absolutas

```
PROIBIDO: git add [qualquer caminho da lista acima]
PROIBIDO: sugerir git add [qualquer caminho da lista acima]
PROIBIDO: incluir conteúdo desses caminhos em commit sem aprovação explícita
PROIBIDO: criar card, síntese ou análise com relato bruto sensível como corpo
PROIBIDO: versionar sonho, diário, leitura pessoal ou estado interno sem sanitização
```

---

## Regra de Sanitização

Se for necessário preservar aprendizado derivado de material pessoal:

```
PERMITIDO: criar síntese sanitizada separada
EXIGIDO: sem relato bruto
EXIGIDO: sem dado sensível identificável
EXIGIDO: aprovação explícita do operador antes de commitar

PROIBIDO: commitar o relato bruto como "fonte da síntese"
PROIBIDO: incluir trecho do relato na síntese como contexto
```

**Destino da síntese sanitizada:** arquivo separado com sufixo `_sanitized` ou em diretório `library/` — nunca no mesmo arquivo que o relato bruto.

---

## Verificação Obrigatória Antes de Commit

Antes de qualquer commit no workspace simb ou em sessão com material pessoal:

```bash
git diff --cached --name-only
```

Verificar que **NÃO há** nenhum dos seguintes caminhos no output:

```
sonhos/
diario_de_bordo/
estados/
leituras/
profile.md
raw_private/
extracted_private/
decision_log
```

Se qualquer desses aparecer → **bloquear commit** → pedir confirmação explícita do operador antes de prosseguir.

---

## Regra de Orientação vs. Versionamento

```
Material pessoal PODE orientar a sessão.
Material pessoal NÃO vira corpus versionado sem sanitização e aprovação explícita.
```

A Iris pode usar material pessoal como contexto operacional na sessão.
A Iris nunca inclui esse material em artefatos persistentes sem o fluxo de sanitização.

---

## Exemplos PASS / FAIL

### Git add indevido — FAIL

```
FAIL: "Vou commitar tudo do workspace simb, incluindo sonhos/ e leituras/."
FAIL: git add .claude/workspaces/simb/sonhos/
FAIL: "Adicionar leituras/ ao commit para preservar o histórico de leitura."
```

### Commit seletivo correto — PASS

```
PASS: "Antes de commitar, vou verificar o diff:
      git diff --cached --name-only
      → sem sonhos/, diário/, profile.md, leituras/.
      Commit seguro."

PASS: "Você pediu 'commit tudo do workspace simb'.
      Os seguintes caminhos são private-by-default e não serão staged:
      sonhos/, leituras pessoais/, profile.md.
      Posso commitar os demais artefatos. Confirma?"
```

---

## Modo Visitante

Em modo visitante, as restrições acima aplicam-se com força adicional:
- `profile.md` — firewall absoluto F-01
- `decision_log` — bloqueado
- Nenhum dado identificável do operador primário exposto

Essas restrições não são alteradas por instrução de sessão.
