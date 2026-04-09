'use strict';

jest.mock('node-fetch');

const fetch = require('node-fetch');
const pensador = require('./index');

// Helpers ─────────────────────────────────────────────────────────────────────

function toArrayBuffer(buf) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; i++) view[i] = buf[i];
  return ab;
}

function buildCard({ text = 'Frase teste.', author = 'Autor Teste' } = {}) {
  return `
    <div class="thought-card">
      <p class="frase fr">${text}</p>
      <div class="autor">
        <a href="/autor/test/"><span class="author-name">${author}</span></a>
      </div>
    </div>`;
}

function mockPage(cards = [], hasNext = false) {
  const pagination = hasNext
    ? `<div id="paginacao"><a class="nav">Próxima</a></div>`
    : '';
  const html = `<html><body>${cards.map(buildCard).join('')}${pagination}</body></html>`;
  fetch.mockResolvedValueOnce({
    arrayBuffer: () => Promise.resolve(toArrayBuffer(Buffer.from(html, 'utf-8'))),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => fetch.mockClear());

// Estrutura de retorno ────────────────────────────────────────────────────────

describe('estrutura de retorno', () => {
  test('retorna total, searchTerm e phrases', async () => {
    mockPage([{ text: 'Uma frase.', author: 'Autor' }]);
    const result = await pensador({ term: 'Teste', max: 5 });

    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('searchTerm');
    expect(result).toHaveProperty('phrases');
    expect(Array.isArray(result.phrases)).toBe(true);
  });

  test('total reflete o número de frases retornadas', async () => {
    mockPage([
      { text: 'Frase 1', author: 'A' },
      { text: 'Frase 2', author: 'B' },
    ]);
    const result = await pensador({ term: 'Teste', max: 10 });

    expect(result.total).toBe(result.phrases.length);
  });
});

// Slugificação do termo ───────────────────────────────────────────────────────

describe('slugificação do term', () => {
  test('gera o searchTerm correto para um termo simples', async () => {
    mockPage([]);
    const result = await pensador({ term: 'Elon Musk', max: 1 });

    expect(result.searchTerm).toBe('frases_de_elon_musk');
  });

  test('gera o searchTerm correto para término com caracteres especiais', async () => {
    mockPage([]);
    const result = await pensador({ term: 'Papa Francisco', max: 1 });

    expect(result.searchTerm).toBe('frases_de_papa_francisco');
  });

  test('usa "frases_curtas" quando nenhum term é fornecido', async () => {
    mockPage([]);
    const result = await pensador({ max: 1 });

    expect(result.searchTerm).toBe('frases_curtas');
  });

  test('usa "frases_curtas" quando options é omitido por completo', async () => {
    mockPage([]);
    const result = await pensador();

    expect(result.searchTerm).toBe('frases_curtas');
  });
});

// Limite máximo ───────────────────────────────────────────────────────────────

describe('opção max', () => {
  test('limita o número de frases retornadas', async () => {
    const cards = Array.from({ length: 8 }, (_, i) => ({
      text: `Frase ${i + 1}`,
      author: 'Autor',
    }));
    mockPage(cards);

    const result = await pensador({ term: 'Teste', max: 3 });

    expect(result.phrases).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  test('retorna todas as frases quando max não é fornecido', async () => {
    mockPage([
      { text: 'Frase 1', author: 'A' },
      { text: 'Frase 2', author: 'B' },
      { text: 'Frase 3', author: 'C' },
    ]);

    const result = await pensador({ term: 'Teste' });

    expect(result.total).toBe(3);
  });
});

// Extração de conteúdo ────────────────────────────────────────────────────────

describe('extração de conteúdo', () => {
  test('extrai author e text corretamente', async () => {
    mockPage([{ text: 'A vida é bela.', author: 'Fernando Pessoa' }]);

    const result = await pensador({ term: 'Pessoa', max: 1 });

    expect(result.phrases[0]).toEqual({
      author: 'Fernando Pessoa',
      text: 'A vida é bela.',
    });
  });

  test('remove espaços em branco extras do nome do autor', async () => {
    const html = `<html><body>
      <div class="thought-card">
        <p class="frase fr">Uma frase.</p>
        <div class="autor">
          <a href="/autor/test/">
            <span class="author-name">
              Autor Com Espacos
            </span>
          </a>
        </div>
      </div>
    </body></html>`;
    fetch.mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(toArrayBuffer(Buffer.from(html, 'utf-8'))),
    });

    const result = await pensador({ term: 'Teste', max: 1 });

    expect(result.phrases[0].author).toBe('Autor Com Espacos');
  });

  test('ignora thought-cards sem texto', async () => {
    const html = `<html><body>
      <div class="thought-card">
        <p class="frase fr"></p>
        <div class="autor"><a href="/"><span class="author-name">Autor</span></a></div>
      </div>
      <div class="thought-card">
        <p class="frase fr">Frase válida.</p>
        <div class="autor"><a href="/"><span class="author-name">Autor</span></a></div>
      </div>
    </body></html>`;
    fetch.mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(toArrayBuffer(Buffer.from(html, 'utf-8'))),
    });

    const result = await pensador({ term: 'Teste', max: 5 });

    expect(result.total).toBe(1);
    expect(result.phrases[0].text).toBe('Frase válida.');
  });

  test('retorna lista vazia quando não há thought-cards na página', async () => {
    mockPage([]);

    const result = await pensador({ term: 'Inexistente', max: 5 });

    expect(result.total).toBe(0);
    expect(result.phrases).toEqual([]);
  });
});

// Paginação ───────────────────────────────────────────────────────────────────

describe('paginação', () => {
  test('busca a próxima página quando "Próxima" está presente', async () => {
    mockPage([{ text: 'Frase 1', author: 'A' }], true);  // página 1 com next
    mockPage([{ text: 'Frase 2', author: 'B' }], false); // página 2 sem next

    const result = await pensador({ term: 'Teste', max: 10 });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.total).toBe(2);
  });

  test('para de paginar quando não há próxima página', async () => {
    mockPage([{ text: 'Frase 1', author: 'A' }], false);

    await pensador({ term: 'Teste', max: 10 });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('para de paginar ao atingir o max, mesmo que haja próxima página', async () => {
    // Página com 5 frases e há próxima página
    const cards = Array.from({ length: 5 }, (_, i) => ({ text: `Frase ${i + 1}`, author: 'A' }));
    mockPage(cards, true);

    const result = await pensador({ term: 'Teste', max: 3 });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(3);
  });
});
