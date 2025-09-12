// my-leather-platform/app/admin/reports/page.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Download, FileText, BarChart, Loader2 } from 'lucide-react'; // FIX: Import Loader2
import axios from 'axios';
import { IQuoteRequest } from '@/types/quote';
import { format } from 'date-fns'; // FIX: Import format for processedData

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<string>('quotes');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (formatType: 'pdf' | 'csv') => { // Renamed 'format' to 'formatType' to avoid conflict
    setLoading(true);
    try {
      let endpoint = '';
      let fileName = '';
      let queryParams = new URLSearchParams();

      if (reportType === 'quotes') {
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/quote-requests`;
        fileName = `quote_requests_${quoteStatusFilter}_${formatType}.${formatType}`; // Use formatType here
        if (quoteStatusFilter !== 'all') {
          queryParams.append('status', quoteStatusFilter);
        }
        queryParams.append('limit', '10000');
      } else {
        toast.error("Report type not implemented yet.");
        setLoading(false);
        return;
      }

      const dataResponse = await axios.get(`${endpoint}?${queryParams.toString()}`);
      if (!dataResponse.data.success) {
        throw new Error(dataResponse.data.message || "Failed to fetch report data.");
      }
      const rawData: IQuoteRequest[] = dataResponse.data.data;

      let processedData: any[] = [];
      let headers: string[] = [];
      let columns: string[] = [];

      if (reportType === 'quotes') {
        headers = [
          'ID', 'Status', 'Customer Name', 'Company', 'Email', 'Country',
          'Item Name', 'Quantity', 'Unit', 'Proposed Price', 'Total Price',
          'Payment Method', 'Tracking Number', 'Request Date'
        ];
        columns = [
          '_id', 'status', 'customerName', 'companyName', 'customerEmail',
          'destinationCountry', 'itemName', 'quantity', 'quantityUnit',
          'proposedPricePerUnit', 'proposedTotalPrice', 'paymentMethod',
          'trackingNumber', 'createdAt'
        ];

        processedData = rawData.map(req => ({
          _id: (req._id as string).substring(0,8),
          status: req.status,
          customerName: req.customerName,
          companyName: req.companyName,
          customerEmail: req.customerEmail,
          destinationCountry: req.destinationCountry,
          itemName: req.itemName,
          quantity: req.quantity,
          quantityUnit: req.quantityUnit,
          proposedPricePerUnit: req.proposedPricePerUnit ? `$${req.proposedPricePerUnit.toFixed(2)}` : 'N/A',
          proposedTotalPrice: req.proposedTotalPrice ? `$${req.proposedTotalPrice.toFixed(2)}` : 'N/A',
          paymentMethod: req.paymentMethod || 'N/A',
          trackingNumber: req.trackingNumber || 'N/A',
          createdAt: format(new Date(req.createdAt), 'MMM dd, yyyy HH:mm') // FIX: Use format
        }));
      }

      let downloadBlob: Blob;
      if (formatType === 'pdf') { // Use formatType here
        const reportTitle = `Quote Requests Report - Status: ${quoteStatusFilter.toUpperCase()}`;
        // The dynamic import should be correctly awaited here.
        const { generateReportPdf } = await import('@/lib/utils/invoicePdfGenerator');
        const pdfBuffer = generateReportPdf({
          data: processedData,
          title: reportTitle,
          headers: headers,
          columns: columns,
        });
        downloadBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

      } else { // CSV
        const csvRows = [];
        csvRows.push(headers.join(','));
        for (const row of processedData) {
          const values = columns.map(col => {
            const value = row[col];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvRows.push(values.join(','));
        }
        downloadBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      }

      const url = window.URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report (${formatType}) generated successfully!`); // Use formatType

    } catch (err: any) {
      console.error("Error generating report:", err.response?.data || err.message);
      toast.error(`Failed to generate report: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate actionable reports from your data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5"/> Quote Request Reports</CardTitle>
          <CardDescription>Generate reports based on quote requests by status and format.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotes">Quote Requests</SelectItem>
                  <SelectItem value="samples" disabled>Sample Requests (Coming Soon)</SelectItem>
                  <SelectItem value="customers" disabled>Customers (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === 'quotes' && (
              <div className="space-y-2">
                <Label htmlFor="quoteStatusFilter">Filter by Quote Status</Label>
                <Select value={quoteStatusFilter} onValueChange={setQuoteStatusFilter}>
                  <SelectTrigger id="quoteStatusFilter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <Button onClick={() => handleGenerateReport('pdf')} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" /> Generate PDF
            </Button>
            <Button onClick={() => handleGenerateReport('csv')} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" /> Generate CSV
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}