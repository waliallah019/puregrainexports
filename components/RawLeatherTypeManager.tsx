"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { IRawLeatherType } from "@/types/rawLeather"; // Import the new interface
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaEdit, FaTrash } from "react-icons/fa"; // Removed FaPlusCircle as the button is integrated
import { Loader2 } from "lucide-react";
import Modal from "./Modal"; // If RawLeatherTypeManager needs its own modal or specific styling

interface RawLeatherTypeManagerProps {
  onClose: () => void;
  onUpdate: () => void; // Callback to re-fetch raw leather types in parent
}

export default function RawLeatherTypeManager({
  onClose,
  onUpdate,
}: RawLeatherTypeManagerProps) {
  const [rawLeatherTypes, setRawLeatherTypes] = useState<IRawLeatherType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState<IRawLeatherType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const fetchRawLeatherTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/raw-leather-types`);
      if (!response.ok) {
        throw new Error("Failed to fetch raw leather types.");
      }
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setRawLeatherTypes(data.data);
      } else {
        setRawLeatherTypes([]);
      }
    } catch (error: any) {
      toast.error(`Error fetching raw leather types: ${error.message}`);
      console.error("Error fetching raw leather types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawLeatherTypes();
  }, []);

  const handleAddOrUpdateType = async () => {
    if (!newTypeName.trim()) {
      toast.error("Raw leather type name cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      let response;
      if (editingType) {
        // Update existing
        response = await fetch(`${API_URL}/raw-leather-types/${editingType._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newTypeName.trim() }),
        });
      } else {
        // Add new
        response = await fetch(`${API_URL}/raw-leather-types`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newTypeName.trim() }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed.");
      }

      toast.success(
        editingType
          ? "Raw leather type updated successfully!"
          : "Raw leather type added successfully!",
      );
      setNewTypeName("");
      setEditingType(null);
      await fetchRawLeatherTypes(); // Refresh the list
      onUpdate(); // Notify parent to update
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error("Error adding/updating raw leather type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (type: IRawLeatherType) => {
    setNewTypeName(type.name);
    setEditingType(type);
  };

  const handleDeleteType = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this raw leather type?")) {
      return;
    }
    setLoading(true); // Indicate loading for deletion
    try {
      const response = await fetch(`${API_URL}/raw-leather-types/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete raw leather type.");
      }
      toast.success("Raw leather type deleted successfully!");
      await fetchRawLeatherTypes(); // Refresh the list
      onUpdate(); // Notify parent to update
    } catch (error: any) {
      toast.error(`Error deleting raw leather type: ${error.message}`);
      console.error("Error deleting raw leather type:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Title and Description for Raw Leather Type Manager */}
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Manage Raw Leather Types
        </h2>
        <p className="text-sm text-muted-foreground">
          Add, edit, or delete raw leather types used in your inventory.
        </p>
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder={
            editingType ? "Edit raw leather type name" : "New raw leather type name"
          }
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          disabled={isSubmitting}
        />
        <Button onClick={handleAddOrUpdateType} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingType ? "Update" : "Add"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Raw Leather Type Name</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin inline-block" />{" "}
                  Loading types...
                </TableCell>
              </TableRow>
            ) : rawLeatherTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No raw leather types found.
                </TableCell>
              </TableRow>
            ) : (
              rawLeatherTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(type)}
                        title="Edit Type"
                        disabled={isSubmitting}
                      >
                        <FaEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteType(type._id)}
                        title="Delete Type"
                        disabled={isSubmitting}
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Close
        </Button>
      </div>
    </div>
  );
}