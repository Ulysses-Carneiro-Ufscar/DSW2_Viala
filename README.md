# Vialá - DSW2 (UFSCar)

Aplicação web para busca, visualização e reserva de passagens e rotas multimodais, desenvolvida para a disciplina de Desenvolvimento de Software para Web 2 (DC/UFSCar).

---

## Membros da Equipe

| Nome Completo | RA | Perfil GitHub |
| :--- | :--- | :--- |
| Pietro Bernardo Dutra Scaglione | 824375 | [PietroBscaglione](https://github.com/PietroBscaglione) |
| Samuel Gerga Martins | 821772 | [Hakirius](https://github.com/Hakirius) |
| Ulysses Santos Carneiro | 821654 | [Ulysses-Carneiro-Ufscar](https://github.com/Ulysses-Carneiro-Ufscar) |

## Protótipo no Figma

[Viajalá - Web2 (Figma)](https://www.figma.com/design/2thBTZWr0IupoZfa2dFi5u/Viajal%C3%A1---Web2?node-id=17-469&t=GpIQUuMc6FUPXARt-1)

---

## Fluxo da Aplicação

```
[1. Passagens (index.html)]
   │
   ▼
[2. Rotas: Lista de passagens (rotas.html)]
   │
   ▼ (Selecionar)*
[3. Rotas: Ver Rotas no mapa (rotas.html)]
   │
   ▼ (Confirmar e ir para pagamento)
[4. Login]* ──► [5. Pagamento]* ──► [6. Minhas viagens (minhas-viagens.html)]
```

*\*Nota: A transição automática direta via clique em "Selecionar" para a visualização do mapa, assim como as telas de Login e Pagamento, são planejadas para as próximas fases do projeto.*

### Telas Implementadas

1. **Passagens (`index.html`)**
   - Configuração das características da viagem: Origem, Destino, Data e Passageiros.
   - Encaminha o fluxo diretamente para a tela de Rotas.

2. **Rotas (`rotas.html`)**
   - **Lista de passagens**: Filtros por modalidade (Todos, Ônibus, Avião, Caronas, Multimodal) e cartões informativos com horários, viações e tarifas.
   - **Ver Rotas no mapa**: Descritivo completo do itinerário multimodal. Renderiza o traçado rodoviário real (Leaflet + OpenStreetMap e rotas dinâmicas OSRM) em dois trechos:
     - Trecho 1: Carona compartilhada (São Paulo ➔ Aparecida).
     - Trecho 2: Ônibus executivo (Aparecida ➔ Rio de Janeiro) com visualização e escolha de assentos.

3. **Minhas viagens (`minhas-viagens.html`)**
   - Histórico e registro de bilhetes confirmados pelo usuário.

---

## Arquitetura de Arquivos

```
DSW2_Viala/
├── index.html                  # Tela 1: Passagens
├── rotas.html                  # Tela 2: Rotas (Lista e Mapa)
├── minhas-viagens.html         # Tela 3: Minhas viagens
├── tailwindInput.css           # Entrada com regras e diretivas do Tailwind
├── tailwindOutput.css          # Folha de estilo compilada via CLI
├── package.json                # Scripts e dependências de compilação
├── package-lock.json           # Travamento de dependências
├── .gitignore                  # Arquivos ignorados pelo Git
├── README.md                   # Documentação técnica da aplicação
├── assets/
│   └── Mapa_de_poltronas.png   # Mapa visual de poltronas do ônibus
└── js/
    ├── app.js                  # Lógica de seleção e filtros da busca
    └── mockData.js             # Base de dados simulada para as viagens
```

---

## Execução Local

### Pré-requisitos
- Navegador web moderno.
- Node.js (apenas para recompilação do CSS).

### 1. Visualização
Abra o arquivo `index.html` diretamente no navegador ou utilize um servidor estático:

```bash
# Com Python 3
python3 -m http.server 3000

# Ou com BrowserSync
npx browser-sync start --server . --port 3000 --files "**/*"
```

Acesse em: `http://localhost:3000`

### 2. Compilação do Tailwind CSS

Para recompilar o arquivo `tailwindOutput.css`:

```bash
npm install
npm run tailwind-build
```

Para compilação contínua em modo observador:

```bash
npm run tailwind-watch
```
