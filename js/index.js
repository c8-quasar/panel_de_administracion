// Dynamic Recipe Filtering & Search Behavior
        (function initRecipeCatalog() {
          const searchInput = document.getElementById("recipe-search-input");
          const searchBtn = document.getElementById("search-btn");
          const filterChips = document.querySelectorAll(".filter-chip");
          const recipeCards = document.querySelectorAll(".recipe-card");
          const recipeCount = document.getElementById("recipe-count");
          const noResults = document.getElementById("no-results");
          const resetFiltersBtn = document.getElementById("reset-filters-btn");

          let currentFilter = "all";
          let searchQuery = "";

          function applyFilterAndSearch() {
            let visibleCount = 0;
            const normalizedQuery = searchQuery.trim().toLowerCase();

            recipeCards.forEach((card) => {
              const country = card.getAttribute("data-country");
              const searchMetadata = card
                .getAttribute("data-name")
                .toLowerCase();

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

            // Update counters & empty state
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

          // Filter Chips Event Listeners
          filterChips.forEach((chip) => {
            chip.addEventListener("click", () => {
              filterChips.forEach((c) => {
                c.classList.remove(
                  "bg-primary-container",
                  "text-on-primary",
                  "active-filter",
                  "shadow-sm",
                );
                c.classList.add("bg-surface-container", "text-on-surface");
              });
              chip.classList.add(
                "bg-primary-container",
                "text-on-primary",
                "active-filter",
                "shadow-sm",
              );
              chip.classList.remove("bg-surface-container", "text-on-surface");

              currentFilter = chip.getAttribute("data-filter") || "all";
              applyFilterAndSearch();
            });
          });

          // Search input listener
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

          // Reset button in empty state
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
                    "shadow-sm",
                  );
                  c.classList.remove("bg-surface-container", "text-on-surface");
                } else {
                  c.classList.remove(
                    "bg-primary-container",
                    "text-on-primary",
                    "active-filter",
                    "shadow-sm",
                  );
                  c.classList.add("bg-surface-container", "text-on-surface");
                }
              });

              applyFilterAndSearch();
            });
          }
        })();