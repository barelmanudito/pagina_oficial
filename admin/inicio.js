// config.yml usa JSON, formato compatible con YAML y legible sin dependencias.
window.CMS_MANUAL_INIT = true;
(async () => {
  const message = document.querySelector("#mensaje");
  try {
    const response = await fetch("config.yml", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer la configuración.");
    const config = await response.json();
    const auth = new URL(config.backend.base_url);
    if (auth.hostname.endsWith(".invalid")) {
      message.textContent = "El panel está preparado. Falta conectar el inicio de sesión con GitHub; consultá ADMINISTRACION.md para completar la instalación.";
      return;
    }
    if (auth.protocol !== "https:") throw new Error("El servicio de acceso debe usar HTTPS.");
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/decap-cms@3.17.1/dist/decap-cms.js";
    script.onload = () => {
      document.querySelector("#estado").hidden = true;
      window.CMS.init({ config: { ...config, load_config_file: false } });
    };
    script.onerror = () => { message.textContent = "No se pudo cargar el editor. Revisá tu conexión e intentá de nuevo."; };
    document.head.append(script);
  } catch (error) {
    message.textContent = `No se pudo iniciar el panel: ${error.message}`;
  }
})();
