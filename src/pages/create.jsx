import { Box } from "@mui/material";
import Header from "../component/header";
import MenuTree from "../component/menuTree";
import { useParams } from "react-router-dom";
import DocEditPage from "./docEditPage";
import DocCreatePage from "./docCreatePage";

function Create() {
  return (
    <>
      <Box className="mainContainer">
        <Header />
        <Box className="contentContainer">
          <Box className="menuContainer">
            <MenuTree />
          </Box>
          <Box className="docContainer">
            <DocCreatePage />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Create;
