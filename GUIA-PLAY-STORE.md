# NMC Personal Finance — Guia de Publicação na Google Play Store
## Nobrega Mall Consultant © 2025-2026

---

## O que é TWA (Trusted Web Activity)?

A TWA é a forma oficial do Google de publicar um PWA na Play Store como app nativo.
O app Android é uma casca mínima que abre o seu site Vercel em modo fullscreen,
sem barra de navegação — idêntico a um app nativo.

**Vantagens:**
- Sem código Android complexo — usa seu PWA existente
- Atualizações instantâneas: muda o Vercel, o app atualiza sozinho
- Acessa localStorage, câmera, notificações push etc.
- Aprovado pelo Google (método oficial desde 2019)

---

## PRÉ-REQUISITOS

### 1. Ferramentas necessárias
- [ ] Java JDK 17+ — https://adoptium.net
- [ ] Android Studio — https://developer.android.com/studio
- [ ] Bubblewrap CLI — `npm install -g @bubblewrap/cli`
- [ ] Conta Google Play Developer (taxa única USD 25) — https://play.google.com/console

### 2. URL do Vercel
Seu app deve estar publicado e acessível via HTTPS.
Exemplo: `https://nmc-finance.vercel.app`

---

## PASSO 1 — Deploy no Vercel

1. Coloque todos os arquivos desta pasta no seu repositório GitHub:
   ```
   /
   ├── index.html          ← app principal
   ├── sw.js               ← service worker
   ├── manifest.json       ← web app manifest
   ├── vercel.json         ← configuração do Vercel
   ├── icons/
   │   ├── icon-192.png
   │   ├── icon-512.png
   │   └── (demais ícones)
   ├── screenshots/
   │   ├── screen-wide.png
   │   └── screen-narrow.png
   └── .well-known/
       └── assetlinks.json  ← PREENCHER após gerar keystore
   ```

2. Faça push para o GitHub e conecte ao Vercel
3. Verifique se o app abre em: `https://seu-dominio.vercel.app`
4. Verifique se o manifest está acessível: `https://seu-dominio.vercel.app/manifest.json`
5. Verifique se o SW está acessível: `https://seu-dominio.vercel.app/sw.js`

---

## PASSO 2 — Gerar o projeto TWA com Bubblewrap

```bash
# Instale o Bubblewrap
npm install -g @bubblewrap/cli

# Crie um diretório para o projeto Android
mkdir nmc-twa && cd nmc-twa

# Inicialize o projeto TWA
bubblewrap init --manifest https://seu-dominio.vercel.app/manifest.json
```

Durante o `init`, informe:
- **Package name:** `com.nobregamallconsultant.nmcfinance`
- **App name:** `NMC Personal Finance`
- **Launcher name:** `NMC Finance`
- **Display mode:** `standalone`
- **Orientation:** `portrait`
- **Theme color:** `#080b10`
- **Background color:** `#080b10`
- **Start URL:** `/`
- **Icon URL:** `https://seu-dominio.vercel.app/icons/icon-512.png`

---

## PASSO 3 — Gerar o Keystore (chave de assinatura)

```bash
# Dentro do diretório nmc-twa:
bubblewrap build
```

O Bubblewrap vai pedir para criar ou usar um keystore existente.
Ao criar:
- **Keystore file:** `nmc-finance.keystore`
- **Keystore password:** (senha forte — GUARDE COM SEGURANÇA)
- **Key alias:** `nmc-finance-key`
- **Key password:** (pode ser a mesma)
- **Validity:** 25 anos (9125 dias)
- **Nome:** Nobrega Mall Consultant

⚠️ **IMPORTANTÍSSIMO:** O keystore é o que assina seu app.
Se perdê-lo, não poderá atualizar o app na Play Store jamais.
Faça backup em local seguro (nuvem, HD externo, e-mail criptografado).

---

## PASSO 4 — Obter o SHA-256 do Keystore

```bash
keytool -list -v \
  -keystore nmc-finance.keystore \
  -alias nmc-finance-key \
  -storepass SUA_SENHA
```

Copie o valor `SHA256:` exibido (formato: `AB:CD:EF:...`).

---

## PASSO 5 — Atualizar o assetlinks.json

Edite o arquivo `.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nobregamallconsultant.nmcfinance",
      "sha256_cert_fingerprints": [
        "AB:CD:EF:12:34:56:78:90:..."   ← COLE AQUI O SHA-256 REAL
      ]
    }
  }
]
```

Faça push para o Vercel e verifique:
`https://seu-dominio.vercel.app/.well-known/assetlinks.json`

---

## PASSO 6 — Build do APK/AAB

```bash
# Dentro do nmc-twa:
bubblewrap build
```

Isso gera:
- `app-release-signed.apk` — para instalar e testar no celular
- `app-release-bundle.aab` — para enviar à Play Store (AAB é obrigatório)

### Testar no celular antes de publicar:
```bash
adb install app-release-signed.apk
```
Abra o app no celular e verifique se:
- [ ] Abre sem barra de navegação (fullscreen)
- [ ] Login funciona
- [ ] Dados persistem entre sessões
- [ ] Offline funciona após primeiro acesso

---

## PASSO 7 — Publicar na Play Store

1. Acesse: https://play.google.com/console
2. Crie um novo app: "NMC Personal Finance"
3. Preencha as informações:
   - **Categoria:** Finanças
   - **Classificação:** Livre (sem conteúdo sensível)
   - **Público:** 18+
   - **Países:** Brasil (ou todos)

4. **Listagem da loja:**
   - Título: `NMC Personal Finance`
   - Descrição curta (80 chars): `Controle financeiro completo com criptografia AES-256 — 100% offline`
   - Descrição longa: (use o texto abaixo)
   - Ícone: `icons/icon-512.png` (512x512)
   - Feature graphic: `feature-graphic.png` (1024x500)
   - Screenshots: pasta `screenshots/`

5. **Upload do AAB:**
   - Produção → Criar nova versão
   - Upload do `app-release-bundle.aab`
   - Notas da versão: `v20.17 — Versão inicial`

6. **Enviar para revisão**
   - O Google leva de 1 a 7 dias úteis para aprovar

---

## DESCRIÇÃO LONGA para a Play Store

```
NMC Personal Finance System é o aplicativo de controle financeiro pessoal
completo, desenvolvido pela Nobrega Mall Consultant.

✓ SEGURANÇA TOTAL
Todos os seus dados são criptografados com AES-256 diretamente no seu
dispositivo. Nenhuma informação é enviada para servidores externos.
Funciona 100% offline.

✓ CONTROLE COMPLETO
• Receitas, despesas e transferências
• Cartões de crédito e débito com controle de fatura
• Importação de faturas PDF (Itaú, Nubank, Bradesco, Caixa)
• Financiamentos com Tabela Price
• Investimentos e patrimônio

✓ PLANEJAMENTO
• Metas financeiras com progresso visual
• Orçamento por categoria com alertas
• Recorrentes com lançamento em um toque
• Previsão de fluxo de caixa

✓ DASHBOARD INTELIGENTE
• Gráficos interativos de receitas vs despesas
• Alertas de contas a vencer
• Comparativo mês a mês
• Projeção de 3 meses

✓ CONCILIAÇÃO BANCÁRIA
• Importação OFX/CSV de todos os bancos
• Leitura inteligente de PDFs bancários
• Deduplicação automática

✓ RELATÓRIOS EM PDF
Fluxo de caixa, despesas por categoria, posição de investimentos e mais.

Software proprietário — Nobrega Mall Consultant © 2025-2026
```

---

## CHECKLIST FINAL antes de publicar

- [ ] App abre corretamente no Vercel (HTTPS)
- [ ] Manifest.json acessível e válido
- [ ] SW.js registrado (verificar no DevTools → Application → Service Workers)
- [ ] assetlinks.json com SHA-256 correto
- [ ] APK testado em dispositivo físico Android
- [ ] Icons 192px e 512px incluídos
- [ ] Feature graphic 1024x500 incluído
- [ ] Screenshots de pelo menos 2 tamanhos
- [ ] Keystore com backup seguro
- [ ] Descrição e título preenchidos na Play Console

---

## SUPORTE E ATUALIZAÇÕES

Para atualizar o app após publicação:
1. Modifique o `index.html` no Vercel → o app atualiza automaticamente
2. Para mudanças no TWA (package name, ícone): novo build + nova versão na Play Store

Dúvidas: Nobrega Mall Consultant
