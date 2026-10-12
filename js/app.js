/**
 * Viajalá (Vialá) - Lógica da Aplicação
 * Disciplina DSW2 - UFSCar
 * 
 * Implementa a navegação entre telas, integração com Leaflet/OpenStreetMap,
 * controle da gaveta de rotas e fluxo de bilhetes em "Minhas Viagens".
 */

// Estado global da aplicação
const state = {
  activeScreen: 'screen-passagens', // 'screen-passagens', 'screen-rotas', 'screen-minhas-viagens'
  rotasViewMode: 'lista',          // 'lista' ou 'mapa' (dentro da tela Rotas)
  activeModalFilter: 'Todos',
  selectedRouteId: 'route-dutra',
  userTrips: [...INITIAL_MY_TRIPS],
  mapInstance: null,
  routeLayers: {},
  searchParams: {
    origin: 'São Paulo (Terminal Tietê)',
    destination: 'Rio de Janeiro (Rodoviária Novo Rio)',
    date: '24 de setembro · qui',
    passengers: '1 adulto',
    adults: 1,
    children: 0,
    babies: 0,
    pets: 0
  }
};

// ==========================================================================
// 1. Inicialização e Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSearchForm();
  setupResultsFilters();
  setupRotasViewToggle();
  setupDrawerRoutes();
  renderTripsList();
  renderMyTripsList();

  // Suporte a abertura inicial de menus para testes / deep-link (?open=origem|destino|dia|passageiros)
  const urlParams = new URLSearchParams(window.location.search);
  const menuToOpen = urlParams.get('open');
  if (menuToOpen === 'origem') {
    const box = document.getElementById('box-origin');
    if (box) box.click();
  } else if (menuToOpen === 'destino') {
    const box = document.getElementById('box-destination');
    if (box) box.click();
  } else if (menuToOpen === 'dia') {
    const box = document.getElementById('box-date');
    if (box) box.click();
    const dayParam = urlParams.get('day');
    if (dayParam) {
      const targetBtn = document.querySelector(`button[data-day="${dayParam}"]`);
      if (targetBtn) targetBtn.click();
    }
  } else if (menuToOpen === 'passageiros') {
    const box = document.getElementById('box-passengers');
    if (box) box.click();
  }

  // Suporte a rotas por hash (#passagens, #rotas, #mapa, #minhas-viagens)
  handleHashRoute();
  window.addEventListener('hashchange', handleHashRoute);
});

function handleHashRoute() {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#mapa') {
    navigateToScreen('screen-rotas');
    switchRotasView('mapa');
  } else if (hash === '#rotas' || hash === '#resultados') {
    navigateToScreen('screen-rotas');
    switchRotasView('lista');
  } else if (hash === '#minhas-viagens') {
    navigateToScreen('screen-minhas-viagens');
  } else {
    navigateToScreen('screen-passagens');
  }
}

// ==========================================================================
// 2. Navegação entre Telas
// ==========================================================================
function setupNavigation() {
  // Abas do Cabeçalho (1. Passagens | 2. Rotas | 3. Minhas viagens)
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetScreen = tab.dataset.screen;
      if (targetScreen && document.getElementById(targetScreen)) {
        e.preventDefault();
        navigateToScreen(targetScreen);
      }
    });
  });

  // Botão Voltar da tela de rotas (vai para a busca em Passagens)
  const btnBack = document.getElementById('btn-back-to-search');
  if (btnBack) {
    btnBack.addEventListener('click', () => navigateToScreen('screen-passagens'));
  }

  // Link "Editar" da tela de rotas (vai para a busca em Passagens)
  const btnEdit = document.getElementById('btn-edit-search');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => navigateToScreen('screen-passagens'));
  }

  // Logo Vialá clica e vai para a tela Passagens
  const brandLogo = document.querySelector('.brand-logo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      if (document.getElementById('screen-passagens')) {
        e.preventDefault();
        navigateToScreen('screen-passagens');
      }
    });
  }
}

// Alternador dentro da tela Rotas: "Lista de passagens" vs "Ver Rotas no Mapa"
function setupRotasViewToggle() {
  const btnLista = document.getElementById('rotas-toggle-list');
  const btnMapa = document.getElementById('rotas-toggle-map');

  if (btnLista) {
    btnLista.addEventListener('click', () => switchRotasView('lista'));
  }

  if (btnMapa) {
    btnMapa.addEventListener('click', () => switchRotasView('mapa'));
  }
}

function switchRotasView(mode) {
  state.rotasViewMode = mode;
  const viewLista = document.getElementById('rotas-subview-lista');
  const viewMapa = document.getElementById('rotas-subview-mapa');
  const toggleLista = document.getElementById('rotas-toggle-list');
  const toggleMapa = document.getElementById('rotas-toggle-map');
  const subtitle = document.getElementById('route-header-subtitle');

  if (mode === 'lista') {
    if (viewLista) viewLista.classList.remove('hidden');
    if (viewMapa) {
      viewMapa.classList.add('hidden');
      viewMapa.classList.remove('flex');
    }
    if (toggleLista) toggleLista.classList.add('active');
    if (toggleMapa) toggleMapa.classList.remove('active');
    if (subtitle) {
      const shortDate = state.searchParams.date.split('·')[0].trim();
      subtitle.textContent = `${shortDate} · ${state.searchParams.passengers}`;
    }
  } else {
    if (viewLista) viewLista.classList.add('hidden');
    if (viewMapa) {
      viewMapa.classList.remove('hidden');
      viewMapa.classList.add('flex');
    }
    if (toggleMapa) toggleMapa.classList.add('active');
    if (toggleLista) toggleLista.classList.remove('active');
    if (subtitle) subtitle.textContent = 'Escolha o trajeto da viagem';
    ensureMapRendered();
  }
}

function navigateToScreen(screenId) {
  state.activeScreen = screenId;

  // Atualiza visibilidade das 3 telas principais
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.toggle('active', screen.id === screenId);
  });

  // Atualiza estado ativo das abas da Navbar (Passagens, Rotas, Minhas viagens)
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const isActive = tab.dataset.screen === screenId;
    tab.classList.toggle('active', isActive);
  });

  // Atualiza o hash da URL
  let targetHash = '#passagens';
  if (screenId === 'screen-rotas') {
    targetHash = state.rotasViewMode === 'mapa' ? '#mapa' : '#rotas';
  } else if (screenId === 'screen-minhas-viagens') {
    targetHash = '#minhas-viagens';
  }
  if (window.location.hash !== targetHash) {
    history.replaceState(null, '', targetHash);
  }

  // Se navegou para a tela de rotas no modo mapa, garante render do Leaflet
  if (screenId === 'screen-rotas' && state.rotasViewMode === 'mapa') {
    ensureMapRendered();
    setTimeout(ensureMapRendered, 100);
  }

  // Rola suavemente ao topo
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 3. Menus Interativos da Tela Passagens (Origem, Destino, Dia e Passageiros)
// ==========================================================================

function closeAllSearchMenus() {
  const menus = [
    { menuId: 'list-origin-dropdown', arrowId: 'icon-origin-arrow', containerId: 'origin-container' },
    { menuId: 'list-dest-dropdown', arrowId: 'icon-dest-arrow', containerId: 'destination-container' },
    { menuId: 'menu-passengers', arrowId: 'icon-pass-arrow', containerId: 'passengers-container' }
  ];

  menus.forEach(({ menuId, arrowId, containerId }) => {
    const el = document.getElementById(menuId);
    if (el) el.classList.add('hidden');
    const arrow = document.getElementById(arrowId);
    if (arrow) arrow.classList.remove('rotate-180');
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) container.classList.remove('z-40');
    }
  });

  const rowLoc = document.getElementById('row-locations');
  if (rowLoc) rowLoc.classList.remove('z-40');
  const rowDP = document.getElementById('row-dates-passengers');
  if (rowDP) rowDP.classList.remove('z-40');
}

function toggleSearchMenu(menuId, arrowId, containerId) {
  const menu = document.getElementById(menuId);
  const arrow = document.getElementById(arrowId);
  const container = document.getElementById(containerId);
  if (!menu) return;

  const isAlreadyOpen = !menu.classList.contains('hidden');
  closeAllSearchMenus();

  if (!isAlreadyOpen) {
    menu.classList.remove('hidden');
    if (arrow) arrow.classList.add('rotate-180');
    if (container) container.classList.add('z-40');
    const rowDP = document.getElementById('row-dates-passengers');
    if (rowDP) rowDP.classList.add('z-40');
  }
}

// Lista com as capitais da região sudeste mais São Carlos
const CIDADES_SUDESTE = [
  'São Paulo (Terminal Tietê)',
  'Rio de Janeiro (Rodoviária Novo Rio)',
  'Belo Horizonte (Terminal Rodoviário)',
  'Vitória (Terminal Rodoviário)',
  'São Carlos (Terminal Rodoviário)'
];

const normalizeStr = (str) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function setupCityDropdown(inputId, dropdownId, arrowId, boxId, btnToggleId, stateKey) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const arrow = document.getElementById(arrowId);
  const box = document.getElementById(boxId);
  const btnToggle = document.getElementById(btnToggleId);

  if (!input || !dropdown) return;

  const renderDropdownList = (filterText = '') => {
    const q = normalizeStr(filterText);
    const filtered = CIDADES_SUDESTE.filter(c => !q || normalizeStr(c).includes(q));

    dropdown.innerHTML = '';
    if (filtered.length === 0) {
      dropdown.innerHTML = '<div class="p-3 text-center text-xs text-slate-400 select-none">Nenhuma cidade encontrada</div>';
      return;
    }

    filtered.forEach(cidade => {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = 'w-full text-left px-3 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer truncate';
      itemBtn.textContent = cidade;

      itemBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = cidade;
        state.searchParams[stateKey] = cidade;
        closeThisDropdown();
      });

      dropdown.appendChild(itemBtn);
    });
  };

  const openThisDropdown = (filterText = '') => {
    closeAllSearchMenus();
    renderDropdownList(filterText);
    dropdown.classList.remove('hidden');
    if (arrow) arrow.classList.add('rotate-180');
    const container = input.closest('.relative');
    if (container) container.classList.add('z-40');
    const rowLoc = document.getElementById('row-locations');
    if (rowLoc) rowLoc.classList.add('z-40');
  };

  const closeThisDropdown = () => {
    dropdown.classList.add('hidden');
    if (arrow) arrow.classList.remove('rotate-180');
    const container = input.closest('.relative');
    if (container) container.classList.remove('z-40');
    const rowLoc = document.getElementById('row-locations');
    if (rowLoc) rowLoc.classList.remove('z-40');
  };

  // Ao digitar: abre e filtra em tempo real
  input.addEventListener('input', () => {
    state.searchParams[stateKey] = input.value;
    openThisDropdown(input.value);
  });

  // Ao focar no input: abre a lista completa de opções
  input.addEventListener('focus', () => {
    openThisDropdown('');
  });

  // Ao clicar no botão de seta: alterna aberto / fechado
  if (btnToggle) {
    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !dropdown.classList.contains('hidden');
      if (isOpen) {
        closeThisDropdown();
      } else {
        openThisDropdown('');
        input.focus();
      }
    });
  }

  // Ao clicar na box (fora do input): alterna / foca
  if (box) {
    box.addEventListener('click', (e) => {
      if (e.target !== input && (!btnToggle || !btnToggle.contains(e.target))) {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen) {
          closeThisDropdown();
        } else {
          openThisDropdown('');
          input.focus();
        }
      }
    });
  }

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  state.searchParams[stateKey] = input.value;
}

function setupSearchForm() {
  const inputOrigin = document.getElementById('input-origin');
  const inputDest = document.getElementById('input-destination');

  // 1. Setup Origem e Destino com lista suspensa estilizada
  setupCityDropdown('input-origin', 'list-origin-dropdown', 'icon-origin-arrow', 'box-origin', 'btn-toggle-origin-list', 'origin');
  setupCityDropdown('input-destination', 'list-dest-dropdown', 'icon-dest-arrow', 'box-destination', 'btn-toggle-dest-list', 'destination');

  // 3. Setup Dia / Calendário Padrão Default
  const boxDate = document.getElementById('box-date');
  const dateInput = document.getElementById('native-date-input');
  const displayDate = document.getElementById('display-date');

  const formatDisplayDate = (d) => {
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const day = d.getDate();
    const monthName = months[d.getMonth()];
    const weekdayName = weekdays[d.getDay()];
    return `${day} de ${monthName} · ${weekdayName}`;
  };

  // Inicializa por default com a data de hoje
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayISO = `${yyyy}-${mm}-${dd}`;

  if (dateInput) {
    dateInput.value = todayISO;

    const handleDateUpdate = () => {
      if (dateInput.value) {
        const [year, month, day] = dateInput.value.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day, 12, 0, 0);
        const formatted = formatDisplayDate(selectedDate);
        if (displayDate) displayDate.textContent = formatted;
        state.searchParams.date = formatted;
      }
    };

    dateInput.addEventListener('change', handleDateUpdate);
    dateInput.addEventListener('input', handleDateUpdate);

    dateInput.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        dateInput.showPicker();
      } catch (err) {}
    });
  }

  const initialDateFormatted = formatDisplayDate(today);
  if (displayDate) {
    displayDate.textContent = initialDateFormatted;
  }
  state.searchParams.date = initialDateFormatted;

  if (boxDate && dateInput) {
    boxDate.addEventListener('click', () => {
      try {
        dateInput.showPicker();
      } catch (err) {
        dateInput.focus();
      }
    });
  }

  // 4. Setup Passageiros (Apenas Quantidades)
  const boxPassengers = document.getElementById('box-passengers');
  const menuPassengers = document.getElementById('menu-passengers');
  const displayPassengers = document.getElementById('display-passengers');

  if (boxPassengers) {
    boxPassengers.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSearchMenu('menu-passengers', 'icon-pass-arrow', 'passengers-container');
    });
  }

  if (menuPassengers) {
    menuPassengers.addEventListener('click', (e) => e.stopPropagation());
  }

  const numAdults = document.getElementById('num-adults');
  const numChildren = document.getElementById('num-children');
  const numBabies = document.getElementById('num-babies');
  const numPets = document.getElementById('num-pets');

  const updateCounterDisplays = () => {
    if (numAdults) numAdults.textContent = state.searchParams.adults;
    if (numChildren) numChildren.textContent = state.searchParams.children;
    if (numBabies) numBabies.textContent = state.searchParams.babies;
    if (numPets) numPets.textContent = state.searchParams.pets;
  };

  const setupCounter = (subBtnId, addBtnId, key, minVal) => {
    const subBtn = document.getElementById(subBtnId);
    const addBtn = document.getElementById(addBtnId);

    if (subBtn) {
      subBtn.addEventListener('click', () => {
        if (state.searchParams[key] > minVal) {
          state.searchParams[key]--;
          updateCounterDisplays();
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (state.searchParams[key] < 9) {
          state.searchParams[key]++;
          updateCounterDisplays();
        }
      });
    }
  };

  setupCounter('btn-sub-adults', 'btn-add-adults', 'adults', 1);
  setupCounter('btn-sub-children', 'btn-add-children', 'children', 0);
  setupCounter('btn-sub-babies', 'btn-add-babies', 'babies', 0);
  setupCounter('btn-sub-pets', 'btn-add-pets', 'pets', 0);
  updateCounterDisplays();

  const btnConfirmPassengers = document.getElementById('btn-confirm-passengers');
  if (btnConfirmPassengers) {
    btnConfirmPassengers.addEventListener('click', () => {
      const parts = [];
      const { adults, children, babies, pets } = state.searchParams;

      if (adults === 1) parts.push('1 adulto');
      else if (adults > 1) parts.push(`${adults} adultos`);

      if (children === 1) parts.push('1 criança');
      else if (children > 1) parts.push(`${children} crianças`);

      if (babies === 1) parts.push('1 bebê');
      else if (babies > 1) parts.push(`${babies} bebês`);

      if (pets === 1) parts.push('1 pet');
      else if (pets > 1) parts.push(`${pets} pets`);

      const summary = parts.length > 0 ? parts.join(', ') : '1 adulto';
      state.searchParams.passengers = summary;
      if (displayPassengers) displayPassengers.textContent = summary;
      closeAllSearchMenus();
    });
  }

  // 5. Botão Inverter Origem e Destino (Swap ⇅)
  const btnSwap = document.getElementById('btn-swap');

  if (btnSwap && inputOrigin && inputDest) {
    btnSwap.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllSearchMenus();

      const tempVal = inputOrigin.value;
      inputOrigin.value = inputDest.value;
      inputDest.value = tempVal;

      state.searchParams.origin = inputOrigin.value;
      state.searchParams.destination = inputDest.value;
    });
  }

  // 6. Fechar menus ao clicar fora
  document.addEventListener('click', () => {
    closeAllSearchMenus();
  });

  // 7. Botão Principal "Buscar passagens"
  const btnSearch = document.getElementById('btn-search-trips');
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      closeAllSearchMenus();

      // Atualiza o cabeçalho de rotas com a busca do usuário
      const title = document.getElementById('route-header-title');
      const subtitle = document.getElementById('route-header-subtitle');
      if (title) {
        const origCity = (state.searchParams.origin || 'São Paulo').split('(')[0].split(',')[0].trim();
        const destCity = (state.searchParams.destination || 'Rio de Janeiro').split('(')[0].split(',')[0].trim();
        title.textContent = `${origCity} ➔ ${destCity}`;
      }
      if (subtitle) {
        const shortDate = state.searchParams.date.split('·')[0].trim();
        subtitle.textContent = `${shortDate} · ${state.searchParams.passengers}`;
      }

      if (document.getElementById('screen-rotas')) {
        navigateToScreen('screen-rotas');
        switchRotasView('lista');
      } else {
        window.location.href = 'rotas.html';
      }
    });
  }
}

// ==========================================================================
// 4. Filtros de Modalidade e Alternância de Visão (Lista / Mapa)
// ==========================================================================
function setupResultsFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeModalFilter = pill.dataset.modal;
      renderTripsList();
    });
  });
}

// ==========================================================================
// 5. Integração com Leaflet e OpenStreetMap
// ==========================================================================
function ensureMapRendered() {
  if (!state.mapInstance) {
    initLeafletMap();
  } else {
    state.mapInstance.invalidateSize();
  }
}

function initLeafletMap() {
  const mapElement = document.getElementById('map-container');
  if (!mapElement || typeof L === 'undefined') return;

  // 1. Cria a instância do mapa centralizada entre SP e RJ
  state.mapInstance = L.map('map-container', {
    zoomControl: false
  }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

  // Adiciona controle de zoom no topo à direita para não conflitar com a gaveta
  L.control.zoom({ position: 'topright' }).addTo(state.mapInstance);

  // 2. Camada base de tiles do OpenStreetMap (exatamente como ensinado no cursoweb2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(state.mapInstance);

  // 3. Marcadores de Origem e Destino com ícones customizados
  const iconOrigin = L.divIcon({
    className: 'custom-map-marker',
    html: '<div style="background-color:#22C55E;width:16px;height:16px;border-radius:50%;border:3px solid #FFF;box-shadow:0 2px 5px rgba(0,0,0,0.4);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  const iconDest = L.divIcon({
    className: 'custom-map-marker',
    html: '<div style="background-color:#EF4444;width:16px;height:16px;border-radius:50%;border:3px solid #FFF;box-shadow:0 2px 5px rgba(0,0,0,0.4);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  L.marker(MAP_CONFIG.cities.origin.coords, { icon: iconOrigin })
    .bindPopup('<b>Origem:</b> ' + MAP_CONFIG.cities.origin.name)
    .addTo(state.mapInstance);

  L.marker(MAP_CONFIG.cities.destination.coords, { icon: iconDest })
    .bindPopup('<b>Destino:</b> ' + MAP_CONFIG.cities.destination.name)
    .addTo(state.mapInstance);

  // 4. Desenha as rotas no mapa
  drawRoutesOnMap();
}

function drawRoutesOnMap() {
  if (!state.mapInstance) return;

  // Limpa camadas anteriores se houver
  Object.values(state.routeLayers).forEach(layer => state.mapInstance.removeLayer(layer));
  state.routeLayers = {};

  MAP_CONFIG.routes.forEach(route => {
    const isSelected = route.id === state.selectedRouteId;
    
    const polyline = L.polyline(route.waypoints, {
      color: isSelected ? '#1D72B8' : '#94A3B8',
      weight: isSelected ? 6 : 3,
      opacity: isSelected ? 0.95 : 0.55,
      dashArray: isSelected ? null : '6, 6'
    }).addTo(state.mapInstance);

    polyline.on('click', () => {
      selectRoute(route.id);
    });

    state.routeLayers[route.id] = polyline;
  });
}

// ==========================================================================
// 6. Gaveta Inferior (Bottom Sheet / Drawer) do Mapa
// ==========================================================================
function setupDrawerRoutes() {
  const routeOptions = document.querySelectorAll('.drawer-route-option');
  routeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const routeId = opt.dataset.routeId;
      selectRoute(routeId);
    });
  });

  // Interatividade da Gaveta: Puxador (Drag handle) recolhe / expande a gaveta
  const drawerHandle = document.getElementById('drawer-handle');
  const bottomDrawer = document.getElementById('routes-bottom-drawer');
  if (drawerHandle && bottomDrawer) {
    drawerHandle.addEventListener('click', () => {
      bottomDrawer.classList.toggle('collapsed');
    });
  }

  // Botão "Confirmar rota" da gaveta
  const btnConfirm = document.getElementById('btn-confirm-route');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      const currentRoute = MAP_CONFIG.routes.find(r => r.id === state.selectedRouteId);
      
      // Conforme 'A tela deve usar visão.txt':
      // Quando selecionar a rota, adiciona à lista e vai para a tela 'Minhas Viagens'
      addTicketToMyTrips({
        modalText: `${currentRoute.name} · Ônibus Executivo`,
        seat: '15',
        origin: (state.searchParams.origin || 'São Paulo').split('(')[0].split(',')[0].trim(),
        destination: (state.searchParams.destination || 'Rio de Janeiro').split('(')[0].split(',')[0].trim(),
        dateTime: `${state.searchParams.date.split('·')[0].trim()} · 22:30`,
        icon: 'directions_bus'
      });

      navigateToScreen('screen-minhas-viagens');
    });
  }
}

function selectRoute(routeId) {
  state.selectedRouteId = routeId;

  // Atualiza seleção visual dos rádios na gaveta
  document.querySelectorAll('.drawer-route-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.routeId === routeId);
  });

  // Atualiza badge flutuante sobre o mapa
  const currentRoute = MAP_CONFIG.routes.find(r => r.id === routeId);
  const badge = document.getElementById('floating-route-text');
  if (badge && currentRoute) {
    badge.textContent = `${currentRoute.name} · ${currentRoute.distance}`;
  }

  // Atualiza destaque das linhas no mapa
  drawRoutesOnMap();
}

// ==========================================================================
// 7. Renderização da Lista de Resultados de Viagens
// ==========================================================================
function renderTripsList() {
  const listContainer = document.getElementById('trips-list-container');
  if (!listContainer) return;

  const filteredTrips = MOCK_AVAILABLE_TRIPS.filter(trip => {
    if (state.activeModalFilter === 'Todos') return true;
    return trip.modal === state.activeModalFilter;
  });

  // Atualiza contador de opções
  const counterElem = document.getElementById('results-count');
  if (counterElem) {
    counterElem.textContent = `${filteredTrips.length} opções`;
  }

  listContainer.innerHTML = '';

  filteredTrips.forEach(trip => {
    const card = document.createElement('article');
    card.className = 'bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3.5';

    const ratingHtml = trip.rating ? `<span class="text-xs font-semibold text-amber-500">${trip.rating}</span>` : '';
    
    let statusClass = 'text-slate-400';
    if (trip.statusCode === 'available') statusClass = 'text-emerald-700';
    if (trip.statusCode === 'few-seats') statusClass = 'text-red-600';

    let iconBg = 'bg-sky-50 text-sky-700';
    if (trip.badgeClass === 'green') iconBg = 'bg-emerald-50 text-emerald-700';
    if (trip.badgeClass === 'orange') iconBg = 'bg-orange-50 text-orange-600';

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center">
            <span class="material-icons text-xl">${trip.icon}</span>
          </div>
          <div class="flex flex-col">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">${trip.carrier} ${ratingHtml}</h3>
            <span class="text-xs text-slate-500">${trip.type}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="block text-[10px] font-bold text-slate-400 tracking-wider">A PARTIR DE</span>
          <div class="text-lg font-extrabold text-slate-900">R$ ${trip.price.toFixed(2).replace('.', ',')}</div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span class="text-base font-extrabold text-slate-900">${trip.departureTime}</span>
        <div class="flex-1 flex flex-col items-center gap-0.5">
          <span class="text-[11px] font-semibold text-slate-500">${trip.duration}</span>
          <div class="w-full h-0.5 bg-slate-200 relative flex items-center justify-between">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
        </div>
        <span class="text-base font-extrabold text-slate-900">${trip.arrivalTime}</span>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <span class="text-xs font-semibold ${statusClass}">${trip.statusText}</span>
        ${
          trip.isAvailable
            ? `<button class="btn-select-trip bg-orange-600 hover:bg-orange-700 text-white text-xs md:text-sm font-bold py-2 px-4 rounded-lg transition-colors" data-trip-id="${trip.id}">Selecionar</button>`
            : `<button class="btn-select-trip disabled bg-slate-100 text-slate-400 text-xs md:text-sm font-bold py-2 px-4 rounded-lg cursor-not-allowed border border-slate-200" disabled>Indisponível</button>`
        }
      </div>
    `;

    listContainer.appendChild(card);
  });

  // Event listener para botões "Selecionar"
  listContainer.querySelectorAll('.btn-select-trip:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const tripId = btn.dataset.tripId;
      const trip = MOCK_AVAILABLE_TRIPS.find(t => t.id === tripId);
      if (trip) {
        addTicketToMyTrips({
          modalText: `${trip.type} · ${trip.carrier}`,
          seat: trip.seatNumber || '01',
          origin: (state.searchParams.origin || 'São Paulo').split('(')[0].split(',')[0].trim(),
          destination: (state.searchParams.destination || 'Rio de Janeiro').split('(')[0].split(',')[0].trim(),
          dateTime: `${state.searchParams.date.split('·')[0].trim()} · ${trip.departureTime}`,
          icon: trip.icon
        });

        // Conforme requisito do arquivo txt: navegar direto para 'Minhas Viagens'
        navigateToScreen('screen-minhas-viagens');
      }
    });
  });
}

// ==========================================================================
// 8. Tela "Minhas Viagens" (Adição e Renderização)
// ==========================================================================
function addTicketToMyTrips(newTicket) {
  const ticketWithId = {
    ...newTicket,
    id: 'my-trip-' + Date.now()
  };
  state.userTrips.unshift(ticketWithId);
  renderMyTripsList();
}

function renderMyTripsList() {
  const container = document.getElementById('my-tickets-container');
  if (!container) return;

  container.innerHTML = '';

  state.userTrips.forEach(ticket => {
    const card = document.createElement('article');
    card.className = 'bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-900">
          <span class="material-icons text-sky-700 text-xl">${ticket.icon}</span>
          <span>${ticket.modalText}</span>
        </div>
        <div class="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-center">
          <span class="block text-[9px] font-bold text-slate-400">ASSENTO</span>
          <span class="text-sm font-extrabold text-slate-900">${ticket.seat}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 text-base font-extrabold text-slate-900">
        <span>${ticket.origin}</span>
        <span class="material-icons text-sky-700 text-lg">arrow_forward</span>
        <span>${ticket.destination}</span>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>${ticket.dateTime}</span>
        <span class="text-sm font-extrabold text-slate-900">${ticket.price || ''}</span>
      </div>
    `;

    container.appendChild(card);
  });
}
