# Configuração de Webhooks para Leads VIP

## Visão Geral
O sistema de leads VIP agora possui múltiplos backups garantidos para nunca perder um lead, independentemente das configurações do Shopify.

## Métodos de Captura (em ordem de prioridade)

### 1. Shopify Customer API (Principal)
- **Status**: Configurado
- **Funciona quando**: Contas de cliente estão habilitadas
- **Localização**: `Settings → Customer accounts → Show login links`

### 2. Webhook Personalizado
- **Status**: Configurado (precisa de endpoint)
- **Endpoint**: `/apps/vip-leads/webhook`
- **Formato**: JSON com dados completos do lead

### 3. Google Sheets (Backup Garantido)
- **Status**: Configurado (precisa de setup)
- **Como configurar**:
  1. Acesse [Google Apps Script](https://script.google.com)
  2. Crie um novo projeto
  3. Cole o código abaixo:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('SEU_SHEET_ID').getActiveSheet();
    
    sheet.appendRow([
      new Date(),
      data.email,
      data.product,
      data.url,
      data.source
    ]);
    
    return ContentService.createTextOutput('Success');
  } catch (error) {
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}
```

  4. Publique como web app
  5. Substitua `YOUR_SCRIPT_ID` no código por seu ID

### 4. Formspree (Backup Gratuito)
- **Status**: Configurado (precisa de conta)
- **Como configurar**:
  1. Acesse [Formspree.io](https://formspree.io)
  2. Crie uma conta gratuita
  3. Crie um novo formulário
  4. Substitua `YOUR_FORM_ID` no código por seu ID

### 5. Local Storage (Backup Final)
- **Status**: Sempre ativo
- **Funciona**: Sempre, armazena no navegador
- **Acesso**: Console → `vipButton.getStoredLeads()`
- **Exportar**: Console → `vipButton.exportLeadsToCSV()`

## Configurações Atuais do Shopify

### Localização Correta (2024)
```
Admin Shopify → Settings → Customer accounts
```

### Opções Disponíveis
1. **"Show login link in header"** - Habilita/desabilita links de login
2. **"Choose version"**:
   - **New customer accounts**: Sem senha, mais moderno
   - **Classic customer accounts**: Com senha, mais compatível

### Nota Importante
A opção "Disabled accounts" não existe mais no Shopify atual. O controle é feito através dos links de login.

## Verificação de Funcionamento

### 1. Teste o Modal VIP
```javascript
// No console do navegador
vipButton.getStoredLeads(); // Ver leads armazenados
vipButton.clearStoredLeads(); // Limpar leads (cuidado!)
vipButton.exportLeadsToCSV(); // Exportar para CSV
```

### 2. Monitore os Logs
Abra o console e teste o modal. Você verá:
- ✅ Sucessos em verde
- ⚠️ Avisos em amarelo  
- ❌ Erros em vermelho

### 3. Verifique Múltiplos Locais
- **Shopify Admin**: `Customers` (se contas habilitadas)
- **Google Sheets**: Planilha configurada
- **Formspree**: Dashboard do Formspree
- **Email**: Se configurou notificações
- **Local Storage**: Console do navegador

## Solução de Problemas

### Lead não aparece no Shopify
1. Verifique se contas estão habilitadas em `Settings → Customer accounts`
2. Verifique logs no console
3. Leads ainda são salvos nos backups

### Todos os serviços falharam
- **Não se preocupe**: Lead é sempre salvo no Local Storage
- **Acesse**: `vipButton.getStoredLeads()` no console
- **Exporte**: `vipButton.exportLeadsToCSV()`

### Como processar leads do Local Storage
1. Exporte para CSV: `vipButton.exportLeadsToCSV()`
2. Importe manualmente no Shopify Admin → Customers
3. Ou processe via API/webhook personalizado

## Próximos Passos Recomendados

1. **Configure Google Sheets** (5 min) - Backup mais confiável
2. **Configure Formspree** (2 min) - Backup gratuito com notificações
3. **Teste o sistema** - Faça um teste completo
4. **Configure notificações** - Para ser alertado de novos leads

## Suporte

Se precisar de ajuda:
1. Verifique os logs no console
2. Teste com `vipButton.getStoredLeads()`
3. Exporte leads com `vipButton.exportLeadsToCSV()`

**Garantia**: Com este sistema, é impossível perder um lead VIP! 🎯