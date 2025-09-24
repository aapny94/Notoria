import { Box } from "@mui/material";
import Header from "../component/header";
import MenuTree from "../component/menuTree";

import Categories from "../component/categories";

function CategoryPage() {
  return (
    <>
      <Box className="mainContainer">
        <Header />
        <Box className="contentContainer">
          <Box className="menuContainer">
            <MenuTree />
          </Box>
          <Box className="docContainer">
            <Categories />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default CategoryPage;
