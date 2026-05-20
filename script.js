const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Custom cursor for pointer devices
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

if (cursor && ring && window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  document.querySelectorAll("a, button, input, textarea").forEach((element) => {
    element.addEventListener("mouseenter", () =>
      document.body.classList.add("is-hovering"),
    );
    element.addEventListener("mouseleave", () =>
      document.body.classList.remove("is-hovering"),
    );
  });
}

// Mobile navigation
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

function closeNav() {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("open");
  document.body.classList.remove("nav-open");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });
}

// Smooth anchor navigation
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    closeNav();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", targetId);
  });
});

// Reveal animation and skill meters
const revealElements = document.querySelectorAll(".reveal");
const meterBars = document.querySelectorAll(".skill-meter span");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        entry.target.querySelectorAll(".skill-meter span").forEach((bar) => {
          bar.style.width = `${bar.dataset.width || 0}%`;
        });

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
  meterBars.forEach((bar) => {
    bar.style.width = `${bar.dataset.width || 0}%`;
  });
}

// Active navigation state and scroll-to-top visibility
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-menu a")];
const scrollTop = document.getElementById("scrollTop");

function updateScrollState() {
  const current = sections
    .filter((section) => window.scrollY >= section.offsetTop - 180)
    .at(-1);

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      current && link.getAttribute("href") === `#${current.id}`,
    );
  });

  if (scrollTop) {
    scrollTop.classList.toggle("visible", window.scrollY > 300);
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

if (scrollTop) {
  scrollTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}

// Subtle hero card tilt
document.querySelectorAll(".tilt-card").forEach((card) => {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches)
    return;

  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// About section — auto-slideshow carousel
(function () {
  const slides = [...document.querySelectorAll(".about-carousel-slide")];
  const dots = [...document.querySelectorAll(".about-dot")];
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 3500);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.slide));
      resetAuto();
    });
  });

  if (!prefersReducedMotion) startAuto();
})();

// Hero profile — play video on hover, pause on leave
(function () {
  const card = document.querySelector(".profile-card");
  const vid = document.querySelector(".profile-vid-hover");
  if (!card || !vid) return;

  card.addEventListener("mouseenter", () => {
    vid.currentTime = 0;
    vid.play().catch(() => {});
  });

  card.addEventListener("mouseleave", () => {
    vid.pause();
    vid.currentTime = 0;
  });
})();

const paletteToggle = document.getElementById("paletteToggle");
const palettePanel = document.getElementById("palettePanel");
const paletteOptions = [...document.querySelectorAll(".palette-option")];

function applyPalette(palette) {
  document.body.classList.toggle("palette-peacock", palette === "peacock");
  paletteOptions.forEach((option) => {
    option.classList.toggle("active", option.dataset.palette === palette);
  });
}

const savedPalette = localStorage.getItem("selectedPalette") || "default";
applyPalette(savedPalette);

if (paletteToggle && palettePanel) {
  paletteToggle.addEventListener("click", () => {
    const isOpen = palettePanel.classList.toggle("open");
    paletteToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#paletteSwitcher")) {
      palettePanel.classList.remove("open");
      paletteToggle.setAttribute("aria-expanded", "false");
    }
  });
}

paletteOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const palette = option.dataset.palette || "default";
    applyPalette(palette);
    localStorage.setItem("selectedPalette", palette);
    palettePanel?.classList.remove("open");
    paletteToggle?.setAttribute("aria-expanded", "false");
  });
});

// Project category filter
(function () {
  const filterBtns = [...document.querySelectorAll(".filter-btn")];
  const cards = [...document.querySelectorAll(".project-card")];
  if (!filterBtns.length || !cards.length) return;

  function filterProjects(category) {
    cards.forEach((card) => {
      const cats = (card.dataset.category || "").split(" ");
      const show = cats.includes(category);

      if (show) {
        card.classList.remove("hidden");
        card.classList.remove("fade-in");
        // Trigger reflow so animation replays
        void card.offsetWidth;
        if (!prefersReducedMotion) card.classList.add("fade-in");
      } else {
        card.classList.add("hidden");
        card.classList.remove("fade-in");
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      filterProjects(btn.dataset.filter);
    });
  });

  // Show "recent" on load
  filterProjects("recent");
})();

// ============================================================
//  CHATBOT WIDGET
// ============================================================
(function () {
  const trigger = document.getElementById("chatbotTrigger");
  const window_ = document.getElementById("chatbotWindow");
  const closeBtn = document.getElementById("chatbotClose");
  const input = document.getElementById("chatbotInput");
  const sendBtn = document.getElementById("chatbotSend");
  const messages = document.getElementById("chatbotMessages");
  const badge = trigger
    ? trigger.querySelector(".chatbot-trigger-badge")
    : null;
  const suggs = document.getElementById("chatbotSuggestions");

  if (!trigger || !window_) return;

  let isOpen = false;

  // Predefined Q&A knowledge base about Clark
  const kb = [
    {
      patterns: [
        "what can clark build",
        "what does clark do",
        "what can he build",
        "what do you do",
      ],
      answer:
        "Clark builds full-stack web apps, AI-powered chatbots, CRUD systems, object detection tools, and polished landing pages. From React frontends to Python backends — he ships the whole thing. 🚀",
    },
    {
      patterns: ["projects", "portfolio", "work", "show me"],
      answer:
        "Clark's recent work includes ChucksGPT (an AI chatbot), the BISU Faculty Manual Assistant (RAG-powered), NeuraClark, FaceTrack Vision (real-time face detection), and more. Check the Work section above! 👀",
    },
    {
      patterns: ["available", "hire", "freelance", "work with", "collaborate"],
      answer:
        "Yes! Clark is currently available for freelance projects and collaborations. You can reach him at clark@vibecoder.dev or use the contact form on this page. 📬",
    },
    {
      patterns: [
        "tech stack",
        "technologies",
        "skills",
        "what tech",
        "languages",
      ],
      answer:
        "Clark's stack: React, Next.js, Vue 3, Node.js, Python, TypeScript, Laravel, Tailwind CSS, Supabase, Firebase, OpenAI/Claude APIs, TensorFlow, Docker, and Vercel. Full-stack and AI-ready! ⚡",
    },
    {
      patterns: ["who is clark", "about clark", "tell me about", "who are you"],
      answer:
        "Clark is a software engineer, vibecoder, and developer instructor who crafts polished web experiences. He blends strong UI instincts with solid engineering to build apps people actually enjoy using. 🎨",
    },
    {
      patterns: ["instructor", "teaching", "teach", "course"],
      answer:
        "Clark is also a developer instructor! He breaks down complex technical concepts into clear, approachable lessons for learners and clients alike. 📚",
    },
    {
      patterns: ["contact", "email", "reach", "message", "get in touch"],
      answer:
        "You can reach Clark via email at clark@vibecoder.dev, or scroll down to the Contact section and fill in the form. He usually replies pretty fast! ⚡",
    },
    {
      patterns: [
        "ai",
        "artificial intelligence",
        "chatgpt",
        "claude",
        "openai",
      ],
      answer:
        "Clark integrates AI into real products — using OpenAI, Claude, Gemini, Pinecone, and RAG pipelines. ChucksGPT and the BISU Chatbot are live examples. AI isn't just a buzzword for him. 🤖",
    },
    {
      patterns: [
        "hello",
        "hi",
        "hey",
        "sup",
        "yo",
        "good morning",
        "good evening",
      ],
      answer:
        "Hey there! 👋 I'm ChucksGPT, Clark's AI assistant. Ask me about his skills, projects, availability, or tech stack — I got you!",
    },
    {
      patterns: ["thank", "thanks", "awesome", "cool", "nice", "great"],
      answer:
        "You're welcome! 😄 Feel free to ask anything else about Clark's work. And hey — if you like what you see, don't hesitate to reach out!",
    },
  ];

  function getBotReply(text) {
    const lower = text.toLowerCase().trim();
    for (const entry of kb) {
      if (entry.patterns.some((p) => lower.includes(p))) {
        return entry.answer;
      }
    }
    return "Hmm, I'm not sure about that one! 🤔 You can ask me about Clark's skills, projects, availability, or contact info. Or reach him directly at clark@vibecoder.dev!";
  }

  function appendMsg(text, role) {
    const wrap = document.createElement("div");
    wrap.className = `chatbot-msg ${role}`;

    if (role === "bot") {
      const av = document.createElement("img");
      av.src = "assets/chucks.png";
      av.alt = "Chucks";
      av.className = "chatbot-msg-avatar";
      wrap.appendChild(av);
    }

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    bubble.textContent = text;
    wrap.appendChild(bubble);

    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement("div");
    wrap.className = "chatbot-msg bot chatbot-typing";

    const av = document.createElement("img");
    av.src = "assets/chucks.png";
    av.alt = "Chucks";
    av.className = "chatbot-msg-avatar";
    wrap.appendChild(av);

    const bubble = document.createElement("div");
    bubble.className = "chatbot-bubble";
    [1, 2, 3].forEach(() => {
      const dot = document.createElement("span");
      dot.className = "chatbot-typing-dot";
      bubble.appendChild(dot);
    });
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }

  function handleSend(text) {
    text = text.trim();
    if (!text) return;

    appendMsg(text, "user");
    input.value = "";

    // Hide suggestions after first message
    if (suggs) suggs.style.display = "none";

    const typingEl = showTyping();
    const delay = 600 + Math.random() * 600;

    setTimeout(() => {
      typingEl.remove();
      appendMsg(getBotReply(text), "bot");
    }, delay);
  }

  function openChat() {
    isOpen = true;
    window_.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    // Hide badge
    if (badge) badge.classList.add("hidden");
    input.focus();
  }

  function closeChat() {
    isOpen = false;
    window_.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => (isOpen ? closeChat() : openChat()));
  closeBtn.addEventListener("click", closeChat);

  sendBtn.addEventListener("click", () => handleSend(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend(input.value);
  });

  // Suggestion chips
  document.querySelectorAll(".chatbot-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (!isOpen) openChat();
      handleSend(chip.textContent);
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (isOpen && !e.target.closest(".chatbot-widget")) closeChat();
  });
})();
