const PDFDocument = require('pdfkit');

const createBufferFromDoc = (draw) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    draw(doc);
    doc.end();
  });

const drawHeader = (doc, title, referenceLines = []) => {
  doc.fontSize(22).text(title, { align: 'right' });
  doc.moveDown(0.5);
  doc.fontSize(10);
  referenceLines.forEach((line) => doc.text(line, { align: 'right' }));
  doc.moveDown();
};

const drawPartyBlock = (doc, label, lines = []) => {
  doc.fontSize(12).text(label, { underline: true });
  doc.moveDown(0.25);
  doc.fontSize(10);
  lines.forEach((line) => doc.text(line || '-'));
  doc.moveDown();
};

const drawItemsTable = (doc, items = []) => {
  const tableTop = doc.y + 10;
  const columns = [50, 220, 300, 380, 470];
  doc.fontSize(10).text('Item', columns[0], tableTop);
  doc.text('Qty', columns[1], tableTop);
  doc.text('Unit Price', columns[2], tableTop);
  doc.text('Total', columns[3], tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let currentY = tableTop + 25;
  items.forEach((item) => {
    doc.text(item.name, columns[0], currentY, { width: 160 });
    doc.text(String(item.quantity), columns[1], currentY);
    doc.text(Number(item.unitPrice || 0).toFixed(2), columns[2], currentY);
    doc.text(Number(item.totalPrice || 0).toFixed(2), columns[3], currentY);
    currentY += 22;
  });

  doc.y = currentY + 10;
};

const drawTotals = (doc, rows = []) => {
  rows.forEach((row) => {
    doc.fontSize(row.bold ? 12 : 10)
      .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(row.label, 360, doc.y, { continued: true })
      .text(row.value, { align: 'right' });
    doc.moveDown(0.3);
  });
  doc.font('Helvetica');
};

const generateInvoicePDF = async (invoice, purchaseOrder, vendor, quotationItems = []) => {
  return createBufferFromDoc((doc) => {
    drawHeader(doc, 'INVOICE', [
      `Invoice #: ${invoice.invoiceNumber}`,
      `PO #: ${purchaseOrder.poNumber}`,
      `Due Date: ${new Date(invoice.dueDate).toISOString().slice(0, 10)}`,
      `Status: ${invoice.status}`,
    ]);

    drawPartyBlock(doc, 'Bill To', [vendor.name, vendor.email, vendor.phone, vendor.address]);
    drawItemsTable(doc, quotationItems);
    drawTotals(doc, [
      { label: 'Subtotal', value: Number(purchaseOrder.totalAmount).toFixed(2) },
      { label: 'Tax (18%)', value: Number(purchaseOrder.taxAmount).toFixed(2) },
      { label: 'Grand Total', value: Number(purchaseOrder.grandTotal).toFixed(2), bold: true },
    ]);
  });
};

const generatePurchaseOrderPDF = async (purchaseOrder, vendor, quotation, quotationItems = []) => {
  return createBufferFromDoc((doc) => {
    drawHeader(doc, 'PURCHASE ORDER', [
      `PO #: ${purchaseOrder.poNumber}`,
      `Quotation #: ${quotation.quotationNumber}`,
      `Status: ${purchaseOrder.status}`,
    ]);

    drawPartyBlock(doc, 'Vendor', [vendor.name, vendor.email, vendor.phone, vendor.address]);
    drawItemsTable(doc, quotationItems);
    drawTotals(doc, [
      { label: 'Subtotal', value: Number(purchaseOrder.totalAmount).toFixed(2) },
      { label: 'Tax (18%)', value: Number(purchaseOrder.taxAmount).toFixed(2) },
      { label: 'Grand Total', value: Number(purchaseOrder.grandTotal).toFixed(2), bold: true },
    ]);
  });
};

module.exports = {
  generateInvoicePDF,
  generatePurchaseOrderPDF,
};
