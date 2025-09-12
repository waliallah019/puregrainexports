"use client";

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  XCircle,
  Send,
  Truck,
  DollarSign,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import axios from "axios"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { useRouter } from 'next/navigation'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IQuoteRequest } from '@/types/quote';
import { countries } from '@/lib/config/shippingConfig';

type SortKey = keyof IQuoteRequest;
type SortOrder = "asc" | "desc";

export default function AdminQuotesPage() {
  const router = useRouter();
  const [quoteRequests, setQuoteRequests] = useState<IQuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRequestsCount, setTotalRequestsCount] = useState(0);

  const [sortColumn, setSortColumn] = useState<SortKey | null>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterItemType, setFilterItemType] = useState<string>("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchQuoteRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", itemsPerPage.toString());
      if (sortColumn) {
        queryParams.append("sortBy", sortColumn);
        queryParams.append("order", sortOrder);
      }
      if (debouncedSearchTerm) {
        queryParams.append("search", debouncedSearchTerm);
      }
      if (filterStatus !== "all") {
        queryParams.append("status", filterStatus);
      }
      if (filterCountry !== "all") {
        queryParams.append("destinationCountry", filterCountry);
      }
      if (filterItemType !== "all") {
        queryParams.append("itemTypeCategory", filterItemType);
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/quote-requests?${queryParams.toString()}`
      );

      if (response.data.success) {
        setQuoteRequests(response.data.data as IQuoteRequest[]);
        setTotalRequestsCount(response.data.pagination.totalProducts);
      } else {
        throw new Error(response.data.message || "Failed to fetch quote requests.");
      }
    } catch (err: any) {
      console.error("Error fetching quote requests:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to load quote requests.");
      setQuoteRequests([]);
      setTotalRequestsCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortColumn, sortOrder, debouncedSearchTerm, filterStatus, filterCountry, filterItemType]);

  useEffect(() => {
    fetchQuoteRequests();
  }, [fetchQuoteRequests]);

  const getStatusBadge = (status: IQuoteRequest["status"]) => {
    switch (status) {
      case "requested":
        return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200"><Clock className="mr-1 h-3 w-3" /> Requested</Badge>;
      case "approved":
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case "paid":
        return <Badge className="bg-purple-600 hover:bg-purple-700"><DollarSign className="mr-1 h-3 w-3" /> Paid</Badge>;
      case "dispatched":
        return <Badge className="bg-indigo-600 hover:bg-indigo-700"><Truck className="mr-1 h-3 w-3" /> Dispatched</Badge>;
      case "cancelled":
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalRequestsCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // FIX: Allow sorting by requestNumber
  const handleSort = (column: SortKey | 'requestNumber') => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column); // Set new sort column
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // FIX: Update renderSortIcon to handle 'requestNumber'
  const renderSortIcon = (column: SortKey | 'requestNumber') => {
    if (sortColumn === column) {
      return sortOrder === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowDown className="ml-2 h-4 w-4" />
      );
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50" />;
  };


  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Quote Requests</h1>
        <p className="text-muted-foreground">Manage customer quote requests and their lifecycle</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequestsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New / Requested</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteRequests.filter((r) => r.status === "requested").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved / Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteRequests.filter((r) => r.status === "approved" || r.status === "paid").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected / Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteRequests.filter((r) => r.status === "rejected" || r.status === "cancelled").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Request Management</CardTitle>
          <CardDescription>Process and track customer quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, company, item or Ref ID..." // FIX: Updated placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
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
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterItemType} onValueChange={setFilterItemType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="finished-product">Finished Product</SelectItem>
                  <SelectItem value="raw-leather">Raw Leather</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">Loading quote requests...</div>
          ) : error ? (
            <div className="h-24 flex items-center justify-center text-destructive">{error}</div>
          ) : quoteRequests.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">No quote requests found.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      {/* FIX: Change sort column to requestNumber */}
                      <Button variant="ghost" onClick={() => handleSort('requestNumber' as SortKey)}>
                        Ref ID
                        {renderSortIcon('requestNumber' as SortKey)}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('customerName')}>
                        Customer / Company
                        {renderSortIcon('customerName')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('itemName')}>
                        Item Details
                        {renderSortIcon('itemName')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('status')}>
                        Status
                        {renderSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                        Request Date
                        {renderSortIcon('createdAt')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/quotes/${request._id}`} className="text-blue-600 hover:underline">
                          {/* FIX: Display requestNumber, fallback to truncated _id */}
                          {request.requestNumber || (request._id as string).substring(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.customerName}</p>
                          <p className="text-sm text-muted-foreground">{request.companyName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.itemName}</p>
                          <p className="text-sm text-muted-foreground">{request.itemTypeCategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.quantity} {request.quantityUnit}</TableCell>
                      <TableCell>{request.destinationCountry}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/quotes/${request._id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6 flex-wrap gap-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {`Displaying ${quoteRequests.length} of ${totalRequestsCount} requests`}
                </div>
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                        className="h-8 w-8"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      (totalPages <= 7 || (page >= currentPage - 2 && page <= currentPage + 2) || page === 1 || page === totalPages) ? (
                        <PaginationItem key={page} className="hidden sm:inline-flex">
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className={loading ? "pointer-events-none opacity-50" : ""}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ) : (page === currentPage - 3 || page === currentPage + 3) ? (
                         <PaginationItem key={page} className="hidden sm:inline-flex">
                           <span className="px-4 py-2 text-sm text-muted-foreground">...</span>
                         </PaginationItem>
                      ) : null
                    ))}
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0 || loading}
                        className="h-8 w-8"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}