import { Router } from "express";
import { getAllContacts, createContact, updateContact, deleteContact } from "@/services/contact.service";
import { requireAdminMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";

const router = Router();

// GET /api/contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json(contacts);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/contacts (Admin)
router.post("/", requireAdminMiddleware, async (req, res) => {
  try {
    const contact = await createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/contacts/:id (Admin)
router.put("/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const contact = await updateContact(req.params.id, req.body);
    res.json(contact);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// DELETE /api/contacts/:id (Admin)
router.delete("/:id", requireAdminMiddleware, async (req, res) => {
  try {
    await deleteContact(req.params.id);
    res.json({ success: true, message: "Contact supprimé" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
