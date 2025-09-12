// my-leather-platform/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/config/db";
import messageService from "@/lib/services/messageService";
import { handleApiError } from "@/lib/utils/errorHandler";
import { validateRequest } from "@/lib/middleware/validateRequest";
import { contactFormSchema } from "@/lib/validators/contactValidator";
import logger from "@/lib/config/logger";

export const dynamic = 'force-dynamic'; // Ensure dynamic behavior

// POST endpoint for contact form submission
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json(); // Assuming JSON body for contact form

    const validation = await validateRequest(contactFormSchema, req, body);
    if (!validation.success) {
      return validation.errorResponse;
    }
    const formData = validation.data.body;

    const newMessage = await messageService.createMessage({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      country: formData.country,
      inquiryType: formData.inquiryType,
      message: formData.message,
    });

    logger.info(`Contact form submission processed: ${newMessage._id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully! We will get back to you soon.",
        data: newMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}