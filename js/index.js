const API_URL = "https://panel-de-administracion.onrender.com/recetas";
const IMAGEN_POR_DEFECTO =
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80";

(function initRecipeCatalog() {
  const recipeGrid = document.getElementById("recipe-grid");
  const searchInput = document.getElementById("recipe-search-input");
  const searchBtn = document.getElementById("search-btn");
  const filterChips = document.querySelectorAll(".filter-chip");
  const recipeCount = document.getElementById("recipe-count");
  const noResults = document.getElementById("no-results");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  let currentFilter = "all";
  let searchQuery = "";

  // Normaliza el nombre del país para que coincida con los data-filter de tus botones
  // Ej: "Japón" -> "japon", "Corea del Sur" -> "corea"
  function obtenerSlugPais(pais = "") {
    const limpio = pais
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (limpio.includes("corea")) return "corea";
    if (limpio.includes("japon")) return "japon";
    if (limpio.includes("tailandia")) return "tailandia";
    if (limpio.includes("china")) return "china";
    if (limpio.includes("vietnam")) return "vietnam";
    return limpio;
  }

  // Devuelve bandera y estilos de color según el país
  function obtenerEstiloPais(slug) {
    const estilos = {
      japon: {
        bandera: "🇯🇵",
        clases: "bg-tertiary-fixed-dim/90 text-tertiary",
      },
      tailandia: {
        bandera: "🇹🇭",
        clases: "bg-secondary-fixed/90 text-secondary",
      },
      corea: {
        bandera: "🇰🇷",
        clases: "bg-primary-fixed/90 text-primary",
      },
      china: {
        bandera: "🇨🇳",
        clases: "bg-surface-container-high/90 text-on-surface",
      },
      vietnam: {
        bandera: "🇻🇳",
        clases: "bg-tertiary-fixed/90 text-tertiary",
      },
    };

    return (
      estilos[slug] || {
        bandera: "🥢",
        clases: "bg-surface-container-high/90 text-on-surface",
      }
    );
  }

  // 1. Consulta la API y renderiza las tarjetas publicadas
  async function cargarRecetasPublicas() {
    if (!recipeGrid) return;

    try {
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const recetas = await respuesta.json();

      // Filtra solo las recetas publicadas (si no tienen campo estado, las muestra igual)
      const publicadas = recetas.filter(
        (receta) => !receta.estado || receta.estado === "Publicado"
      );

      renderizarTarjetas(publicadas);
      applyFilterAndSearch();
    } catch (error) {
      console.error("No se pudo conectar con JSON Server:", error);
      recipeGrid.innerHTML = `
        <div class="col-span-full text-center py-space-xl bg-surface-container-low rounded-xl">
          <p class="font-headline-sm text-headline-sm text-primary">
            No se pudo cargar el recetario en este momento
          </p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Verifica que JSON Server esté ejecutándose en ${API_URL}
          </p>
        </div>
      `;
      if (recipeCount) recipeCount.textContent = "0 preparaciones";
    }
  }

  // 2. Genera el HTML de cada tarjeta manteniendo tus clases y atributos data-*
  function renderizarTarjetas(listaRecetas) {
    recipeGrid.innerHTML = "";

    listaRecetas.forEach((receta) => {
      const slugPais = obtenerSlugPais(receta.pais);
      const estilo = obtenerEstiloPais(slugPais);
      const tiempo = receta.tiempo || receta.tiempoMinutos || 30;
      const porciones = receta.porciones || 2;
      const metadatosBusqueda =
        `${receta.titulo} ${receta.pais} ${receta.dificultad} ${receta.descripcion}`.toLowerCase();

      const article = document.createElement("article");
      article.className =
        "recipe-card flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group";
      article.setAttribute("data-country", slugPais);
      article.setAttribute("data-name", metadatosBusqueda);

      article.innerHTML = `
        <div class="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
          <img
            alt="${receta.titulo}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            src="${receta.imagen || IMAGEN_POR_DEFECTO}"
            onerror="this.src='${IMAGEN_POR_DEFECTO}'"
          />
          <div class="absolute top-space-sm left-space-sm">
            <span
              class="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full ${estilo.clases} backdrop-blur-sm font-label-sm text-label-sm font-semibold tracking-wide"
            >
              <span>${estilo.bandera}</span> ${receta.pais}
            </span>
          </div>
        </div>
        <div class="p-space-md flex flex-col flex-1 justify-between">
          <div class="space-y-space-xs">
            <h3
              class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"
            >
              ${receta.titulo}
            </h3>
            <p
              class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3"
            >
              ${receta.descripcion}
            </p>
          </div>
          <div class="mt-space-md pt-space-sm space-y-space-sm">
            <div
              class="flex items-center justify-between text-on-surface-variant font-label-md text-label-md"
            >
              <span class="flex items-center gap-1 text-secondary">
                <span class="material-symbols-outlined text-[18px]">schedule</span>
                ${tiempo} min
              </span>
              <span
                class="flex items-center gap-1 text-on-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded"
              >
                <span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
                ${receta.dificultad}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">group</span>
                ${porciones} pers.
              </span>
            </div>
            <a
              class="w-full inline-flex items-center justify-between px-space-md py-2.5 rounded bg-surface-container hover:bg-primary-container text-on-surface hover:text-on-primary font-label-md text-label-md transition-all group/btn"
              href="receta.html?id=${receta.id}"
            >
              <span>Ver Receta Completa</span>
              <span
                class="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform"
                >arrow_forward</span
              >
            </a>
          </div>
        </div>
      `;

      recipeGrid.appendChild(article);
    });
  }

  // 3. Filtra sobre las tarjetas ya pintadas en el DOM
  function applyFilterAndSearch() {
    const recipeCards = document.querySelectorAll(".recipe-card");
    let visibleCount = 0;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    recipeCards.forEach((card) => {
      const country = card.getAttribute("data-country");
      const searchMetadata = (
        card.getAttribute("data-name") || ""
      ).toLowerCase();

      const matchesCountry =
        currentFilter === "all" || country === currentFilter;
      const matchesSearch =
        !normalizedQuery || searchMetadata.includes(normalizedQuery);

      if (matchesCountry && matchesSearch) {
        card.classList.remove("hidden");
        card.classList.add("flex");
        visibleCount++;
      } else {
        card.classList.add("hidden");
        card.classList.remove("flex");
      }
    });

    if (recipeCount) {
      recipeCount.textContent =
        visibleCount === 1
          ? "1 preparación"
          : `${visibleCount} preparaciones`;
    }

    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.remove("hidden");
        noResults.classList.add("flex");
      } else {
        noResults.classList.add("hidden");
        noResults.classList.remove("flex");
      }
    }
  }

  // Eventos de los chips de filtro
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => {
        c.classList.remove(
          "bg-primary-container",
          "text-on-primary",
          "active-filter",
          "shadow-sm"
        );
        c.classList.add("bg-surface-container", "text-on-surface");
      });
      chip.classList.add(
        "bg-primary-container",
        "text-on-primary",
        "active-filter",
        "shadow-sm"
      );
      chip.classList.remove("bg-surface-container", "text-on-surface");

      currentFilter = chip.getAttribute("data-filter") || "all";
      applyFilterAndSearch();
    });
  });

  // Eventos del buscador
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      applyFilterAndSearch();
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchQuery = searchInput.value;
        applyFilterAndSearch();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      if (searchInput) {
        searchQuery = searchInput.value;
        applyFilterAndSearch();
      }
    });
  }

  // Botón de restablecer filtros
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      currentFilter = "all";

      filterChips.forEach((c, index) => {
        if (index === 0) {
          c.classList.add(
            "bg-primary-container",
            "text-on-primary",
            "active-filter",
            "shadow-sm"
          );
          c.classList.remove("bg-surface-container", "text-on-surface");
        } else {
          c.classList.remove(
            "bg-primary-container",
            "text-on-primary",
            "active-filter",
            "shadow-sm"
          );
          c.classList.add("bg-surface-container", "text-on-surface");
        }
      });

      applyFilterAndSearch();
    });
  }

  // Inicia la carga al abrir o recargar la página
  document.addEventListener("DOMContentLoaded", cargarRecetasPublicas);
})();