import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark", // or 'light'
    primary: {
      main: "#ef4132",
      contrastText: "#ffffffff",
    },
  },
  components: {

    // input customizations design //

    MuiTextField: {
      styleOverrides: {
        root: {
          // affects the whole TextField wrapper
          borderRadius: "12x",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          paddingLeft: "16px",
        },
      },
    },
    MuiFormLabel: {
        styleOverrides: {
            root: {
                lineHeight: '.9em',

            },
        },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: ".8rem",
          background: "rgba(255, 255, 255, 0)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.3)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#f49025ff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#f49025ff",
            borderWidth: 2,
          },
        },
        input: {
          color: "#fff", // input text color
          padding: "12px",
        },
    
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.7)",
          "&.Mui-focused": {
            color: "#f49025ff",
          },
        },
      },
    },


    // input customizations design //


  },
});

export default theme;
