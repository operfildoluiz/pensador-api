# pensador-api
🤔 Pensador é um pacote Node que traz frases de pensadores

## Instalação

```
yarn add pensador-api 
// or
npm install --save pensador-api
```

## Como usar?

Primeiro, importe o pacote e depois chame a função passando as opções.


*NOTE*: pensador-api é assíncrono, logo você deve usar Promises ou Async/Await.


```
const pensador = require('pensador-api')

...

const array = await pensador({ term: "Elon Musk", max: 5 })

// Returns:
/*
{
    "total": 5,
    "searchTerm": "frases_de_elon_musk",
    "phrases": [
        {
            "author": "Elon Musk",
            "text": "Quando algo é importante o suficiente, você realiza, mesmo que as chances não estejam a seu favor."
        },
        {
            "author": "Elon Musk",
            "text": "Algumas pessoas não gostam de mudanças, mas você precisa abraçar a mudança se a alternativa for desastre."
        },
        {
            "author": "Elon Musk",
            "text": "A vida é curta demais para desentendimentos de longo prazo."
        },
        {
            "author": "Elon Musk",
            "text": "A persistência é muito importante. Você não deve desistir, a menos que seja forçado a desistir."
        },
        {
            "author": "Elon Musk",
            "text": "As pessoas trabalham melhor quando sabem qual é o objetivo e o porquê. É importante que as pessoas estejam ansiosas para vir trabalhar de manhã e gostem de trabalhar."
        }
    ]
}
*/
```


## Opções

*term* (obrigatória) (string)

Um termo a ser pesquisado. O pacote irá adicionar automaticamente o prefixo "frases de", padrão do site Pensador.com

*max* (opcional) (integer)

Número máximo de registros que o pacote deve retornar. Deixe me branco para capturar todos os disponíveis no termo.