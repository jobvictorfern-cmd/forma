# FORMA — Vitrine de moda fitness

Vitrine estática em HTML, CSS e JavaScript. Extraia o ZIP e abra `index.html` no navegador. Para hospedar, publique os arquivos extraídos preservando a pasta `assets`. O projeto dispensa instalação e etapa de build.

## Configuração

1. Em `app.js`, preencha `WHATSAPP_NUMBER` com o número oficial da loja em formato internacional, por exemplo, `55` + DDD + número, só com dígitos. O carrinho e o botão flutuante usam esse mesmo número. Com o valor vazio, ambos abrem o WhatsApp para escolher um destinatário.
2. Em `app.js`, substitua `STORE_NAME` e os itens em `products`. Os preços são em centavos inteiros (por exemplo, 15990 corresponde a R$ 159,90). Troque as fotos em `assets` e ajuste as referências em `index.html` e `app.js` conforme necessário.
3. Substitua as descrições e a tabela `demoMeasurements` em `app.js` pelas informações reais das peças. Em `index.html`, atualize a marca, os filtros e as condições de compra. Remova as indicações de demonstração quando o catálogo e o número estiverem prontos.

O carrinho salva tamanho e quantidade neste navegador. O checkout abre o WhatsApp com o pedido e o subtotal preenchidos. A disponibilidade, o frete e o pagamento são confirmados pela loja durante a conversa.
