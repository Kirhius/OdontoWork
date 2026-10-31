# OdontoWork

Agenda diária pessoal (PWA) para lançar rápido os atendimentos, retornos e avaliações do dia. Tudo fica no **localStorage do navegador**: não há banco de dados externo nem login.

## Telas

- **Atendimentos**: agenda do dia em ordem de horário. Botão `+` para adicionar Atendimento, Retorno ou Avaliação; toque em um item para consultar ou editar; `$` marca como pago pela clínica; a borda esquerda leva a cor da clínica.
- **Visão geral**: dia, semana ou mês, com totais (lançamentos, pagos, a receber), contagem por clínica e lista por dia.
- **Configurações**: Procedimentos, Relatórios (PDF e Excel), Clínicas (nome e cor) e Limpeza (excluir pacientes).

## Mudar a estética

- Cores: bloco `:root` em `app/globals.css`.
- Fontes: `app/layout.tsx`.
- Formato de botões, campos e cartões: bloco `@layer components` em `app/globals.css`.

## Rodar localmente

```bash
npm install
npm run dev
```

## Importante sobre os dados

Os dados ficam só no navegador usado. Limpar os dados do navegador apaga tudo, e não há sincronia entre celular e computador.
