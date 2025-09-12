"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Filter,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

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
import { ISampleRequest, PaymentStatus } from '@/lib/models/sampleRequestModel';
import Link from 'next/link';

type SortKey = keyof ISampleRequest;
type SortOrder = "asc" | "desc";

export default function SamplesPage() {
  const router = useRouter();
  const [sampleRequests, setSampleRequests] = useState<ISampleRequest[]>([]);
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
  const [filterSampleType, setFilterSampleType] = useState<string>("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchSampleRequests = useCallback(async () => {
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
      if (filterSampleType !== "all") {
        queryParams.append("sampleType", filterSampleType);
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sample-requests?${queryParams.toString()}`;
      console.log("[FE-List] Fetching sample requests from API:", apiUrl);
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        setSampleRequests(response.data.data as ISampleRequest[]);
        setTotalRequestsCount(response.data.pagination.totalProducts);
        console.log("[FE-List] Sample requests fetched successfully.");
      } else {
        throw new Error(response.data.message || "Failed to fetch sample requests.");
      }
    } catch (err: any) {
      console.error("[FE-List] Error fetching sample requests:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to load sample requests.");
      setSampleRequests([]);
      setTotalRequestsCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortColumn, sortOrder, debouncedSearchTerm, filterStatus, filterSampleType]);

  useEffect(() => {
    fetchSampleRequests();
  }, [fetchSampleRequests]);


  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending Payment
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white">
            <Package className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <Truck className="mr-1 h-3 w-3" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-indigo-600 hover:bg-indigo-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
            <XCircle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{(status as string).charAt(0).toUpperCase() + (status as string).slice(1)}</Badge>;
    }
  };

  const handleViewDetails = (requestId: string) => {
    router.push(`/admin/samples/${requestId}`);
  };

  const totalPages = Math.ceil(totalRequestsCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log("[FE-List] Changing page to:", page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    console.log("[FE-List] Changing items per page to:", value);
  };

  const handleSort = (column: SortKey) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
    setCurrentPage(1);
    console.log(`[FE-List] Sorting by ${column}, order ${sortOrder}.`);
  };

  const renderSortIcon = (column: SortKey) => {
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
        <h1 className="text-3xl font-bold">Sample Requests</h1>
        <p className="text-muted-foreground">Manage customer sample requests and shipments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequestsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleRequests.filter((r) => r.paymentStatus === "pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing & Shipped</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleRequests.filter((r) => r.paymentStatus === "processing" || r.paymentStatus === "shipped").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleRequests.filter((r) => r.paymentStatus === "delivered").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample Request Management</CardTitle>
          <CardDescription>Process and track customer sample requests</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, company, or Request ID..." // FIX: Updated placeholder
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
                  <SelectItem value="pending">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSampleType} onValueChange={setFilterSampleType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Sample Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sample Types</SelectItem>
                  <SelectItem value="raw-leather">Raw Leather</SelectItem>
                  <SelectItem value="finished-products">Finished Products</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">Loading sample requests...</div>
          ) : error ? (
            <div className="h-24 flex items-center justify-center text-destructive">{error}</div>
          ) : sampleRequests.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">No sample requests found.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      {/* FIX: Use requestNumber for sorting */}
                      <Button variant="ghost" onClick={() => handleSort('requestNumber' as SortKey)}>
                        Request ID
                        {renderSortIcon('requestNumber' as SortKey)}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('contactPerson')}>
                        Customer / Company
                        {renderSortIcon('contactPerson')}
                      </Button>
                    </TableHead>
                    <TableHead>Sample Details</TableHead>
                    <TableHead>Shipping Address</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('paymentStatus')}>
                        Status
                        {renderSortIcon('paymentStatus')}
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
                  {sampleRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">
                        {/* FIX: Display requestNumber, fallback to truncated _id */}
                        <span className="text-xs text-muted-foreground">{request.requestNumber || request._id.substring(0, 8)}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.contactPerson}</p>
                          <p className="text-sm text-muted-foreground">{request.companyName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.productName || request.sampleType}</p>
                          <p className="text-sm text-muted-foreground">{request.productTypeCategory || request.materialPreference || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.address}</TableCell>
                      <TableCell>{getStatusBadge(request.paymentStatus)}</TableCell>
                      <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request._id)}>
                          <Eye className="h-4 w-4 mr-1" /> View Details
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
                  {`Displaying ${sampleRequests.length} of ${totalRequestsCount} requests`}
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