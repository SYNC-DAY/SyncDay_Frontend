import { createApp } from "vue";
import App from "./App.vue";

/* pinia */
import { createPinia } from "pinia";

/* router */
import { setupRouter } from "./router"; // 이름 변경

/* axios */
import { setupAxiosInterceptors } from "../src/plugins/axios.js";

/* primevue */
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";

/* css */
import "@/assets/styles/syncday/main.css";

const app = createApp(App);

/* pinia */
const pinia = createPinia();
app.use(pinia);

/* axios */
setupAxiosInterceptors();

/* router */
const router = await setupRouter();
app.use(router);

/* prime vue */
const SyncDayPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{pink.50}",
      100: "{pink.100}",
      200: "{pink.200}",
      300: "{pink.300}",
      400: "{pink.400}",
      500: "{pink.500}",
      600: "{pink.600}",
      700: "{pink.700}",
      800: "{pink.800}",
      900: "{pink.900}",
      950: "{pink.950}",
    },
  },
});
app.use(PrimeVue, {
  theme: {
    preset: SyncDayPreset,
    options: {
      prefix: "p",
      darkModeSelector: ".fake-dark-selector",
      cssLayer: false,
    },
  },
});

app.mount("#app");
