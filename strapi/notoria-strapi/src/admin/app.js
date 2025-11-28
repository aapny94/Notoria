// src/admin/app.js
import logo from "./extensions/logo2.png";
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
          primary100: "#5a5a5aff",
          primary200: "#252525ff",
          primary500: "#e3e3e3ff",
          primary600: "#ffffffff",
          primary700: "#ffffffff",
          

          // Surfaces (used across body/cards/sidebar/etc.)
          neutral0: "#171717ff", // app background
          neutral100: "#111111ff", // cards/side surfaces
          neutral150: "#282828ff",
          neutral200: "#414141ff",
          neutral500: "#80808088",
          neutral600: "#7e7e7eff",
          neutral700: "#e2e8f0",
          neutral800: "#ffffffff",
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
