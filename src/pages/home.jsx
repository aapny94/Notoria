import { Box } from "@mui/material";
import Header from "../component/header";
import MenuTree from "../component/menuTree";
import DocPreviewPage from "../component/docPreviewPage";
import { useParams } from "react-router-dom";

function Home() {
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
            <DocPreviewPage idOrSlug={idOrSlug} />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Home;
