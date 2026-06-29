## Problema

O build do publish está falhando com 3 erros de parse em `src/components/admin/Toast.tsx`:

- `Duplicated export 'ToastContainer'`
- `Duplicated export 'useToast'`
- `Duplicated export 'Alert'`

O arquivo tem **330 linhas** e contém **duas versões do mesmo módulo concatenadas** — provavelmente resultado de um merge mal resolvido vindo do GitHub (outra IA editou em paralelo). As linhas 1–171 são a versão nova (com GIF da árvore nos erros). As linhas 173–330 são a versão antiga repetindo todos os mesmos exports (`ToastType`, `ToastItem`, `CONFIG`, `Toast`, `ToastContainer`, `useToast`, `Alert`).

Por isso o Lovable não consegue publicar: o bundler interrompe antes mesmo de chegar ao deploy.

## Correção

Remover as linhas 173–330 de `src/components/admin/Toast.tsx`, mantendo apenas a versão nova (1–171), que já contém todos os exports necessários (`ToastType`, `ToastItem`, `ToastContainer`, `useToast`, `Alert`).

Depois rodar o build local para confirmar que volta a passar — aí o Publish funciona normalmente.

## Por que aconteceu

Você está editando o repositório por várias IAs em paralelo. Quando duas alterações tocam o mesmo arquivo e o merge no GitHub não escolhe um lado limpo, o conteúdo das duas versões pode acabar empilhado no arquivo. Vale conferir, depois desta correção, se algum outro arquivo recente tem o mesmo sintoma (imports duplicados, funções declaradas duas vezes).
