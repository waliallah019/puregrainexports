// my-leather-platform/lib/utils/invoicePdfGenerator.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IInvoice } from '@/types/invoice';
import { format } from 'date-fns';

// Extend jsPDF to include autoTable (necessary for TypeScript)
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface GeneratePdfOptions {
  invoice: IInvoice;
}

export const generateInvoicePdf = ({ invoice }: GeneratePdfOptions): Buffer => {
  const doc = new jsPDF();

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const startX = 15;
  let startY = 15;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', doc.internal.pageSize.width - 20, startY, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  startY += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.vendorName, startX, startY);
  startY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.vendorAddress, startX, startY);
  startY += 5;
  doc.text(`Email: ${invoice.vendorEmail}`, startX, startY);
  startY += 5;
  doc.text(`Phone: ${invoice.vendorPhone}`, startX, startY);
  startY += 15;

  const col1X = startX;
  const col2X = doc.internal.pageSize.width / 2 + 10;

  // BILL TO & INVOICE DETAILS
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', col1X, startY);
  doc.text('INVOICE DETAILS:', col2X, startY);
  startY += 7; // slightly bigger spacing

  doc.setFont('helvetica', 'normal');
  doc.text(invoice.companyName, col1X, startY);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, col2X, startY);
  startY += 6;
  doc.text(invoice.customerName, col1X, startY);
  doc.text(`Issue Date: ${format(invoice.issueDate, 'MMM dd, yyyy')}`, col2X, startY);
  startY += 6;
  doc.text(invoice.customerAddress || 'N/A', col1X, startY);
  doc.text(`Due Date: ${format(invoice.dueDate, 'MMM dd, yyyy')}`, col2X, startY);
  startY += 6;
  doc.text(invoice.customerCountry || 'N/A', col1X, startY);
  startY += 6; // extra spacing before the table

  const tableHeaders = [['Item', 'Quantity', 'Unit', 'Unit Price', 'Total']];
  const tableData = invoice.items.map(item => [
    item.itemName,
    item.quantity.toLocaleString(),
    item.quantityUnit,
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.totalPrice.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: startY,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      halign: 'center',
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 70 },
      1: { halign: 'right', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
  });

  startY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, doc.internal.pageSize.width - startX, startY, { align: 'right' });
  startY += 5;
  if (invoice.taxAmount && invoice.taxAmount > 0) {
    doc.text(`Tax (${(invoice.taxRate! * 100).toFixed(0)}%): $${invoice.taxAmount.toFixed(2)}`, doc.internal.pageSize.width - startX, startY, { align: 'right' });
    startY += 5;
  }
  if (invoice.shippingCost && invoice.shippingCost > 0) {
    doc.text(`Shipping: $${invoice.shippingCost.toFixed(2)}`, doc.internal.pageSize.width - startX, startY, { align: 'right' });
    startY += 5;
  }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: $${invoice.totalAmount.toFixed(2)} USD`, doc.internal.pageSize.width - startX, startY, { align: 'right' });
  startY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', startX, startY);
  startY += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.paymentInstructions || 'Please pay the total amount by the due date.', startX, startY);

  startY += 15; // push bank details down for cleaner look

  if (invoice.paymentTerms !== 'lc') {
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', startX, startY);
    startY += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank Name: ${invoice.vendorBankDetails.bankName}`, startX, startY);
    startY += 6;
    doc.text(`Account Number: ${invoice.vendorBankDetails.accountNumber}`, startX, startY);
    if (invoice.vendorBankDetails.swiftCode) {
      startY += 6;
      doc.text(`SWIFT Code: ${invoice.vendorBankDetails.swiftCode}`, startX, startY);
    }
    if (invoice.vendorBankDetails.iban) {
      startY += 6;
      doc.text(`IBAN: ${invoice.vendorBankDetails.iban}`, startX, startY);
    }
    startY += 12;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Letter of Credit Details:', startX, startY);
    startY += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Issuing Bank: ${invoice.lcBankName || 'N/A'}`, startX, startY);
    if (invoice.lcContactPerson) {
      startY += 6;
      doc.text(`Contact Person: ${invoice.lcContactPerson}`, startX, startY);
    }
    if (invoice.lcContactEmail) {
      startY += 6;
      doc.text(`Contact Email: ${invoice.lcContactEmail}`, startX, startY);
    }
    startY += 12;
  }

  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', startX, startY);
    startY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.notes, startX, startY);
  }

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, pageHeight - 15, { align: 'center' });

  // FIX: Properly convert ArrayBuffer to Node.js Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};

interface GenerateReportOptions {
  data: any[];
  title: string;
  headers: string[];
  columns: string[];
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
}

export const generateReportPdf = ({ 
  data, 
  title, 
  headers, 
  columns,
  companyName = process.env.YOUR_COMPANY_NAME || 'PureGrain Leather',
  companyAddress = process.env.YOUR_COMPANY_ADDRESS || '123 Leather Lane, Rawhide City, LTH 12345',
  companyEmail = process.env.ADMIN_EMAIL || 'admin@puregrain.com',
  companyPhone = process.env.YOUR_COMPANY_PHONE || '+1 (555) 123-4567',
}: GenerateReportOptions): Buffer => {
  const doc = new jsPDF();
  
  const startX = 15;
  let startY = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, startX, startY);
  startY += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddress, startX, startY);
  startY += 5;
  doc.text(`Email: ${companyEmail}`, startX, startY);
  startY += 5;
  doc.text(`Phone: ${companyPhone}`, startX, startY);
  startY += 10;

  // Report Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, startX, startY);
  startY += 8;

  // Report Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const reportDate = format(new Date(), 'MMM dd, yyyy \'at\' hh:mm a');
  doc.text(`Generated on: ${reportDate}`, startX, startY);
  startY += 5;
  doc.text(`Total Records: ${data.length}`, startX, startY);
  startY += 10;

  // Table
  const tableRows = data.map(row => columns.map(col => {
    if (row[col] instanceof Date) {
      return format(row[col], 'MMM dd, yyyy HH:mm');
    }
    return String(row[col] || 'N/A');
  }));

  autoTable(doc, {
    startY: startY,
    head: [headers],
    body: tableRows,
    theme: 'striped',
    headStyles: { 
      fillColor: [60, 60, 60],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { 
      fontSize: 8, 
      cellPadding: 3, 
      valign: 'middle',
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    // Dynamic column widths based on content
    columnStyles: headers.reduce((acc, _, index) => {
      // Set appropriate widths for common columns
      const widthMap: { [key: number]: number } = {
        0: 20,  // ID
        1: 25,  // Status
        2: 35,  // Customer Name
        3: 35,  // Company
        4: 40,  // Email
        5: 25,  // Country
        6: 40,  // Item Name
        7: 20,  // Quantity
        8: 20,  // Unit
        9: 30,  // Proposed Price
        10: 30, // Total Price
        11: 40, // Payment Method
        12: 30, // Tracking Number
        13: 35, // Request Date
      };
      acc[index] = { cellWidth: widthMap[index] || 'auto' };
      return acc;
    }, {} as { [key: number]: { cellWidth: number | 'auto' } }),
    margin: { top: startY, left: startX, right: startX },
    didDrawPage: (data) => {
      // Add footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Page ${i} of ${pageCount} - ${companyName}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          reportDate,
          pageWidth - startX,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    },
  });

  // FIX: Properly convert ArrayBuffer to Node.js Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};
