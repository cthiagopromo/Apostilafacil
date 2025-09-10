# Documentação Técnica: Módulo de Exportação

Este documento detalha as funções e a lógica responsáveis pela funcionalidade de exportação da apostila para um formato offline.

---

## Ficha Técnica de Função

### `handleExportZip`

**Assinatura**: `const handleExportZip = async (params: ExportParams): Promise<void>`

**Localização**: `/src/lib/export.ts`

**Propósito**: Gera um arquivo `.zip` contendo a apostila completa como um site offline (`index.html`), com todo o conteúdo, estilos e scripts interativos necessários para funcionar de forma autônoma em um navegador.

---

#### Parâmetros

-   **`params`** (`ExportParams` - Objeto): Um objeto contendo todos os dados e funções de callback necessários para a exportação.
    -   `projects`: Array de objetos `Project`.
    -   `handbookTitle`: `string`.
    -   `handbookDescription`: `string`.
    -   `handbookId`: `string`.
    -   `handbookUpdatedAt`: `string`.
    -   `handbookTheme`: Objeto `Theme`.
    -   `setIsExporting`: `(isExporting: boolean) => void`.
    -   `toast`: Função para exibir notificações.

---

#### Retorno

-   **Tipo**: `Promise<void>`
-   **Descrição (Sucesso)**: A função não retorna um valor. Seu resultado é o acionamento do download de um arquivo `.zip` no navegador do usuário e a exibição de uma notificação de sucesso.
-   **Descrição (Erro)**: Captura exceções, exibe uma notificação de erro detalhada e garante que o estado de "exportando" seja desativado.

---

#### Dependências e Efeitos Colaterais

-   **Dependências Internas**:
    -   `renderProjectsToHtml()`
    -   `renderBlockToHtml()`
    -   `getGlobalCss()`
    -   `getInteractiveScript()`
-   **Dependências Externas**:
    -   `jszip`: Para criar o arquivo `.zip`.
    -   `file-saver`: Para iniciar o download do arquivo no navegador.
-   **Efeitos Colaterais**:
    -   Modifica o estado da UI através da função `setIsExporting`.
    -   Aciona o download de um arquivo no navegador.
    -   Exibe notificações na interface do usuário.

---

#### Exemplo de Uso

```javascript
// Chamada dentro de um componente React

const [isExporting, setIsExporting] = useState(false);
const { toast } = useToast();
const { projects, handbookTitle /* ... */ } = useProjectStore();

const onExportClick = async () => {
  await handleExportZip({ 
      projects, 
      handbookTitle, 
      // ...outros dados da apostila
      setIsExporting,
      toast 
  });
}
```
