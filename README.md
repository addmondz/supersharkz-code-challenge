# SuperSharkz Charges

A small app to view, add, edit, and delete student charges. Built with React, TypeScript, and Vite.

---

## How to run the project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the URL shown in the terminal (usually `http://localhost:5173`).

To build for production: `npm run build`. To preview the build: `npm run preview`.

---

## Assumptions, trade-offs, and next steps

**Assumptions:** Charges and students are not coming from a real API. The app uses mock data that loads after a short delay. The list of students is derived from the charges you already have, so when adding a charge you pick from existing students. We assume amounts use up to 2 decimal places and that a charge has one student, one date, and one charge/paid pair.

**Trade-offs:** Everything is kept in memory, so refreshing the page resets the data. We chose a confirm dialog for delete instead of undo, and we kept the scope small (no bulk delete, no export) so the UI stays clear for the main tasks: add, edit, filter, and delete one charge at a time.

**What we’d improve next:** Hook up a real backend and persist charges. Add a proper student list so you can add charges for new students. Consider undo after delete (e.g. a toast with “Undo”) and optional bulk delete with a clear confirmation. More validation and loading states for slow networks would help as well.

---

## UX: mistakes admins might make (and how the UI helps)

1. **Paid amount higher than charge amount**  
   Someone might type a paid amount that’s bigger than the charge. The form checks this and shows an error: “Paid amount cannot exceed charge amount.” You can’t save until it’s fixed.

2. **Wrong or invalid date**  
   Dates must be real and in YYYY-MM-DD. If the date is invalid or in the wrong format, the form shows: “Please enter a valid date (YYYY-MM-DD).” The date field is clearly labeled and required so it’s obvious what to correct.

3. **Wrong student or missing student**  
   When adding or editing, student is required and (when possible) chosen from a searchable list of existing students, so you’re less likely to pick the wrong person or leave it blank. If student ID or name is missing, the form shows an error and won’t save until it’s filled in.

---

## Deletion: avoiding accidental removal

Deleting a charge is a two-step process:

1. You click the trash icon on a charge.
2. A dialog appears asking: “Are you sure you want to delete charge [id]? This action cannot be undone.”
3. You can click **Cancel** (dialog closes, nothing is deleted) or **Delete** (the charge is removed).

So you never delete with a single click. You have to confirm in the dialog, and the wording makes it clear the action is final. We use a dedicated “alert” style dialog (focus on the message and two buttons) so it’s hard to miss. Cancel is the safe default if someone opens the dialog by mistake.
