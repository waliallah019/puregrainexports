"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/layout/page-banner";
import { FormSection } from "@/components/forms/form-section";
import { EnhancedFormField, EnhancedInput, EnhancedSelect, EnhancedTextarea } from "@/components/forms/enhanced-form-field";
import { Package, Send, CheckCircle, Truck, CreditCard, Building2, User, Mail, Phone, MapPin, Globe, Clock, Award, DollarSign } from "lucide-react";

// Wise Transfer imports
import WisePaymentInstructions from '@/components/sample-request/WisePaymentInstructions';

import { IProduct } from '@/types/product';
import { IRawLeather } from '@/types/rawLeather';
// Import types if they are still needed here and not solely in shippingConfig
import {
  SampleRequestItemType, Urgency, BusinessType, IntendedUse
} from '@/types/request';
import { ExpectedVolume } from '@/lib/models/sampleRequestModel';

// --- IMPORTANT CHANGES HERE ---
// Import getShippingFeeInCents, getShippingFeeInDollars, and the new 'countries' array
// Also import the form options directly from shippingConfig.ts
import {
  getShippingFeeInCents,
  getShippingFeeInDollars,
  countries, // Sorted list of countries
  sampleTypes, // Centralized form options
  quantities,
  materialPreferences,
  finishTypes,
  urgencies,
  businessTypes,
  intendedUses,
  futureVolumes
} from '@/lib/config/shippingConfig'; // Ensure this path is correct

// Wise Transfer configuration

// Create a separate component for the form content that uses useSearchParams
function SampleRequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transferId, setTransferId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentShippingFee, setCurrentShippingFee] = useState(0);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    // --- Initializing with the first country from the sorted list ---
    country: countries.length > 0 ? countries[0] : '', // Use the first country or empty string if array is empty
    urgency: urgencies[0],
    address: '',
    sampleType: sampleTypes[0],
    quantitySamples: quantities[0],
    materialPreference: materialPreferences[0],
    finishType: finishTypes[0],
    colorPreferences: '',
    specificRequests: '',
    businessType: businessTypes[0],
    intendedUse: intendedUses[0],
    futureVolume: futureVolumes[0],
    productId: '',
    productName: '',
    productTypeCategory: '' as 'finished-product' | 'raw-leather' | '',
  });

  const hasPrefilled = useRef(false);

  // Calculate shipping fee whenever country changes
  useEffect(() => {
    setCurrentShippingFee(getShippingFeeInDollars(formData.country));
  }, [formData.country]);

  useEffect(() => {
    const productId = searchParams.get('productId');
    const productTypeCategory = searchParams.get('productTypeCategory') as 'finished-product' | 'raw-leather';

    if (productId && productTypeCategory && !hasPrefilled.current) {
      setLoading(true);
      const fetchProduct = async () => {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          let productData: IProduct | IRawLeather | null = null;
          let name: string = '';
          let material: string = '';
          let finish: string = '';
          let colors: string = '';

          if (productTypeCategory === 'finished-product') {
            const res = await axios.get(`${apiBaseUrl}/finished-products/${productId}`);
            productData = res.data.data;
            name = (productData as IProduct).name;
            material = (productData as IProduct).materialUsed;
            finish = ''; // Finished products might not have a distinct 'finish' field, adjust as needed
            colors = (productData as IProduct).colorVariants?.join(', ') || '';
          } else if (productTypeCategory === 'raw-leather') {
            const res = await axios.get(`${apiBaseUrl}/raw-leather/${productId}`);
            productData = res.data.data;
            name = (productData as IRawLeather).name;
            material = (productData as IRawLeather).leatherType;
            finish = (productData as IRawLeather).finish;
            colors = (productData as IRawLeather).colors?.join(', ') || '';
          }

          if (productData) {
            setFormData(prev => {
              const updatedFormData = {
                ...prev,
                productId: productId,
                productName: name,
                productTypeCategory: productTypeCategory,
                sampleType: (productTypeCategory === 'finished-product' ? 'finished-products' : 'raw-leather') as SampleRequestItemType,
                materialPreference: material,
                finishType: finish,
                colorPreferences: colors,
                specificRequests: `Sample request for: ${name} (${productTypeCategory === 'finished-product' ? 'Finished Product' : 'Raw Leather'})`,
              };
              setCurrentShippingFee(getShippingFeeInDollars(updatedFormData.country));
              return updatedFormData;
            });
            toast(`Pre-filled from ${name}`, {
              icon: '💡',
              style: {
                background: '#e0f2fe',
                color: '#0369a1',
              },
            });
          } else {
            toast.error('Could not pre-fill product details.');
          }
        } catch (error) {
          console.error("Failed to fetch product for pre-filling:", error);
          toast.error('Failed to pre-fill product details. Product not found or API error.');
        } finally {
          setLoading(false);
          hasPrefilled.current = true;
        }
      };
      fetchProduct();
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required.';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact Person is required.';
    if (!formData.email.trim()) newErrors.email = 'Email Address is required.';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Invalid email format.';

    // --- Country Validation ---
    // If you add a "Select a Country" placeholder:
    if (!formData.country.trim() || formData.country === "Select a Country") {
        newErrors.country = 'Please select a country.';
    }
    // If you don't use a placeholder and countries[0] is a valid default:
    // if (!formData.country.trim()) newErrors.country = 'Country is required.';

    if (!formData.address.trim()) newErrors.address = 'Shipping Address is required.';
    if (!formData.sampleType.trim()) newErrors.sampleType = 'Sample Type is required.';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => {
      const updatedFormData = { ...prev, [name]: value };
      if (name === 'country') {
        setCurrentShippingFee(getShippingFeeInDollars(value));
      }
      return updatedFormData;
    });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setLoading(true);
    setErrors({}); // Clear errors before attempting payment initiation

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sample-requests/create-wise-transfer`, {
        amount: currentShippingFee,
        currency: 'usd',
        country: formData.country,
        email: formData.email,
        contactPerson: formData.contactPerson,
        companyName: formData.companyName,
        metadata: {
            requestType: 'sample',
            productId: formData.productId || 'N/A',
            productName: formData.productName || 'N/A',
        }
      });

      if (response.data.success && response.data.transferId) {
        setTransferId(response.data.transferId);
        setPaymentInstructions(response.data.paymentInstructions);
        setShowPaymentForm(true);
        toast.success(`Payment instructions generated for $${currentShippingFee.toFixed(2)} shipping.`);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        toast.error('Failed to initiate payment transfer.');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'An error occurred while initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (wiseTransferId: string) => {
    setLoading(true);
    console.log('Payment confirmed, submitting sample request...', { wiseTransferId });

    try {
      // Clean the payload - remove empty strings and undefined values
      const cleanPayload = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== '' && value !== undefined && value !== null)
      );

      // In test mode, set status to 'pending' instead of 'paid'
      const isTestMode = wiseTransferId.startsWith('test-transfer-');
      const paymentStatus = isTestMode ? 'pending' : 'paid';

      const payload = {
        ...cleanPayload,
        shippingFee: currentShippingFee,
        paymentStatus: paymentStatus,
        wiseTransferId: wiseTransferId,
      };

      console.log('Sending payload to API:', payload);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sample-requests`, payload);

      console.log('API Response:', response.data);

      if (response.data.success) {
        toast.success('Sample request submitted successfully!');

        // Send confirmation email
        try {
          const emailPayload = {
            to: formData.email,
            subject: 'PureGrain: Sample Request Confirmation',
            body: `Dear ${formData.contactPerson || 'Customer'},\n\nThank you for your sample request! We have received your request for ${formData.productName || formData.sampleType}. Your shipping fee of $${currentShippingFee.toFixed(2)} has been successfully processed.\n\nYour Request ID: ${response.data.data._id || 'N/A'}\n\nWe will process your samples shortly and send a separate email with tracking information once they are dispatched. We appreciate your interest in PureGrain.`,
            requestLink: `${window.location.origin}/admin/samples/${response.data.data._id}`,
          };

          console.log('Sending confirmation email:', emailPayload);

          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/send-email`, emailPayload);
          toast.success("Confirmation email sent!");
        } catch (emailError: any) {
          console.error("Failed to send confirmation email:", emailError.response?.data || emailError.message);
          toast.error("Failed to send confirmation email, but your request was recorded.");
        }

        // Navigate to success page
        console.log('Navigating to success page...');
        router.push('/sample-request/success');
      } else {
        console.error('API returned success: false', response.data);
        toast.error(response.data.message || 'Failed to record sample request after payment.');
      }
    } catch (error: any) {
      console.error('Sample request submission error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        payload: error.config?.data
      });

      // More specific error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message ||
                            error.response.data?.errors?.map((e: any) => e.message).join(', ') ||
                            'Server error occurred';
        toast.error(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Network error: Unable to reach server');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred while finalizing your request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50/20 via-background to-amber-50/10 dark:from-amber-950/5 dark:via-background dark:to-amber-950/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Form Card - Enhanced */}
          <Card className="border-0 shadow-leather-lg bg-card/95 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50/50 to-background dark:from-amber-950/10 dark:to-background">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        Sample Request Form
              </CardTitle>
                      <CardDescription className="mt-1">
                        Request samples to verify quality before bulk purchase
              </CardDescription>
                    </div>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-3 py-1">
                  Shipping: ${currentShippingFee.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product Pre-fill Info - Enhanced */}
              {formData.productId && formData.productName && (
                <Card className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-950/30 dark:to-amber-950/20 border-blue-200 dark:border-blue-800 shadow-leather">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            Request for: <span className="text-blue-700 dark:text-blue-400">{formData.productName}</span>
                            {formData.productTypeCategory && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                {formData.productTypeCategory === 'finished-product' ? 'Finished Product' : 'Raw Leather'}
                              </Badge>
                            )}
                </div>
                          <p className="text-xs text-muted-foreground mt-1">Product details pre-filled from catalog</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* B2B Info Banner */}
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="w-5 h-5 text-amber-700 dark:text-amber-400 mb-1" />
                      <span className="text-xs text-muted-foreground">MOQ</span>
                      <span className="text-sm font-semibold text-foreground">50 sq ft</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <DollarSign className="w-5 h-5 text-amber-700 dark:text-amber-400 mb-1" />
                      <span className="text-xs text-muted-foreground">Shipping</span>
                      <span className="text-sm font-semibold text-foreground">${currentShippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Globe className="w-5 h-5 text-amber-700 dark:text-amber-400 mb-1" />
                      <span className="text-xs text-muted-foreground">Countries</span>
                      <span className="text-sm font-semibold text-foreground">40+</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Award className="w-5 h-5 text-amber-700 dark:text-amber-400 mb-1" />
                      <span className="text-xs text-muted-foreground">Certified</span>
                      <span className="text-sm font-semibold text-foreground">ISO 9001</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MAIN FORM */}
              {!showPaymentForm ? (
                <form onSubmit={handleInitiatePayment} className="space-y-6">
                  {/* Company Information - Enhanced */}
                  <FormSection
                    title="Company Information"
                    icon={Building2}
                    description="Tell us about your business for B2B processing"
                    badge="Required"
                    stats={[
                      { label: "Response Time", value: "< 24hrs", icon: Clock },
                      { label: "B2B Verified", value: "Yes", icon: Award }
                    ]}
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <EnhancedFormField
                        id="companyName"
                        label="Company Name"
                        required
                        icon={<Building2 className="w-4 h-4" />}
                        helperText="Your registered business name"
                        tooltip="This will be used for invoicing and shipping documentation"
                        badge="B2B"
                        error={errors.companyName}
                        showSuccess={!!formData.companyName && !errors.companyName}
                      >
                        <EnhancedInput
                          id="companyName"
                          name="companyName"
                          placeholder="Your Company Ltd."
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                          error={errors.companyName}
                          showSuccess={!!formData.companyName && !errors.companyName}
                        />
                      </EnhancedFormField>
                      
                      <EnhancedFormField
                        id="contactPerson"
                        label="Contact Person"
                        required
                        icon={<User className="w-4 h-4" />}
                        helperText="Primary contact for this order"
                        error={errors.contactPerson}
                        showSuccess={!!formData.contactPerson && !errors.contactPerson}
                      >
                        <EnhancedInput
                          id="contactPerson"
                          name="contactPerson"
                          placeholder="John Doe"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          required
                          error={errors.contactPerson}
                          showSuccess={!!formData.contactPerson && !errors.contactPerson}
                        />
                      </EnhancedFormField>
                      </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <EnhancedFormField
                        id="email"
                        label="Email Address"
                        required
                        icon={<Mail className="w-4 h-4" />}
                        helperText="We'll send order confirmations here"
                        tooltip="Used for order updates and tracking information"
                        error={errors.email}
                        showSuccess={!!formData.email && !errors.email}
                      >
                        <EnhancedInput
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          error={errors.email}
                          showSuccess={!!formData.email && !errors.email}
                        />
                      </EnhancedFormField>
                      
                      <EnhancedFormField
                        id="phone"
                        label="Phone Number"
                        icon={<Phone className="w-4 h-4" />}
                        helperText="Optional - for urgent order updates"
                        tooltip="Include country code for international numbers"
                      >
                        <EnhancedInput
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </EnhancedFormField>
                      </div>
                  </FormSection>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Shipping Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                        <Select value={formData.country} onValueChange={handleSelectChange('country')}>
                          <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select destination country" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* If "Select a Country" is your first item in the sorted list, you might want to handle it */}
                            {/* If countries is ['Argentina', 'Australia', ...], then Argentina will be the default shown */}
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && <div className="text-red-500 text-xs mt-1">{errors.country}</div>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency</Label>
                        <Select value={formData.urgency} onValueChange={handleSelectChange('urgency')}>
                          <SelectTrigger>
                            <SelectValue placeholder="How urgent?" />
                          </SelectTrigger>
                          <SelectContent>
                            {urgencies.map(urgency => (
                              <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Shipping Address <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="address" name="address"
                        placeholder="Please provide complete shipping address including postal code"
                        className={`min-h-[80px] ${errors.address ? 'border-red-500' : ''}`}
                        value={formData.address} onChange={handleChange}
                        required
                      />
                      {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Sample Requirements</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sampleType">Sample Type <span className="text-red-500">*</span></Label>
                        <Select value={formData.sampleType} onValueChange={handleSelectChange('sampleType')}>
                          <SelectTrigger className={errors.sampleType ? 'border-red-500' : ''}>
                            <SelectValue placeholder="What type of samples?" />
                          </SelectTrigger>
                          <SelectContent>
                            {sampleTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type === 'raw-leather' ? 'Raw Leather Materials' : type === 'finished-products' ? 'Finished Products' : 'Both Raw & Finished'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.sampleType && <div className="text-red-500 text-xs mt-1">{errors.sampleType}</div>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantitySamples">Number of Samples</Label>
                        <Select value={formData.quantitySamples} onValueChange={handleSelectChange('quantitySamples')}>
                          <SelectTrigger>
                            <SelectValue placeholder="How many samples?" />
                          </SelectTrigger>
                          <SelectContent>
                            {quantities.map(qty => (
                              <SelectItem key={qty} value={qty}>{qty}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materialPreference">Material Preference</Label>
                        <Select value={formData.materialPreference} onValueChange={handleSelectChange('materialPreference')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Material type" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialPreferences.map(mat => (
                              <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="finishType">Finish Type</Label>
                        <Select value={formData.finishType} onValueChange={handleSelectChange('finishType')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Finish preference" />
                          </SelectTrigger>
                          <SelectContent>
                            {finishTypes.map(fin => (
                              <SelectItem key={fin} value={fin}>{fin}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="colorPreferences">Color Preferences</Label>
                        <Input
                          id="colorPreferences" name="colorPreferences" placeholder="e.g., Black, Brown, Natural"
                          value={formData.colorPreferences} onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specificRequests">Specific Sample Requests</Label>
                      <Textarea
                        id="specificRequests" name="specificRequests"
                        placeholder="Please specify exact products, colors, thicknesses, or any special requirements for your samples..."
                        className="min-h-[100px]"
                        value={formData.specificRequests} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Business Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select value={formData.businessType} onValueChange={handleSelectChange('businessType')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="intendedUse">Intended Use</Label>
                        <Select value={formData.intendedUse} onValueChange={handleSelectChange('intendedUse')}>
                          <SelectTrigger>
                            <SelectValue placeholder="How will you use these?" />
                          </SelectTrigger>
                          <SelectContent>
                            {intendedUses.map(use => (
                              <SelectItem key={use} value={use}>{use}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="futureVolume">Expected Future Order Volume</Label>
                      <Select value={formData.futureVolume} onValueChange={handleSelectChange('futureVolume')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Estimated order size if samples approved" />
                        </SelectTrigger>
                        <SelectContent>
                          {futureVolumes.map(volume => (
                            <SelectItem key={volume} value={volume}>{volume}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-lg py-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <CreditCard className="w-5 h-5 mr-2" />
                    )}
                    Proceed to Payment (${currentShippingFee.toFixed(2)} Shipping)
                  </Button>
                </form>
              ) : (
                // PAYMENT FORM
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-amber-600" /> Complete Payment
                  </h3>
                  {transferId && (
                    <WisePaymentInstructions
                      transferId={transferId}
                        shippingFee={currentShippingFee}
                      onPaymentConfirmed={handlePaymentSuccess}
                      onCancel={() => setShowPaymentForm(false)}
                      paymentInstructions={paymentInstructions}
                    />
                  )}
                </div>
              )}

              <div className="space-y-4 mt-8 pt-8 border-t border-border">
                <div className="text-sm text-muted-foreground text-center">
                  We'll prepare your samples and ship them within 72 hours. You'll receive tracking information via
                  email.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// Loading fallback component
function SampleRequestLoading() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>Sample Request Form</span>
              </CardTitle>
              <CardDescription>
                Loading form...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function SampleRequestPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner
        title="Request Samples"
        subtitle="Experience our quality firsthand. Order samples of our leather materials and finished products before placing your bulk order."
        badge="Sample Request"
        compact={true}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Why Request Samples?</h2>
            <div className="text-xl text-muted-foreground">Make informed decisions with hands-on experience</div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Quality Verification</CardTitle>
                <CardDescription>
                  Feel the texture, check the thickness, and verify the quality meets your standards before ordering.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Color Matching</CardTitle>
                <CardDescription>
                  Ensure colors match your requirements and see how they look under different lighting conditions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <CardTitle>Risk-Free Testing</CardTitle>
                <CardDescription>
                  Test compatibility with your production process and customer preferences before bulk investment.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <Suspense fallback={<SampleRequestLoading />}>
        <SampleRequestForm />
      </Suspense>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle>Sample Process & Timeline</CardTitle>
                <CardDescription>What happens after you submit your request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">1</span>
                    </div>
                    <h4 className="font-semibold">Request Review</h4>
                    <div className="text-sm text-muted-foreground">
                      We review your requirements and select the best samples (2-4 hours)
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">2</span>
                    </div>
                    <h4 className="font-semibold">Sample Preparation</h4>
                    <div className="text-sm text-muted-foreground">
                      Samples are carefully prepared and packaged for shipping (24-48 hours)
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">3</span>
                    </div>
                    <h4 className="font-semibold">Shipping</h4>
                    <div className="text-sm text-muted-foreground">
                      Express international shipping with tracking number provided (2-7 days)
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">4</span>
                    </div>
                    <h4 className="font-semibold">Follow-up</h4>
                    <div className="text-sm text-muted-foreground">
                      Our team follows up to discuss your feedback and next steps
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle>Sample Costs & Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4 text-foreground">Sample Pricing</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Raw leather samples: Free (shipping fee applies)</li>
                      <li>• Finished product samples: Free (shipping fee applies)</li>
                      <li>• Shipping costs: Calculated based on destination</li>
                      <li>• Express shipping available for urgent requests</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-foreground">Sample Policy</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Sample costs refunded on first bulk order</li>
                      <li>• Maximum 10 samples per initial request</li>
                      <li>• Custom samples may require additional time</li>
                      <li>• All samples include detailed specifications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}