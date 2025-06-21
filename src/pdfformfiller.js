import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

function pdfformfiller() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillPdf = async () => {
    // Load your existing PDF file
    const existingPdfBytes = await fetch("/template.pdf").then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Fill PDF fields (match these names to your PDF's form field names)
    form.getTextField("name").setText(formData.name);
    form.getTextField("email").setText(formData.email);

    const pdfBytes = await pdfDoc.save();

    // Trigger download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "filled-form.pdf");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 w-full mb-2"
      />

      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={fillPdf}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate PDF
      </button>
    </div>
  );
}

export default pdfformfiller;
