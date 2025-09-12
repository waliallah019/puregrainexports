// C:\Dev\puretemp-main\lib\services\sampleService.ts
import SampleRequest, { ISampleRequest, PaymentStatus } from '@/lib/models/sampleRequestModel';
import NotificationService from '@/lib/services/notificationService';
import logger from '@/lib/config/logger';
import mongoose from 'mongoose';
import { sendEmail } from '@/lib/utils/sendEmail';
import { format } from 'date-fns';
import { customAlphabet } from 'nanoid'; // Import nanoid for unique short IDs

// Initialize nanoid to generate alphanumeric IDs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8); // 8-character alphanumeric ID

interface SampleRequestFilters {
  status?: PaymentStatus | 'all';
  search?: string;
  country?: string;
  sampleType?: ISampleRequest['sampleType'] | 'all';
}

class SampleService {
  /**
   * Generates a unique, short alphanumeric request number.
   * Ensures uniqueness by checking against existing numbers.
   */
  private async generateUniqueRequestNumber(): Promise<string> {
    let unique = false;
    let newNumber = '';
    while (!unique) {
      newNumber = nanoid();
      const existingRequest = await SampleRequest.findOne({ requestNumber: newNumber });
      if (!existingRequest) {
        unique = true;
      }
    }
    return newNumber;
  }

  /**
   * Creates a new sample request.
   * This is typically called after successful payment.
   */
  public async createSampleRequest(sampleData: Partial<ISampleRequest>): Promise<ISampleRequest> {
    try {
      // FIX: Generate a unique request number
      const requestNumber = await this.generateUniqueRequestNumber();

      const newSampleRequest = new SampleRequest({
        ...sampleData,
        requestNumber: requestNumber, // Assign the generated number
        paymentStatus: sampleData.paymentStatus || 'paid', // Default to 'paid' if not specified
      });
      const savedRequest = await newSampleRequest.save();
      logger.info('Sample request saved successfully with ID:', savedRequest._id, 'Request Number:', savedRequest.requestNumber);

      // Send initial payment confirmation email to customer (FIRE AND FORGET)
      void this.sendSampleStatusUpdateEmail(null, savedRequest, 'initial_paid').catch(err => {
          logger.error(`[SampleService] Fire-and-forget initial_paid email failed for ${savedRequest._id} (Req# ${savedRequest.requestNumber}):`, err);
      });

      // Create a notification for the admin
      await NotificationService.createNotification({
        title: `New Sample Request from ${savedRequest.companyName}`,
        message: `A new sample request (Ref: ${savedRequest.requestNumber}) has been received from ${savedRequest.contactPerson} (${savedRequest.email}).`,
        type: 'new_sample_request',
        link: `/admin/samples/${savedRequest._id.toString()}`, // Link still uses MongoDB ID
        relatedId: mongoose.Types.ObjectId.isValid(savedRequest._id) ? new mongoose.Types.ObjectId(savedRequest._id as string) : undefined,
      });
      logger.info('Admin notification created for new sample request.');

      return savedRequest;
    } catch (error: any) {
      logger.error('Error creating sample request:', error);
      throw error;
    }
  }

  /**
   * Retrieves sample requests with filters, pagination, and sorting.
   */
  public async getSampleRequests(
    filters: SampleRequestFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ requests: ISampleRequest[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { companyName: { $regex: filters.search, $options: 'i' } },
        { contactPerson: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { requestNumber: { $regex: filters.search, $options: 'i' } }, // FIX: Search by requestNumber
        ...(mongoose.Types.ObjectId.isValid(filters.search) ? [{ _id: new mongoose.Types.ObjectId(filters.search) }] : []),
      ];
    }
    if (filters.status && filters.status !== 'all') {
      query.paymentStatus = filters.status;
    }
    if (filters.sampleType && filters.sampleType !== 'all') {
      query.sampleType = filters.sampleType;
    }
    if (filters.country) {
      query.country = filters.country;
    }

    try {
      const sortOptions: { [key: string]: 1 | -1 } = {};
      if (sortBy) {
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;
      } else {
        sortOptions.createdAt = -1;
      }

      const skip = (page - 1) * limit;

      const [requests, total] = await Promise.all([
        SampleRequest.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean<ISampleRequest[]>(),
        SampleRequest.countDocuments(query),
      ]);

      logger.info(`Retrieved ${requests.length} sample requests (total: ${total})`);
      return { requests, total, page, limit };
    } catch (error: any) {
      logger.error(`Error getting sample requests: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets a single sample request by ID.
   */
  public async getSampleRequestById(id: string): Promise<ISampleRequest | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      const request = await SampleRequest.findById(id).lean<ISampleRequest>();
      return request;
    } catch (error: any) {
      logger.error(`Error getting sample request by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Updates a sample request (e.g., status, tracking).
   */
  public async updateSampleRequest(
    id: string,
    updateData: Partial<ISampleRequest>
  ): Promise<ISampleRequest | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid Sample Request ID.');
      }

      const originalRequest = await SampleRequest.findById(id).lean<ISampleRequest>();
      if (!originalRequest) {
        return null;
      }

      // Handle shippedAt logic
      if (updateData.paymentStatus === 'shipped' && !originalRequest.shippedAt) {
        updateData.shippedAt = new Date();
      } else if (updateData.paymentStatus !== 'shipped' && originalRequest.shippedAt) {
        updateData.shippedAt = undefined;
      }

      const updatedRequest = await SampleRequest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean<ISampleRequest>();

      if (!updatedRequest) {
        return null;
      }

      logger.info(`Sample Request updated: ${id} (Req# ${updatedRequest.requestNumber}) - Status: ${updatedRequest.paymentStatus}`);

      if (originalRequest.paymentStatus !== updatedRequest.paymentStatus) {
        void this.sendSampleStatusUpdateEmail(originalRequest, updatedRequest, 'status_change').catch(err => {
            logger.error(`[SampleService] Fire-and-forget status_change email failed for ${updatedRequest._id} (Req# ${updatedRequest.requestNumber}):`, err);
        });
        await NotificationService.createNotification({
          title: `Sample Status Update: ${updatedRequest.requestNumber}`, // FIX: Use requestNumber
          message: `Sample request from ${updatedRequest.companyName} status changed to ${updatedRequest.paymentStatus}.`,
          type: 'sample_status_update',
          link: `/admin/samples/${updatedRequest._id.toString()}`,
          relatedId: mongoose.Types.ObjectId.isValid(updatedRequest._id) ? new mongoose.Types.ObjectId(updatedRequest._id as string) : undefined,
        });
      }

      if (updatedRequest.paymentStatus === 'shipped' && (updatedRequest.shippingTrackingLink !== originalRequest.shippingTrackingLink)) {
         void this.sendSampleStatusUpdateEmail(originalRequest, updatedRequest, 'tracking_update').catch(err => {
             logger.error(`[SampleService] Fire-and-forget tracking_update email failed for ${updatedRequest._id} (Req# ${updatedRequest.requestNumber}):`, err);
         });
      }

      return updatedRequest;
    } catch (error: any) {
      logger.error(`Error updating sample request ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a sample request.
   */
  public async deleteSampleRequest(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }
      const deleted = await SampleRequest.findByIdAndDelete(id).lean<ISampleRequest>();

      if (deleted) {
        logger.info(`Sample request deleted: ${id} (Req# ${deleted.requestNumber})`);
        await NotificationService.createNotification({
          title: `Sample Request Deleted: ${deleted.companyName}`,
          message: `Sample request (Ref: ${deleted.requestNumber}) from ${deleted.contactPerson} was deleted.`, // FIX: Use requestNumber
          type: 'info',
          link: undefined,
          relatedId: mongoose.Types.ObjectId.isValid(deleted._id) ? new mongoose.Types.ObjectId(deleted._id as string) : undefined,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      logger.error(`Error deleting sample request ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sends an email to the customer about their sample request status update.
   */
  private async sendSampleStatusUpdateEmail(
    originalRequest: ISampleRequest | null,
    updatedRequest: ISampleRequest,
    emailType: 'initial_paid' | 'status_change' | 'tracking_update'
  ): Promise<void> {
    const customerPortalLink = `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/customer/samples/${updatedRequest._id.toString()}`;
    const requestTitle = updatedRequest.productName || updatedRequest.sampleType || 'your sample request';
    // FIX: Use requestNumber for emails
    const displayId = updatedRequest.requestNumber || updatedRequest._id.toString().substring(0, 8) + '...';


    let subject = `PureGrain: Update on Your Sample Request (Ref: ${displayId})`;
    let emailTextContent = ``;
    let emailHtmlContent = ``;

    const commonEmailHeader = `
      <p>Dear ${updatedRequest.contactPerson || 'Customer'},</p>
      <p>This is an update regarding your sample request for <strong>${requestTitle}</strong> (Reference: <strong>${displayId}</strong>).</p>
      <br>
    `;

    const commonEmailFooter = `
      <p>You can view the full details of your request at any time:</p>
      <p><a href="${customerPortalLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Your Sample Request Details</a></p>
      <br>
      <p>If you have any questions, please feel free to contact us.</p>
      <p>Best regards,<br>The PureGrain Team</p>
    `;

    switch (emailType) {
        case 'initial_paid':
            subject = `PureGrain: Your Sample Request Payment Confirmed & Order Placed (Ref: ${displayId})!`;
            emailTextContent = `Dear ${updatedRequest.contactPerson},\n\nThank you for your payment! We have successfully received your payment for your sample request for "${requestTitle}" (Ref: ${displayId}). Your order is now placed and we will begin processing it shortly.\n\nWe will notify you once your samples are shipped.\n\nView your request details: ${customerPortalLink}\n\nBest regards,\nThe PureGrain Team`;
            emailHtmlContent = `
                ${commonEmailHeader}
                <p>Thank you for your payment! We have successfully received it for your sample request.</p>
                <p>Your order for <strong>${requestTitle}</strong> (Reference: ${displayId}) is now placed, and we will begin processing it shortly.</p>
                <p>We will notify you as soon as your samples are shipped.</p>
                ${commonEmailFooter}
            `;
            break;

        case 'status_change':
            const previousStatus = originalRequest ? this.formatStatus(originalRequest.paymentStatus) : 'N/A';
            const newStatus = this.formatStatus(updatedRequest.paymentStatus);

            subject = `PureGrain: Status Update for Your Sample Request (Ref: ${displayId})`;
            emailTextContent = `Dear ${updatedRequest.contactPerson},\n\nThe status of your sample request for "${requestTitle}" (Ref: ${displayId}) has been updated from ${previousStatus} to ${newStatus}.\n\n`;
            emailHtmlContent = `
                ${commonEmailHeader}
                <p>The status of your sample request for <strong>${requestTitle}</strong> (Reference: ${displayId}) has been updated:</p>
                <ul>
                    <li><strong>Previous Status:</strong> ${previousStatus}</li>
                    <li><strong>New Status:</strong> ${newStatus}</li>
                </ul>
            `;

            switch (updatedRequest.paymentStatus) {
                case 'pending':
                    emailTextContent += `Your request is currently pending. We might need some additional information or it is awaiting manual review. Please check your portal for more details or contact us.`;
                    emailHtmlContent += `<p>Your request is currently pending. We might need some additional information or it is awaiting manual review. Please check your portal for more details or contact us if you have any questions.</p>`;
                    break;
                case 'processing':
                    emailTextContent += `Your sample request is now being processed. We are preparing your samples for shipment.`;
                    emailHtmlContent += `<p>Your sample request is now being processed. We are actively preparing your samples for shipment.</p>`;
                    break;
                case 'shipped':
                    emailTextContent += `Your sample request has been shipped. We will provide tracking details in a separate email or update shortly.`;
                    emailHtmlContent += `<p>Your sample request has been shipped! We will provide tracking details in a separate email or update shortly.</p>`;
                    break;
                case 'delivered':
                    emailTextContent += `Your sample request has been delivered. We hope you are satisfied with your samples.`;
                    emailHtmlContent += `<p>Your sample request has been <strong>DELIVERED</strong>! We hope you are satisfied with your samples.</p>
                                         <p>Please feel free to reach out if you have any feedback or further requirements.</p>`;
                    break;
                case 'cancelled':
                    emailTextContent += `Your sample request has been cancelled. If you have any questions or this was an error, please contact us.`;
                    emailHtmlContent += `<p>Your sample request has been <strong>CANCELLED</strong>. If you believe this is an error or wish to discuss this further, please do not hesitate to contact our support team.</p>`;
                    break;
                case 'failed':
                    emailTextContent += `Your sample request payment has failed. Please check your payment method or contact us to resolve this issue.`;
                    emailHtmlContent += `<p>We regret to inform you that the payment for your sample request has <strong>FAILED</strong>. Please check your payment method or contact our support team to resolve this issue and re-initiate your order.</p>`;
                    break;
                case 'refunded':
                    emailTextContent += `Your sample request has been refunded. The refund should appear in your account within 5-10 business days.`;
                    emailHtmlContent += `<p>Your sample request has been <strong>REFUNDED</strong>. The refund amount should appear in your account within 5-10 business days, depending on your bank.</p>
                                         <p>If you have any further questions, please contact us.</p>`;
                    break;
                default:
                    emailTextContent += `Please check your customer portal for more details.`;
                    emailHtmlContent += `<p>Please check your customer portal for more details.</p>`;
            }
            emailHtmlContent += commonEmailFooter;
            break;

        case 'tracking_update':
            if (updatedRequest.paymentStatus !== 'shipped') {
                logger.warn(`Attempted to send tracking_update email for non-shipped status: ${updatedRequest.paymentStatus}`);
                return;
            }
            subject = `PureGrain: Your Sample Order for "${requestTitle}" Has Been Shipped! (Ref: ${displayId})`;
            emailTextContent = `Dear ${updatedRequest.contactPerson},\n\nGreat news! Your sample order for "${requestTitle}" (Ref: ${displayId}) has been shipped.`;
            emailHtmlContent = `${commonEmailHeader}
                <p>Great news! Your sample order for <strong>${requestTitle}</strong> (Reference: ${displayId}) has been shipped.</p>
                <p>You can track its journey using the details below:</p>
            `;

            if (updatedRequest.shippingTrackingLink) {
                emailTextContent += `\nTracking Link: ${updatedRequest.shippingTrackingLink}`;
                emailHtmlContent += `<p><strong>Tracking Link:</strong> <a href="${updatedRequest.shippingTrackingLink}" target="_blank">${updatedRequest.shippingTrackingLink}</a></p>`;
            }
            if (updatedRequest.shippedAt) {
                emailTextContent += `\nShipped On: ${format(new Date(updatedRequest.shippedAt), 'MMM dd, yyyy HH:mm')}`;
                emailHtmlContent += `<p><strong>Shipped On:</strong> ${format(new Date(updatedRequest.shippedAt), 'MMM dd, yyyy HH:mm')}</p>`;
            }
            emailTextContent += `\n\nWe hope you enjoy your samples from PureGrain.`;
            emailHtmlContent += `<p>We hope you enjoy your samples from PureGrain.</p>${commonEmailFooter}`;
            break;
    }

    try {
      await sendEmail({
        to: updatedRequest.email,
        subject: subject,
        text: emailTextContent,
        html: emailHtmlContent,
      });
      logger.info(`Customer notification email (${emailType}) sent for Sample ID ${updatedRequest._id} (Req# ${updatedRequest.requestNumber}) status ${updatedRequest.paymentStatus}.`);
    } catch (emailError) {
      logger.error(`Failed to send customer notification email (${emailType}) for Sample ID ${updatedRequest._id} (Req# ${updatedRequest.requestNumber}): ${emailError}`);
    }
  }

  private formatStatus(status: PaymentStatus): string {
    return status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

const sampleService = new SampleService();
export default sampleService;