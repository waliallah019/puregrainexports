// my-leather-platform/lib/services/customManufacturingService.ts
import CustomManufacturingRequest, { ICustomManufacturingRequest } from "../models/CustomManufacturingRequest";
import logger from "../config/logger";

interface CustomRequestFilters {
  status?: string;
  search?: string; // Search by companyName, contactPerson, email
}

class CustomManufacturingService {
  /**
   * Creates a new custom manufacturing request.
   * @param requestData - The request data including Cloudinary design file URLs.
   * @returns The created request.
   */
  public async createRequest(
    requestData: Partial<ICustomManufacturingRequest>
  ): Promise<ICustomManufacturingRequest> {
    try {
      const newRequest = new CustomManufacturingRequest(requestData);
      await newRequest.save();
      logger.info(`Created new custom manufacturing request for: ${newRequest.companyName} (${newRequest.email})`);
      return newRequest;
    } catch (error: any) {
      logger.error(`Error creating custom manufacturing request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves a list of custom manufacturing requests with optional filters, pagination, and sorting.
   * @param filters - Object containing status and search string.
   * @param page - Page number for pagination.
   * @param limit - Number of items per page for pagination.
   * @param sortBy - The field to sort by.
   * @param order - Sort order: 'asc' or 'desc'.
   * @returns An object containing requests, total count, and pagination info.
   */
  public async getRequests(
    filters: CustomRequestFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    order: string = "desc"
  ): Promise<{ requests: ICustomManufacturingRequest[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$or = [
        { companyName: { $regex: new RegExp(filters.search, "i") } },
        { contactPerson: { $regex: new RegExp(filters.search, "i") } },
        { email: { $regex: new RegExp(filters.search, "i") } },
        { productType: { $regex: new RegExp(filters.search, "i") } },
        { preferredMaterial: { $regex: new RegExp(filters.search, "i") } },
      ];
    }

    try {
      const skip = (page - 1) * limit;
      const total = await CustomManufacturingRequest.countDocuments(query);

      const allowedSortFields = [
        "companyName", "contactPerson", "email", "productType",
        "estimatedQuantity", "status", "createdAt", "updatedAt"
      ];
      let sortOptions: { [key: string]: 1 | -1 } = {};

      if (sortBy && allowedSortFields.includes(sortBy)) {
        sortOptions[sortBy] = order === "desc" ? -1 : 1;
      } else {
        sortOptions = { createdAt: -1 };
        logger.warn(`Invalid or unallowed sortBy field for CustomManufacturingRequest: ${sortBy}. Defaulting to createdAt descending.`);
      }

      const requests = await CustomManufacturingRequest.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec();

      logger.info(`Retrieved ${requests.length} custom manufacturing requests (total: ${total})`);
      return { requests, total, page, limit };
    } catch (error: any) {
      logger.error(`Error getting custom manufacturing requests: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieves a single custom manufacturing request by its ID.
   * @param id - The ID of the request.
   * @returns The found request or null.
   */
  public async getRequestById(id: string): Promise<ICustomManufacturingRequest | null> {
    try {
      const request = await CustomManufacturingRequest.findById(id);
      if (request) {
        logger.info(`Retrieved custom manufacturing request by ID: ${id}`);
      } else {
        logger.warn(`Custom manufacturing request not found by ID: ${id}`);
      }
      return request;
    } catch (error: any) {
      logger.error(`Error getting custom manufacturing request by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Updates an existing custom manufacturing request.
   * @param id - The ID of the request to update.
   * @param updateData - The data to update.
   * @returns The updated request or null.
   */
  public async updateRequest(
    id: string,
    updateData: Partial<ICustomManufacturingRequest>
  ): Promise<ICustomManufacturingRequest | null> {
    try {
      const request = await CustomManufacturingRequest.findById(id);
      if (!request) {
        return null;
      }

      Object.assign(request, updateData);
      await request.save();
      logger.info(`Updated custom manufacturing request: ${request.companyName} (ID: ${id})`);
      return request;
    } catch (error: any) {
      logger.error(`Error updating custom manufacturing request by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a custom manufacturing request by its ID.
   * NOTE: This does NOT delete associated design files from Cloudinary.
   * Implement Cloudinary deletion logic if needed.
   * @param id - The ID of the request to delete.
   * @returns True if deleted, false if not found.
   */
  public async deleteRequest(id: string): Promise<boolean> {
    try {
      const request = await CustomManufacturingRequest.findByIdAndDelete(id);
      if (request) {
        logger.info(`Deleted custom manufacturing request ID: ${id}`);
        // TODO: Add Cloudinary deletion for designFiles if necessary
        return true;
      } else {
        logger.warn(`Attempted to delete non-existent custom manufacturing request ID: ${id}`);
        return false;
      }
    } catch (error: any) {
      logger.error(`Error deleting custom manufacturing request by ID ${id}: ${error.message}`);
      throw error;
    }
  }
}

export default new CustomManufacturingService();