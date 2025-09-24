import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import {
  getUserCategories,
  deleteCategory,
  getAllCategories,
  createCategory,
  updateCategory,
} from "../api/apiCategory";

function getCurrentUserId() {
  const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
  const userStr = localStorage.getItem(TOKEN_KEY + "_user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
}

function Categories() {
  const currentUserId = getCurrentUserId(); // <-- Add this line at the top

  const [categories, setCategories] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [editFields, setEditFields] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    getUserCategories()
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  const refreshCategories = () => {
    getUserCategories().then(setCategories);
  };
  const handleEdit = (cat) => {
    setEditCat(cat);
    setEditFields({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
    });
    setIsCreating(false);
    setEditOpen(true);
  };

  const handleCreate = () => {
    setEditCat(null);
    setEditFields({ name: "", slug: "", description: "" });
    setIsCreating(true);
    setEditOpen(true);
    refreshCategories(); // <-- refresh after save
  };

  const handleEditFieldChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleDialogSave = async () => {
    try {
      if (isCreating) {
        const payload = {
          name: editFields.name,
          slug: editFields.slug,
          description: editFields.description,
          users_permissions_user: { id: currentUserId }, // <-- Correct format for Strapi v5
        };
        await createCategory(payload);
      } else {
        await updateCategory(editCat.id, {
          name: editFields.name,
          slug: editFields.slug,
          description: editFields.description,
        });
      }
      setEditOpen(false);
      getAllCategories().then(setCategories);
      refreshCategories(); // <-- refresh after save
    } catch (e) {
      alert("Save failed: " + (e?.message || e));
    }
  };

  // In your component:
  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      refreshCategories(); // <-- refresh after save
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" color="success" onClick={handleCreate}>
          Create Category
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Description</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(cat)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>
          {isCreating ? "Create Category" : "Edit Category"}
          {!isCreating && (
            <Button
              variant="contained"
              color="error"
              size="small"
              style={{ float: "right", marginTop: -8 }}
              onClick={async () => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this category?"
                  )
                ) {
                  await handleDelete(editCat.id);
                  setEditOpen(false);
                }
              }}
            >
              Delete
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={editFields.name}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Slug"
            name="slug"
            value={editFields.slug}
            onChange={handleEditFieldChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={editFields.description}
            onChange={handleEditFieldChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDialogSave}
            variant="contained"
            color="primary"
          >
            {isCreating ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Categories;
