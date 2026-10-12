/**
 * Viajalá (Vialá) - Mock Data
 * Disciplina DSW2 - UFSCar
 * 
 * Centraliza os dados mockados de viagens, bilhetes e coordenadas
 * geográficas de rotas para o OpenStreetMap / Leaflet.
 */

// Lista expandida de Cidades e Terminais Rodoviários / Aeroportos
const CITIES_OPTIONS = [
  { city: 'São Paulo, SP', terminal: 'Terminal Tietê', badge: 'Mais buscado', category: 'Capitais' },
  { city: 'Rio de Janeiro, RJ', terminal: 'Rodoviária Novo Rio', badge: 'Popular', category: 'Capitais' },
  { city: 'São Carlos, SP', terminal: 'Rodoviária de São Carlos (UFSCar)', badge: 'UFSCar', category: 'Universitário' },
  { city: 'Campinas, SP', terminal: 'Terminal Multimodal Ramos de Azevedo', badge: 'Hub Regional', category: 'Interior SP' },
  { city: 'Belo Horizonte, MG', terminal: 'Terminal Rodoviário JK', badge: 'Capital MG', category: 'Capitais' },
  { city: 'Curitiba, PR', terminal: 'Rodoferroviária de Curitiba', badge: 'Sul', category: 'Capitais' },
  { city: 'Ribeirão Preto, SP', terminal: 'Terminal Rodoviário Dr. Bento de Abreu', badge: 'Interior SP', category: 'Interior SP' },
  { city: 'Santos, SP', terminal: 'Rodoviária de Santos', badge: 'Litoral SP', category: 'Litoral' },
  { city: 'Brasília, DF', terminal: 'Rodoviária Interestadual de Brasília', badge: 'Capital Federal', category: 'Capitais' },
  { city: 'Florianópolis, SC', terminal: 'Terminal Rita Maria', badge: 'Litoral Sul', category: 'Litoral' },
  { city: 'Salvador, BA', terminal: 'Terminal Rodoviário Armando Viana', badge: 'Nordeste', category: 'Capitais' },
  { city: 'Poços de Caldas, MG', terminal: 'Terminal Rodoviário de Poços', badge: 'Turismo', category: 'Interior SP' },
  { city: 'Araraquara, SP', terminal: 'Terminal Rodoviário de Araraquara', badge: 'Região UFSCar', category: 'Universitário' },
  { city: 'Bauru, SP', terminal: 'Terminal Rodoviário de Bauru', badge: 'Interior SP', category: 'Interior SP' },
  { city: 'Ubatuba, SP', terminal: 'Terminal Rodoviário de Ubatuba', badge: 'Litoral Norte', category: 'Litoral' }
];

// Opções rápidas e inteligentes de Datas
const DATE_OPTIONS = [
  { label: 'Hoje (24 set · qui)', dateStr: '24 de setembro · qui', tag: 'Hoje' },
  { label: 'Amanhã (25 set · sex)', dateStr: '25 de setembro · sex', tag: 'Amanhã' },
  { label: 'Sexta à noite (25 set)', dateStr: '25 de set · sex (noite)', tag: 'Fim de semana' },
  { label: 'Sábado (26 set)', dateStr: '26 de setembro · sáb', tag: 'Fim de semana' },
  { label: 'Domingo (27 set)', dateStr: '27 de setembro · dom', tag: 'Retorno' },
  { label: 'Segunda (28 set)', dateStr: '28 de setembro · seg', tag: 'Trabalho' },
  { label: 'Fim do mês (30 set)', dateStr: '30 de setembro · qua', tag: 'Fim do mês' },
  { label: 'Próxima qui (01 out)', dateStr: '01 de outubro · qui', tag: 'Próxima semana' },
  { label: 'Fim de semana seguinte (03 out)', dateStr: '03 de outubro · sáb', tag: 'Outubro' },
  { label: 'Feriado 12 de Outubro', dateStr: '12 de outubro · seg', tag: 'Feriado Nacional' },
  { label: 'Fim de semana estendido (16 out)', dateStr: '16 de outubro · sex', tag: 'Viagem longa' }
];

// Presets de Passageiros e Companhias
const PASSENGER_PRESETS = [
  { label: '1 adulto', tag: 'Individual', adults: 1, children: 0, babies: 0, pets: 0 },
  { label: '2 adultos', tag: 'Casal / Dupla', adults: 2, children: 0, babies: 0, pets: 0 },
  { label: '1 adulto + 1 estudante (UFSCar)', tag: 'Desconto Universitário', adults: 2, children: 0, babies: 0, pets: 0 },
  { label: '2 adultos + 1 criança', tag: 'Família pequena', adults: 2, children: 1, babies: 0, pets: 0 },
  { label: '2 adultos + 2 crianças', tag: 'Família', adults: 2, children: 2, babies: 0, pets: 0 },
  { label: '3 adultos', tag: 'Amigos / Grupo', adults: 3, children: 0, babies: 0, pets: 0 },
  { label: '4 adultos', tag: 'Grupo grande / Van', adults: 4, children: 0, babies: 0, pets: 0 },
  { label: '1 idoso (60+ anos)', tag: 'Prioridade / Estatuto', adults: 1, children: 0, babies: 0, pets: 0 },
  { label: '1 adulto + 1 bebê (colo)', tag: 'Colo sem assento', adults: 1, children: 0, babies: 1, pets: 0 },
  { label: '1 adulto + 1 pet', tag: 'Animal de estimação', adults: 1, children: 0, babies: 0, pets: 1 }
];

// 1. Viagens disponíveis para os resultados de busca (São Paulo -> Rio de Janeiro)
const MOCK_AVAILABLE_TRIPS = [
  {
    id: 'trip-1',
    modal: 'Ônibus',
    carrier: 'Viação Cometa',
    type: 'Ônibus leito',
    origin: 'São Paulo, SP',
    originLocation: 'Terminal Tietê',
    destination: 'Rio de Janeiro, RJ',
    destinationLocation: 'Rodoviária Novo Rio',
    departureTime: '22:30',
    arrivalTime: '04:45',
    duration: '6h15',
    price: 89.90,
    statusText: '12 vagas restantes',
    statusCode: 'available',
    isAvailable: true,
    seatNumber: '14',
    icon: 'directions_bus',
    badgeClass: ''
  },
  {
    id: 'trip-2',
    modal: 'Caronas',
    carrier: 'Carona · Marcos S.',
    type: 'Carro compartilhado',
    rating: '4.9 ★',
    origin: 'São Paulo, SP',
    originLocation: 'Metrô Tietê',
    destination: 'Rio de Janeiro, RJ',
    destinationLocation: 'Copacabana',
    departureTime: '07:15',
    arrivalTime: '12:30',
    duration: '5h15',
    price: 55.00,
    statusText: '2 vagas restantes',
    statusCode: 'few-seats',
    isAvailable: true,
    seatNumber: '3',
    icon: 'person',
    badgeClass: 'green'
  },
  {
    id: 'trip-3',
    modal: 'Ônibus',
    carrier: 'Viação Útil',
    type: 'Semi-leito',
    origin: 'São Paulo, SP',
    originLocation: 'Terminal Tietê',
    destination: 'Rio de Janeiro, RJ',
    destinationLocation: 'Rodoviária Novo Rio',
    departureTime: '23:45',
    arrivalTime: '05:50',
    duration: '6h05',
    price: 68.00,
    statusText: 'Esgotado',
    statusCode: 'unavailable',
    isAvailable: false,
    seatNumber: null,
    icon: 'directions_bus',
    badgeClass: ''
  },
  {
    id: 'trip-4',
    modal: 'Avião',
    carrier: 'Latam LA3312',
    type: 'Voo direto',
    origin: 'São Paulo (CGH)',
    originLocation: 'Aeroporto Congonhas',
    destination: 'Rio de Janeiro (SDU)',
    destinationLocation: 'Aeroporto Santos Dumont',
    departureTime: '09:40',
    arrivalTime: '10:45',
    duration: '1h05',
    price: 249.90,
    statusText: '6 vagas restantes',
    statusCode: 'available',
    isAvailable: true,
    seatNumber: '7C',
    icon: 'flight',
    badgeClass: 'orange'
  },
  {
    id: 'trip-5',
    modal: 'Caronas',
    carrier: 'Carona · Beatriz M.',
    type: 'Carro compartilhado',
    rating: '5.0 ★',
    origin: 'São Paulo, SP',
    originLocation: 'Metrô Conceição',
    destination: 'Rio de Janeiro, RJ',
    destinationLocation: 'Barra da Tijuca',
    departureTime: '14:00',
    arrivalTime: '19:40',
    duration: '5h40',
    price: 60.00,
    statusText: '1 vaga restante',
    statusCode: 'few-seats',
    isAvailable: true,
    seatNumber: '4',
    icon: 'person',
    badgeClass: 'green'
  },
  {
    id: 'trip-6',
    modal: 'Ônibus',
    carrier: '1001 Expresso',
    type: 'Leito Cama',
    origin: 'São Paulo, SP',
    originLocation: 'Terminal Barra Funda',
    destination: 'Rio de Janeiro, RJ',
    destinationLocation: 'Rodoviária Novo Rio',
    departureTime: '21:15',
    arrivalTime: '03:45',
    duration: '6h30',
    price: 110.00,
    statusText: '8 vagas restantes',
    statusCode: 'available',
    isAvailable: true,
    seatNumber: '9',
    icon: 'directions_bus',
    badgeClass: ''
  },
  {
    /* Atendendo ao requisito de 'A tela deve usar visão.txt':
       "pode somar opções tbm, exemplo de carro do ponto A até o ponto B,
       de onibus do ponto B ao C, ou trazer ainda mais opções" */
    id: 'trip-7',
    modal: 'Todos',
    carrier: 'Multimodal: Carona + Ônibus',
    type: 'Carona até Aparecida + Ônibus Cometa ao Rio',
    origin: 'São Paulo, SP',
    originLocation: 'Metrô Tatuapé',
    destination: 'Rio de Janeiro, RJ',
    destinationLocation: 'Rodoviária Novo Rio',
    departureTime: '08:30',
    arrivalTime: '15:10',
    duration: '6h40 (soma dos trechos)',
    price: 78.50,
    statusText: '2 vagas restantes',
    statusCode: 'few-seats',
    isAvailable: true,
    seatNumber: '18',
    icon: 'alt_route',
    badgeClass: 'orange'
  }
];

// 2. Viagens já adquiridas pelo usuário (Tela "Minhas Viagens")
const INITIAL_MY_TRIPS = [
  {
    id: 'my-trip-1',
    modalText: 'Ônibus leito · Viação Cometa',
    seat: '14',
    origin: 'São Paulo',
    destination: 'Rio de Janeiro',
    dateTime: '24 de set · 22:30',
    price: 'R$ 89,90',
    icon: 'directions_bus'
  },
  {
    id: 'my-trip-2',
    modalText: 'Avião · Latam LA3312',
    seat: '7C',
    origin: 'Rio de Janeiro',
    destination: 'Belo Horizonte',
    dateTime: '30 de set · 09:40',
    price: 'R$ 249,90',
    icon: 'flight'
  },
  {
    id: 'my-trip-3',
    modalText: 'Carona · Marcos S.',
    seat: '-',
    origin: 'São Carlos',
    destination: 'São Paulo',
    dateTime: '2 de set · 18:20',
    price: 'R$ 35,00',
    icon: 'person'
  }
];

// 3. Configurações e Coordenadas para o OpenStreetMap (Leaflet)
const MAP_CONFIG = {
  center: [-23.2, -44.8], // Ponto médio entre SP e RJ
  zoom: 8,
  cities: {
    origin: {
      name: 'São Paulo, SP',
      coords: [-23.5505, -46.6333]
    },
    destination: {
      name: 'Rio de Janeiro, RJ',
      coords: [-22.9068, -43.1729]
    }
  },
  routes: [
    {
      id: 'route-dutra',
      name: 'Via Dutra',
      distance: '429 km',
      time: '6h15',
      price: 89.90,
      activeColor: '#1D72B8',
      waypoints: [
        [-23.5505, -46.6333],
        [-23.4682, -46.5298],
        [-23.1896, -45.8841], // S. José dos Campos
        [-23.0205, -45.5564], // Taubaté
        [-22.8466, -45.2307], // Aparecida
        [-22.5232, -44.1041], // Volta Redonda
        [-22.7533, -43.4542], // Baixada Fluminense
        [-22.9068, -43.1729]  // Rio
      ]
    },
    {
      id: 'route-expressa',
      name: 'Dutra Expressa',
      distance: '420 km',
      time: '6h00',
      price: 94.90,
      activeColor: '#1D72B8',
      waypoints: [
        [-23.5505, -46.6333],
        [-23.35, -46.0],
        [-23.0, -45.3],
        [-22.6, -44.2],
        [-22.8, -43.6],
        [-22.9068, -43.1729]
      ]
    },
    {
      id: 'route-litoral',
      name: 'Via Litoral',
      distance: '450 km',
      time: '7h40',
      price: 79.90,
      activeColor: '#1D72B8',
      waypoints: [
        [-23.5505, -46.6333],
        [-23.9618, -46.3322], // Santos
        [-23.6262, -45.4132], // Caraguatatuba
        [-23.4338, -45.0838], // Ubatuba
        [-23.2178, -44.7174], // Paraty
        [-22.9998, -44.3168], // Angra dos Reis
        [-22.9068, -43.1729]  // Rio
      ]
    }
  ]
};
