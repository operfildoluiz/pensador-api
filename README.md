# pensador-api

Um pacote Node.js para buscar frases do [Pensador.com](https://www.pensador.com).

## Instalação

```bash
npm install pensador-api
# ou
yarn add pensador-api
```

## Uso

```js
const pensador = require('pensador-api')

// Buscar frases por termo
const result = await pensador({ term: 'Fernando Pessoa', max: 3 })

// Buscar frases curtas (padrão, sem term)
const result = await pensador({ max: 5 })
```

> **Nota:** a função é assíncrona — use `async/await` ou Promises.

### Exemplo de retorno

```json
{
    "total": 3,
    "searchTerm": "frases_de_fernando_pessoa",
    "phrases": [
        {
            "author": "Fernando Pessoa",
            "text": "Não sou nada. Nunca serei nada. Não posso querer ser nada."
        },
        {
            "author": "Fernando Pessoa",
            "text": "A arte é a expressão da nossa experiência real."
        },
        {
            "author": "Fernando Pessoa",
            "text": "Tudo vale a pena se a alma não é pequena."
        }
    ]
}
```

## Opções

| Opção  | Tipo    | Obrigatório | Padrão          | Descrição |
|--------|---------|-------------|-----------------|-----------|
| `term` | string  | não         | `frases_curtas` | Autor ou tema a pesquisar. O prefixo `"frases de"` é adicionado automaticamente. |
| `max`  | integer | não         | sem limite      | Número máximo de frases a retornar. Omita para buscar todas as disponíveis para o termo. |

## Resposta

| Campo        | Tipo    | Descrição |
|--------------|---------|-----------|
| `total`      | integer | Quantidade de frases retornadas. |
| `searchTerm` | string  | Slug utilizado na busca (gerado a partir do `term`). |
| `phrases`    | array   | Lista de objetos com `author` (string) e `text` (string). |

## ⚠️ Disclaimer

Este pacote funciona fazendo scraping do site [Pensador.com](https://www.pensador.com). Por isso:

- O funcionamento **depende inteiramente** da disponibilidade e da estrutura HTML do Pensador.com. Mudanças no site podem quebrar o pacote.
- O uso deste pacote está sujeito aos **[Termos de Uso do Pensador.com](https://www.pensador.com/termos_de_uso/)**. Consulte-os antes de utilizar em produção.
- Este pacote **não é oficial** e não é mantido nem afiliado ao Pensador.com.
- Use com responsabilidade: evite requisições excessivas que possam sobrecarregar o serviço.

## Licença

[MIT](LICENSE)
