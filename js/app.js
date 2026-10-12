/**
 * Vialá - Lógica da Aplicação
 * Disciplina DSW2 - UFSCar
 * 
 * Controla o formulário de busca de passagens (origem, destino, data e passageiros).
 */

// Estado do formulário de busca
const state = {
  searchParams: {
    origin: 'São Paulo (Terminal Tietê)',
    destination: 'Rio de Janeiro (Rodoviária Novo Rio)',
    date: '',
    passengers: '1 adulto',
    adults: 1,
    children: 0,
    babies: 0,
    pets: 0
  }
};

// ==========================================================================
// 1. Inicialização
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupSearchForm();
});

// ==========================================================================
// 2. Controle dos Menus Suspensos (Origem, Destino e Passageiros)
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

  // Filtra opções ao digitar
  input.addEventListener('input', () => {
    state.searchParams[stateKey] = input.value;
    openThisDropdown(input.value);
  });

  // Exibe lista completa ao focar no campo
  input.addEventListener('focus', () => {
    openThisDropdown('');
  });

  // Alterna lista ao clicar na seta
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

  // Alterna lista ao clicar no container do campo
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

// ==========================================================================
// 3. Configuração do Formulário de Busca
// ==========================================================================
function setupSearchForm() {
  const inputOrigin = document.getElementById('input-origin');
  const inputDest = document.getElementById('input-destination');

  // 1. Campos de Origem e Destino
  setupCityDropdown('input-origin', 'list-origin-dropdown', 'icon-origin-arrow', 'box-origin', 'btn-toggle-origin-list', 'origin');
  setupCityDropdown('input-destination', 'list-dest-dropdown', 'icon-dest-arrow', 'box-destination', 'btn-toggle-dest-list', 'destination');

  // 2. Seletor de Data
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

  // 3. Seletor de Passageiros
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

  // 4. Inversão entre Origem e Destino
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

  // 5. Fechamento de menus ao clicar fora
  document.addEventListener('click', () => {
    closeAllSearchMenus();
  });

  // 6. Ação de busca de passagens
  const btnSearch = document.getElementById('btn-search-trips');
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      closeAllSearchMenus();
    });
  }
}
