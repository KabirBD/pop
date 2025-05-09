if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/pop/service-worker.js")
      .then((reg) => console.log("Service Worker registered", reg))
      .catch((err) => console.log("Service Worker failed", err));
  });
}

const messageInput = document.getElementById("messageInput");
const fontSize = document.getElementById("fontSize");
const fontFamily = document.getElementById("fontFamily");
const boldToggle = document.getElementById("boldToggle");
const italicToggle = document.getElementById("italicToggle");
const textColor = document.getElementById("textColor");
const bgColor = document.getElementById("bgColor");
const display = document.getElementById("messageDisplay");
const themeMeta = document.getElementById("themeColorMeta");
const gradientToggle = document.getElementById("gradientToggle");
const controls = document.querySelector(".controls");

function saveState() {
  const state = {
    text: messageInput.value,
    fontSize: fontSize.value,
    fontFamily: fontFamily.value,
    bold: boldToggle.checked,
    italic: italicToggle.checked,
    textColor: textColor.value,
    bgColor: bgColor.value,
    gradient: gradientToggle.checked
  };
  localStorage.setItem("messageViewerState", JSON.stringify(state));
}

function loadGoogleFont(fontValue) {
  const fontName = fontValue.match(/'([^']+)'/)?.[1];
  if (!fontName || document.getElementById(`gf-${fontName}`)) return;
  const link = document.createElement("link");
  link.id = `gf-${fontName}`;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(link);
}

function updateDisplay() {
  const message = messageInput.value || "Your message will appear here.";
  const font = fontFamily.value;

  display.style.fontFamily = font;
  display.style.fontSize = fontSize.value + "px";
  display.style.fontWeight = boldToggle.checked ? "bold" : "normal";
  display.style.fontStyle = italicToggle.checked ? "italic" : "normal";
  display.style.backgroundColor = bgColor.value;
  themeMeta.setAttribute("content", bgColor.value);
  loadGoogleFont(font);

  display.classList.remove("gradient-wave");
  if (gradientToggle.checked) {
    display.innerHTML = `<span class="gradient-wave">${message}</span>`;
  } else {
    display.textContent = message;
    display.style.color = textColor.value;
    display.style.webkitTextFillColor = textColor.value;
  }

  // Update URL with state
  const newURL = new URL(window.location);
  newURL.searchParams.set("message", messageInput.value);
  newURL.searchParams.set("fontSize", fontSize.value);
  newURL.searchParams.set("fontFamily", fontFamily.value);
  newURL.searchParams.set("bold", boldToggle.checked);
  newURL.searchParams.set("italic", italicToggle.checked);
  newURL.searchParams.set("textColor", textColor.value);
  newURL.searchParams.set("bgColor", bgColor.value);
  newURL.searchParams.set("gradient", gradientToggle.checked);
  window.history.replaceState({}, "", newURL);
}

function loadStateFromStorageOrURL() {
  const params = new URLSearchParams(window.location.search);
  const isViewOnly = params.get("viewOnly") === "true";

  if (params.has("message")) {
    // Load from URL
    messageInput.value = params.get("message") || "";
    fontSize.value = params.get("fontSize") || "24";
    fontFamily.value = params.get("fontFamily") || "'Segoe UI', sans-serif";
    boldToggle.checked = params.get("bold") === "true";
    italicToggle.checked = params.get("italic") === "true";
    textColor.value = params.get("textColor") || "#ffffff";
    bgColor.value = params.get("bgColor") || "#000000";
    gradientToggle.checked = params.get("gradient") === "true";
  } else {
    // Load from localStorage
    const saved = localStorage.getItem("messageViewerState");
    if (saved) {
      const state = JSON.parse(saved);
      messageInput.value = state.text || "";
      fontSize.value = state.fontSize || "24";
      fontFamily.value = state.fontFamily || "'Segoe UI', sans-serif";
      boldToggle.checked = state.bold || false;
      italicToggle.checked = state.italic || false;
      textColor.value = state.textColor || "#ffffff";
      bgColor.value = state.bgColor || "#000000";
      gradientToggle.checked = state.gradient || false;
    }
  }

  updateDisplay();

  if (isViewOnly && controls) {
    controls.style.display = "none";
  }
}

function enterFullscreen() {
  if (display.requestFullscreen) {
    display.requestFullscreen({ navigationUI: "hide" });
  } else if (display.webkitRequestFullscreen) {
    display.webkitRequestFullscreen();
  } else if (display.msRequestFullscreen) {
    display.msRequestFullscreen();
  }
}

function shareViewOnlyLink() {
  const currentURL = new URL(window.location);
  currentURL.searchParams.set("viewOnly", "true");
  navigator.clipboard.writeText(currentURL.toString()).then(() => {
    alert("Link copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy the link.");
  });
}

document.getElementById("fullscreenBtn").addEventListener("click", enterFullscreen);
document.getElementById("shareBtn").addEventListener("click", shareViewOnlyLink);

[
  messageInput,
  fontSize,
  fontFamily,
  boldToggle,
  italicToggle,
  textColor,
  bgColor,
  gradientToggle
].forEach(el =>
  el.addEventListener("input", () => {
    updateDisplay();
    saveState();
  })
);

loadStateFromStorageOrURL();
