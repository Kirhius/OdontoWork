# OdontoWork

App teste (PWA) para controlar cadastro de pacientes, procedimentos concluídos e observações. Tudo fica salvo no **localStorage do navegador** — não existe banco de dados externo nem login.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel, clique em "New Project" e importe o repositório.
3. Framework Preset: Next.js (detectado automaticamente). Não é preciso configurar nenhuma variável de ambiente.
4. Deploy.

## Instalar como app (PWA)

Depois de publicado, abra o link no celular (Chrome/Safari) e use a opção "Adicionar à tela inicial" / "Instalar app".

## Importante sobre os dados

Como os dados ficam apenas no localStorage do navegador que você usar:
- Se limpar os dados do navegador, o histórico é perdido.
- Os dados **não sincronizam** entre celular e computador, nem entre navegadores diferentes.
- É um app de uso individual, pensado para teste.

## Estrutura

- `Cadastro` → cria um paciente só com o nome.
- `Pacientes` → lista e busca pacientes; ao abrir um paciente, duas abas:
  - `Procedimentos Concluídos`: lançamento manual (nome, local — dente/arcada/boca toda —, data), com lista e opção de excluir.
  - `Observações`: texto livre, com lista e opção de excluir.
- `Configurações`:
  - `Relatórios`: filtro por período e/ou nome do procedimento, visualização em lista, exportação em PDF ou Excel (.xlsx).
  - `Financeiro`: ainda vazio (placeholder para este teste).
