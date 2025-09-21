// src/admin/app.js
import logo from "./extensions/Notoria-Logo-01.png";
import en from "./translations/en.json"; // <-- use ES import instead of require
import "./styles.css";
export default {
  config: {
    // Branding
    auth: { logo },
    menu: { logo },
    head: {
      title: "Notoria Admin",
    },

    // Theme override (example colors)

    theme: {
      dark: {
        colors: {
          // Brand
          primary100: "#ef4132",
          primary200: "#252525ff",
          primary500: "#e3e3e3ff",
          primary600: "#ffffffff",
          primary700: "#ffffffff",
          

          // Surfaces (used across body/cards/sidebar/etc.)
          neutral0: "#2a2a2a", // app background
          neutral100: "#202020", // cards/side surfaces
          neutral150: "#4d4d4dff",
          neutral200: "#454545ff",
          neutral500: "#adadad88",
          neutral600: "#cbd5e1",
          neutral700: "#e2e8f0",
          neutral800: "#f1f5f9",
          neutral900: "#ffffff", // text on dark surfaces
        },
      },
    },
    translations: {
      en,
    },

    // Disable tutorials/releases in sidebar
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(app) {
    console.log("Custom admin app loaded", app);
  },
};
