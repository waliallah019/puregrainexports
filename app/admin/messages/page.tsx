// my-leather-platform/app/admin/messages/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, MessageSquare, Reply, Archive, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "react-hot-toast"
import axios from "axios"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

interface Message {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  customerCountry?: string;
  inquiryType: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

type SortKey = keyof Message;
type SortOrder = "asc" | "desc";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalMessagesCount, setTotalMessagesCount] = useState(0);

  const [sortColumn, setSortColumn] = useState<SortKey | null>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // FIX: Change initial values to "all" (a non-empty string)
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchMessages = useCallback(async () => {
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
      // FIX: Check if filter value is not "all" before appending
      if (filterStatus !== "all") {
        queryParams.append("status", filterStatus);
      }
      if (filterPriority !== "all") {
        queryParams.append("priority", filterPriority);
      }
      if (filterCategory !== "all") {
        queryParams.append("category", filterCategory);
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages?${queryParams.toString()}`
      );

      if (response.data.success) {
        setMessages(response.data.data);
        setTotalMessagesCount(response.data.pagination.totalProducts);
      } else {
        throw new Error(response.data.message || "Failed to fetch messages.");
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to load messages.");
      toast.error(`Error loading messages: ${err.response?.data?.message || err.message}`);
      setMessages([]);
      setTotalMessagesCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortColumn, sortOrder, debouncedSearchTerm, filterStatus, filterPriority, filterCategory]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const getStatusBadge = (status: Message["status"]) => {
    switch (status) {
      case "unread": return <Badge variant="destructive">Unread</Badge>;
      case "read": return <Badge variant="secondary">Read</Badge>;
      case "replied": return <Badge variant="default">Replied</Badge>;
      case "archived": return <Badge variant="outline">Archived</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Message["priority"]) => {
    switch (priority) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge className="bg-orange-500 hover:bg-orange-600">Medium</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "sales": return <Badge className="bg-green-600 hover:bg-green-700">Sales</Badge>;
      case "support": return <Badge className="bg-blue-600 hover:bg-blue-700">Support</Badge>;
      case "complaint": return <Badge variant="destructive">Complaint</Badge>;
      case "general": return <Badge variant="outline">General</Badge>;
      case "quote": return <Badge className="bg-purple-600 hover:bg-purple-700">Quote</Badge>;
      case "sample": return <Badge className="bg-teal-600 hover:bg-teal-700">Sample</Badge>;
      case "custom": return <Badge className="bg-indigo-600 hover:bg-indigo-700">Custom</Badge>;
      case "partnership": return <Badge className="bg-pink-600 hover:bg-pink-700">Partnership</Badge>;
      default: return <Badge variant="outline">{category}</Badge>;
    }
  };

 const updateMessageStatus = async (messageId: string, newStatus: Message["status"], replyText?: string) => {
    console.log("Updating message status. ID:", messageId, "New Status:", newStatus, "Reply Text:", replyText);
    setLoading(true);
    try {
      const payload = { status: newStatus, replyText };
      console.log("Axios PATCH payload:", payload); // Log the exact payload before sending

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages/${messageId}`,
        payload
      );
      if (response.data.success) {
        toast.success(`Message marked as ${newStatus}!`);
        fetchMessages();
        if (newStatus === 'replied') {
          setIsReplyDialogOpen(false);
          setSelectedMessage(null);
          setReplyText("");
        }
      } else {
        throw new Error(response.data.message || "Failed to update message status.");
      }
    } catch (err: any) {
      console.error("Error updating message status:", err.response?.data || err.message);
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages/${messageId}`
      );
      if (response.data.success) {
        toast.success("Message deleted successfully!");
        fetchMessages();
      } else {
        throw new Error(response.data.message || "Failed to delete message.");
      }
    } catch (err: any) {
      console.error("Error deleting message:", err.response?.data || err.message);
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      updateMessageStatus(selectedMessage._id, "replied", replyText);
    } else {
      toast.error("Reply text cannot be empty.");
    }
  };

  const totalPages = Math.ceil(totalMessagesCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSort = (column: SortKey) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
    setCurrentPage(1);
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
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Manage customer communications and inquiries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessagesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Badge variant="destructive">{messages.filter((m) => m.status === "unread").length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter((m) => m.status === "unread").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter((m) => m.status === "replied").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter((m) => m.priority === "high").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Messages</CardTitle>
          <CardDescription>Respond to customer inquiries and support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 w-full"
              />
            </div>
            {/* Filters */}
            <div className="flex space-x-2 w-full md:w-auto">
              <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem> {/* FIX: Value is now "all" */}
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={(value) => { setFilterPriority(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem> {/* FIX: Value is now "all" */}
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={(value) => { setFilterCategory(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem> {/* FIX: Value is now "all" */}
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="sample">Sample</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <Button variant="ghost" onClick={() => handleSort("subject")} className="px-2 h-auto justify-start">
                      Subject
                      {renderSortIcon("subject")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("customerName")} className="px-2 h-auto justify-start">
                      From
                      {renderSortIcon("customerName")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort("status")} className="px-2 h-auto justify-center">
                      Status
                      {renderSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort("priority")} className="px-2 h-auto justify-center">
                      Priority
                      {renderSortIcon("priority")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort("inquiryType")} className="px-2 h-auto justify-center">
                      Category
                      {renderSortIcon("inquiryType")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] text-center">
                    <Button variant="ghost" onClick={() => handleSort("createdAt")} className="px-2 h-auto justify-center">
                      Date
                      {renderSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Loading messages...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No messages found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow key={message._id} className={message.status === "unread" ? "bg-muted/50 font-medium" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                           <span className="line-clamp-1">{message.subject}</span>
                           <span className="text-xs text-muted-foreground line-clamp-1">{message.message}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span>{message.customerName}</span>
                           <span className="text-xs text-muted-foreground">{message.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(message.status)}</TableCell>
                      <TableCell className="text-center">{getPriorityBadge(message.priority)}</TableCell>
                      <TableCell className="text-center">{getCategoryBadge(message.inquiryType)}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Dialog open={isReplyDialogOpen && selectedMessage?._id === message._id} onOpenChange={(open) => {
                            setIsReplyDialogOpen(open);
                            if (!open) setSelectedMessage(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedMessage(message);
                                  setReplyText("");
                                  if (message.status === "unread") {
                                    updateMessageStatus(message._id, "read");
                                  }
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                                <DialogDescription>
                                  Message from {selectedMessage?.customerName} ({selectedMessage?.customerEmail})
                                </DialogDescription>
                              </DialogHeader>
                              {selectedMessage && (
                                <div className="space-y-4">
                                  <div className="flex flex-wrap items-center space-x-2">
                                    {getStatusBadge(selectedMessage.status)}
                                    {getPriorityBadge(selectedMessage.priority)}
                                    {getCategoryBadge(selectedMessage.inquiryType)}
                                    {selectedMessage.customerCompany && (
                                      <Badge variant="outline">{selectedMessage.customerCompany}</Badge>
                                    )}
                                    {selectedMessage.customerCountry && (
                                      <Badge variant="outline">{selectedMessage.customerCountry}</Badge>
                                    )}
                                    {selectedMessage.customerPhone && (
                                      <Badge variant="outline">{selectedMessage.customerPhone}</Badge>
                                    )}
                                  </div>
                                  <div className="p-4 bg-muted rounded-lg border">
                                    <p className="text-sm">{selectedMessage.message}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Reply</Label>
                                    <Textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Type your reply here..."
                                      rows={4}
                                      disabled={loading}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button onClick={handleReply} disabled={loading}>
                                      <Reply className="mr-2 h-4 w-4" />
                                      Send Reply
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => updateMessageStatus(message._id, "archived")} disabled={loading}>
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(message._id)} disabled={loading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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
              {`Displaying ${messages.length} of ${totalMessagesCount} messages`}
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
        </CardContent>
      </Card>
    </div>
  )
}