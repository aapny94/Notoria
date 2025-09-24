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
import AddIcon from "@mui/icons-material/Add";

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

function generateSlug(str) {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/\s+/g, "-");
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

  const handleNameChange = (e) => {
    const name = e.target.value;
    setEditFields((fields) => ({
      ...fields,
      name,
      // Only auto-update slug if user hasn't manually changed it
      slug:
        fields.slug === "" || fields.slug === generateSlug(fields.name)
          ? generateSlug(name)
          : fields.slug,
    }));
  };

  const handleSlugChange = (e) => {
    setEditFields((fields) => ({
      ...fields,
      slug: e.target.value,
    }));
  };

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
      <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
        <div style={{ flex: 1, padding: 16 }}>
          <h1 style={{ margin: 0, marginBottom: 6 }}>Categories</h1>
          <p style={{ margin: 0, marginBottom: 36 }}>
            <strong>Instructions:</strong>
            <br />
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                To <b>add</b> a category, click <b>Create New</b> and fill in
                the details.
              </li>
              <li>
                To <b>edit</b> a category, click <b>Edit</b> next to the
                category you want to change.
              </li>
              <li>
                To <b>delete</b> a category, open its edit button and click{" "}
                <b>Delete</b>.
              </li>
            </ul>

          </p>
          <p style={{ margin: 0, marginBottom: 6, fontSize: 12 }}>Note: You can only delete a category if there are no documents in this category</p>
          <Stack
            direction="row"
            style={{
              marginBottom: 10,
              marginRight: 2,
              textAlign: "right",
              display: "flex",
              justifyContent: "flex-end",
            }}
            spacing={2}
          >
            <Button
              variant="contained"
              style={{ backgroundColor: "#323232ff", color: "white" }}
              size="small"
              onClick={handleCreate}
              startIcon={<AddIcon />}
            >
              Create New
            </Button>
          </Stack>
          <div className="componentContainer">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow style={{ background: "#1d1d1dff" }}>
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
                      <TableCell style={{ textAlign: "right" }}>
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
          </div>
        </div>
        <div style={{ minWidth: "230px" }}></div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle style={{ width: "500px", paddingTop: "32px" }}>
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
            onChange={handleNameChange} // <-- should be handleNameChange
            fullWidth
          />
          <TextField
            margin="dense"
            label="Slug"
            name="slug"
            value={editFields.slug}
            onChange={handleSlugChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={editFields.description}
            onChange={handleEditFieldChange}
            fullWidth
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions
          style={{
            flexDirection: "row",
            padding: "16px",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 26,
          }}
        >
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
