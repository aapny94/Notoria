import { Box } from "@mui/material";
import Header from "../component/header";
import MenuTree from "../component/menuTree";
import { useParams } from "react-router-dom";
import DocEditPage from "./docEditPage";

function Edit() {
  const { idOrSlug } = useParams();
  return (
    <>
      <Box className="mainContainer">
        <Header />
        <Box className="contentContainer">
          <Box className="menuContainer">
            <MenuTree />
          </Box>
          <Box className="docContainer">
            <DocEditPage idOrSlug={idOrSlug} />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Edit;
