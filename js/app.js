(() => {
  const state = {
    uberCost: 20,
    uberTime: 15,
    transitTime: 35,
    transitCost: 3,
    priority: null,
    luggage: null,
    energy: null,
    upside: null,
    dread: null,
    regret: null,
  };

  let currentScreen = 1;
  const totalScreens = 6;

  // DOM refs
  const progressFill = document.getElementById("progress-fill");
  const backBtn = document.getElementById("back-btn");
  const screens = document.querySelectorAll(".screen");

  // --- Sliders ---
  const sliders = [
    { id: "uber-cost", key: "uberCost", format: (v) => `$${v}` },
    { id: "uber-time", key: "uberTime", format: (v) => `${v} min` },
    { id: "transit-time", key: "transitTime", format: (v) => `${v} min` },
    { id: "transit-cost", key: "transitCost", format: (v) => `$${v}` },
  ];

  sliders.forEach(({ id, key, format }) => {
    const input = document.getElementById(id);
    const display = document.getElementById(`${id}-val`);
    input.addEventListener("input", () => {
      const val = parseFloat(input.value);
      state[key] = val;
      display.textContent = format(val);
    });
  });

  // --- Option buttons (radio behavior) ---
  document.querySelectorAll(".options").forEach((group) => {
    const name = group.dataset.name;
    group.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Deselect siblings
        group.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        state[name] = btn.dataset.value;

        // Enable next button for this screen
        updateNextButton();
      });
    });
  });

  function updateNextButton() {
    // Screen 2: need priority
    if (currentScreen === 2) {
      const btn = document.getElementById("next-2");
      btn.disabled = !state.priority;
    }
    // Screen 3: need all three vibe check answers
    if (currentScreen === 3) {
      const btn = document.getElementById("next-3");
      btn.disabled = !(state.luggage && state.energy && state.upside);
    }
    // Screen 4: need dread
    if (currentScreen === 4) {
      const btn = document.getElementById("next-4");
      btn.disabled = !state.dread;
    }
    // Screen 5: need regret
    if (currentScreen === 5) {
      const btn = document.getElementById("next-5");
      btn.disabled = !state.regret;
    }
  }

  // --- Navigation ---
  function goTo(screen) {
    currentScreen = screen;

    screens.forEach((s) => {
      s.classList.remove("active");
      if (parseInt(s.dataset.screen) === screen) {
        s.classList.add("active");
      }
    });

    // Progress bar
    progressFill.style.width = `${(screen / totalScreens) * 100}%`;

    // Back button
    backBtn.classList.toggle("visible", screen > 1 && screen < 6);

    // Screen 5: update the subtitle with calculated time difference
    if (screen === 5) {
      const timeDiff = state.transitTime - state.uberTime;
      const subtitle = document.getElementById("regret-subtitle");
      if (timeDiff > 0) {
        subtitle.textContent = `You pay for the car. You arrive ${timeDiff} minutes earlier. What actually happens?`;
      } else {
        subtitle.textContent = `The rideshare isn't even faster. But say you take it anyway — what happens?`;
      }
    }

    // Screen 6: generate verdict
    if (screen === 6) {
      document.getElementById("verdict-text").textContent = generateVerdict(state);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Next buttons
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`next-${i}`).addEventListener("click", () => {
      goTo(i + 1);
    });
  }

  // Back button
  backBtn.addEventListener("click", () => {
    if (currentScreen > 1) {
      goTo(currentScreen - 1);
    }
  });

  // Start over
  document.getElementById("start-over").addEventListener("click", () => {
    // Reset state
    state.priority = null;
    state.luggage = null;
    state.energy = null;
    state.upside = null;
    state.dread = null;
    state.regret = null;

    // Reset sliders to defaults
    document.getElementById("uber-cost").value = 20;
    document.getElementById("uber-time").value = 15;
    document.getElementById("transit-time").value = 35;
    document.getElementById("transit-cost").value = 3;
    state.uberCost = 20;
    state.uberTime = 15;
    state.transitTime = 35;
    state.transitCost = 3;

    // Update slider displays
    document.getElementById("uber-cost-val").textContent = "$20";
    document.getElementById("uber-time-val").textContent = "15 min";
    document.getElementById("transit-time-val").textContent = "35 min";
    document.getElementById("transit-cost-val").textContent = "$3";

    // Deselect all options
    document.querySelectorAll(".option-btn").forEach((btn) => btn.classList.remove("selected"));

    // Disable next buttons on screens 2-5
    document.getElementById("next-2").disabled = true;
    document.getElementById("next-3").disabled = true;
    document.getElementById("next-4").disabled = true;
    document.getElementById("next-5").disabled = true;

    goTo(1);
  });

  // Initialize
  goTo(1);
})();
