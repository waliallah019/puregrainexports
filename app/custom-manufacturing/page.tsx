"use client"; // This component needs to run on the client-side

import { useState, useRef } from "react"; // <-- Add useRef here
import axios from "axios";
import { toast, Toaster } from "react-hot-toast"; // <-- Ensure Toaster is imported for hot-toast to work
import { useRouter } from 'next/navigation'; // <-- Import useRouter for redirection

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Upload, Send, Clock, Award, Palette, FileText, XCircle, CheckCircle2 } from "lucide-react"; // Added CheckCircle2 for success icon

// --- Form Options (Mirroring backend schema enums where applicable) ---
const productTypes = [
  "Wallets", "Bags & Purses", "Belts & Straps", "Accessories", "Footwear", "Upholstery", "Other"
];
const preferredMaterials = [
  "Cowhide", "Buffalo", "Goat", "Sheep", "Exotic", "Not sure"
];
const timelines = [
  "Rush (2-4 weeks)", "Standard (4-8 weeks)", "Flexible (8+ weeks)"
];
const budgetRanges = [
  "Under $5,000", "$5,000 - $15,000", "$15,000 - $50,000", "Over $50,000", "Prefer to discuss"
];
// --- Constants for file upload limits ---
const MAX_FILE_SIZE_MB = 25;
const MAX_TOTAL_FILES = 5;
const ALLOWED_MIMETYPES = [
  'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
  'image/x-adobe-ai', 'application/postscript', // Adobe Illustrator AI
  'image/vnd.adobe.photoshop', 'image/psd', // Adobe Photoshop PSD
  'application/dxf', 'application/x-autocad', // AutoCAD DXF/DWG (common but may vary)
  'application/vnd.oasis.opendocument.text', // For doc/docx, better to restrict to design specific
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // doc/docx
];

// Define the shape of your form data state
interface FormDataState {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productType: string;
  estimatedQuantity: string;
  preferredMaterial: string;
  colors: string;
  timeline: string;
  specifications: string;
  budgetRange: string;
}

export default function CustomManufacturingPage() {
  const router = useRouter(); // Initialize useRouter
  const [formData, setFormData] = useState<FormDataState>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    productType: productTypes[0], // Default to first option
    estimatedQuantity: "",
    preferredMaterial: preferredMaterials[0], // Default to first option
    colors: "",
    timeline: timelines[0], // Default to first option
    specifications: "",
    budgetRange: budgetRanges[0], // Default to first option
  });
  const [designFiles, setDesignFiles] = useState<File[]>([]
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New state for modal visibility

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const handleSelectChange = (name: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const handleDesignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newlySelectedFiles = Array.from(e.target.files);
    let newErrors: { [key: string]: string } = { ...errors };
    let filesToAdd: File[] = [];
    let fileErrorOccurred = false;

    // Clear the input's value immediately to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (designFiles.length + newlySelectedFiles.length > MAX_TOTAL_FILES) {
      toast.error(`You can upload a maximum of ${MAX_TOTAL_FILES} design files.`);
      newErrors.designFiles = `Maximum of ${MAX_TOTAL_FILES} files allowed.`;
      fileErrorOccurred = true;
    }

    newlySelectedFiles.forEach(file => {
      const isSizeValid = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
      const isTypeValid = ALLOWED_MIMETYPES.includes(file.type);

      if (!isSizeValid) {
        toast.error(`File '${file.name}' exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        newErrors.designFiles = newErrors.designFiles || `Some files exceeded ${MAX_FILE_SIZE_MB}MB.`;
        fileErrorOccurred = true;
      }
      if (!isTypeValid) {
        toast.error(`File '${file.name}' has an unsupported format. Supported: PDF, JPG, PNG, AI, PSD, DWG, GIF.`);
        newErrors.designFiles = newErrors.designFiles || `Some files have unsupported formats.`;
        fileErrorOccurred = true;
      }

      if (isSizeValid && isTypeValid) {
        filesToAdd.push(file);
      }
    });
    
    // If filesToAdd exceeds the total allowed files after filtering,
    // we need to re-evaluate the total limit.
    const currentTotal = designFiles.length + filesToAdd.length;
    if (currentTotal > MAX_TOTAL_FILES) {
      const availableSlots = MAX_TOTAL_FILES - designFiles.length;
      if (availableSlots > 0) {
        filesToAdd = filesToAdd.slice(0, availableSlots);
        toast.error(`Only ${availableSlots} more file(s) could be added to reach the maximum of ${MAX_TOTAL_FILES}.`);
        newErrors.designFiles = newErrors.designFiles || `Maximum of ${MAX_TOTAL_FILES} files allowed.`;
        fileErrorOccurred = true;
      } else {
        filesToAdd = []; // No slots left
      }
    }


    setDesignFiles((prev) => [...prev, ...filesToAdd]);

    if (!fileErrorOccurred) {
      // Only clear if no new errors specific to design files occurred in this selection
      delete newErrors.designFiles;
    }
    setErrors(newErrors);
  };

  const removeDesignFile = (index: number) => {
    setDesignFiles((prev) => prev.filter((_, i) => i !== index));
    // Re-validate if there was a `designFiles` error, just in case removing one fixes it
    if (errors.designFiles && designFiles.length - 1 <= MAX_TOTAL_FILES) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors.designFiles;
        return updatedErrors;
      });
    }
  };


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required.";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact Person is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.productType.trim()) newErrors.productType = "Product Type is required.";
    if (!formData.estimatedQuantity.trim()) newErrors.estimatedQuantity = "Estimated Quantity is required.";
    
    // Check if designFiles error still present (if user tries to submit with existing file errors)
    if (designFiles.length > MAX_TOTAL_FILES) {
      newErrors.designFiles = `You can upload a maximum of ${MAX_TOTAL_FILES} design files.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalCloseAndRedirect = () => {
    setShowSuccessModal(false);
    router.push('/catalog'); // Redirect to catalog page
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Append design files
      designFiles.forEach((file) => {
        data.append("designFiles", file); // Name matches backend's expected input field
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/custom-manufacturing`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Instead of toast.success, show the modal
        setShowSuccessModal(true);
        // Reset form after successful submission
        setFormData({
          companyName: "", contactPerson: "", email: "", phone: "",
          productType: productTypes[0], estimatedQuantity: "", preferredMaterial: preferredMaterials[0],
          colors: "", timeline: timelines[0], specifications: "", budgetRange: budgetRanges[0],
        });
        setDesignFiles([]); // Clear design files
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Ensure actual file input is cleared
        }
      } else {
        throw new Error(response.data.message || "Submission failed.");
      }
    } catch (error: any) {
      console.error("Custom request submission error:", error.response?.data || error.message);
      let errorMessage = "An unexpected error occurred.";
      let detailedErrors: { [key: string]: string } = {};

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const backendResponse = error.response.data;
          if (backendResponse && backendResponse.errors && Array.isArray(backendResponse.errors)) {
            detailedErrors = backendResponse.errors.reduce((acc: any, err: any) => {
              const path = Array.isArray(err.path) ? err.path.join('.') : err.path;
              const fieldName = path.startsWith('body.') ? path.substring(5) : path;
              acc[fieldName] = err.message;
              return acc;
            }, {});
            errorMessage = "Validation failed. Please check your inputs.";
          } else if (backendResponse && backendResponse.message) {
            errorMessage = backendResponse.message;
          } else {
            errorMessage = `Server Error: ${error.response.status} ${error.response.statusText || 'Unknown Status'}`;
          }
        } else if (error.request) {
          errorMessage = "Network Error: No response from server. Please check your internet connection.";
        } else {
          errorMessage = `Request Setup Error: ${error.message}`;
        }
      } else {
        errorMessage = `Unexpected Client Error: ${error.message}`;
      }

      setErrors(detailedErrors);
      toast.error(errorMessage); // Still use toast for failure messages
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" reverseOrder={false} /> {/* Toaster for toasts */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-background to-amber-50/50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Custom Manufacturing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Bring Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-400 dark:to-amber-600">
                {" "}
                Vision to Life
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload your designs and specifications for custom leather products tailored to your brand. From concept to
              completion, we bring your ideas to reality.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Our Custom Services</h2>
            <p className="text-xl text-muted-foreground">End-to-end custom manufacturing solutions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Design Upload</CardTitle>
                <CardDescription>
                  Upload your designs, sketches, or reference images. We'll work with any format.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Brand Customization</CardTitle>
                <CardDescription>
                  Add your logo, brand colors, and unique styling elements to make products truly yours.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  Rigorous quality control ensures every custom piece meets our premium standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Fast Turnaround</CardTitle>
                <CardDescription>
                  Efficient production timelines without compromising on quality or attention to detail.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Custom Order Form */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <span>Custom Manufacturing Request</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your project and upload your designs. We'll provide a detailed quote and timeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Company Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          placeholder="Your Company Ltd."
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                          className={errors.companyName ? "border-destructive" : ""}
                        />
                        {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          placeholder="John Doe"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          required
                          className={errors.contactPerson ? "border-destructive" : ""}
                        />
                        {errors.contactPerson && <p className="text-destructive text-sm mt-1">{errors.contactPerson}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Project Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productType">Product Type *</Label>
                        <Select
                          value={formData.productType}
                          onValueChange={(value) => handleSelectChange("productType", value)}
                        >
                          <SelectTrigger className={errors.productType ? "border-destructive" : ""}>
                            <SelectValue placeholder="What do you want to create?" />
                          </SelectTrigger>
                          <SelectContent>
                            {productTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.productType && <p className="text-destructive text-sm mt-1">{errors.productType}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedQuantity">Estimated Quantity *</Label>
                        <Input
                          id="estimatedQuantity"
                          name="estimatedQuantity"
                          placeholder="e.g., 500 pieces"
                          value={formData.estimatedQuantity}
                          onChange={handleChange}
                          required
                          className={errors.estimatedQuantity ? "border-destructive" : ""}
                        />
                        {errors.estimatedQuantity && <p className="text-destructive text-sm mt-1">{errors.estimatedQuantity}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredMaterial">Preferred Material</Label>
                        <Select
                          value={formData.preferredMaterial}
                          onValueChange={(value) => handleSelectChange("preferredMaterial", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {preferredMaterials.map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colors">Colors</Label>
                        <Input
                          id="colors"
                          name="colors"
                          placeholder="e.g., Black, Brown, Custom"
                          value={formData.colors}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Select
                          value={formData.timeline}
                          onValueChange={(value) => handleSelectChange("timeline", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="When needed?" />
                          </SelectTrigger>
                          <SelectContent>
                            {timelines.map((timeline) => (
                              <SelectItem key={timeline} value={timeline}>
                                {timeline}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Design Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Design Upload</h3>
                    <div className="space-y-2">
                      <Label htmlFor="designFiles">Upload Design Files</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                        ${errors.designFiles ? "border-destructive" : "border-muted-foreground/25 hover:border-primary/50"}
                        `}
                      >
                        <input
                          id="designFiles"
                          name="designFiles"
                          type="file"
                          multiple
                          accept={ALLOWED_MIMETYPES.join(',')} // Use dynamic allowed mimetypes
                          onChange={handleDesignFileChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <Label htmlFor="designFiles" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h4 className="text-lg font-semibold mb-2">Drop your design files here</h4>
                          <p className="text-sm text-muted-foreground mb-4">or click to browse from your computer</p>
                          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={designFiles.length >= MAX_TOTAL_FILES}>
                            {designFiles.length >= MAX_TOTAL_FILES ? `Max ${MAX_TOTAL_FILES} Files Uploaded` : "Choose Files"}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-4">
                            Supported formats: PDF, JPG, PNG, AI, PSD, DWG, GIF (Max {MAX_FILE_SIZE_MB}MB per file, Max {MAX_TOTAL_FILES} files)
                          </p>
                        </Label>
                      </div>
                      {errors.designFiles && <p className="text-destructive text-sm mt-1">{errors.designFiles}</p>}

                      {designFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Uploaded Files:</p>
                          <ul className="space-y-1">
                            {designFiles.map((file, index) => (
                              <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDesignFile(index)}
                                  disabled={loading}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <XCircle className="w-4 h-4" /> {/* X icon for removal */}
                                  <span className="sr-only">Remove {file.name}</span>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Requirements</h3>
                    <div className="space-y-2">
                      <Label htmlFor="specifications">Detailed Specifications</Label>
                      <Textarea
                        id="specifications"
                        name="specifications"
                        placeholder="Please describe your requirements in detail: dimensions, special features, branding requirements, packaging needs, etc."
                        value={formData.specifications}
                        onChange={handleChange}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetRange">Budget Range (Optional)</Label>
                      <Select
                        value={formData.budgetRange}
                        onValueChange={(value) => handleSelectChange("budgetRange", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-4">
                    <Button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-lg py-6" disabled={loading}>
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Send className="w-5 h-5 mr-2" />
                      )}
                      Submit Custom Manufacturing Request
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Our design team will review your request and respond within 72 hours with a detailed proposal and
                      timeline.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Process Timeline */}
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle>Custom Manufacturing Process</CardTitle>
                <CardDescription>From concept to delivery in 6 simple steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">1-2</span>
                    </div>
                    <h4 className="font-semibold">Design Review & Quote</h4>
                    <p className="text-sm text-muted-foreground">
                      We analyze your designs and provide detailed pricing and timeline (72 hours)
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">3-4</span>
                    </div>
                    <h4 className="font-semibold">Prototype & Approval</h4>
                    <p className="text-sm text-muted-foreground">
                      Create samples for your approval before full production begins (1-2 weeks)
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">5-6</span>
                    </div>
                    <h4 className="font-semibold">Production & Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      Full production and quality control, then secure international shipping (2-6 weeks)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 text-center shadow-lg animate-fade-in-up">
            <CardHeader className="items-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <CardTitle className="text-2xl font-bold">Request Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for your custom manufacturing request. Our design team will
                review your project and get back to you with a detailed proposal within
                <span className="font-semibold text-foreground"> 72 hours</span>.
              </p>
              <Button
                onClick={handleModalCloseAndRedirect}
                className="w-full bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-lg py-3"
              >
                Continue Browsing
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}