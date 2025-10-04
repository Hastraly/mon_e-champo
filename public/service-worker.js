self.addEventListener("install", () => {
  console.log("📦 Service Worker installé !");
});

self.addEventListener("fetch", () => {
  // Tu pourras gérer ici du cache plus tard
});
