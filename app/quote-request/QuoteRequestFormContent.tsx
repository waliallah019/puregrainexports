// my-leather-platform/app/quote-request/QuoteRequestFormContent.tsx
"use client"; // This component MUST be a client component

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, CheckCircle, Loader2 } from "lucide-react";

import { IProduct } from '@/types/product';
import { IRawLeather } from '@/types/rawLeather';
import {
  countries,
  businessTypes as configBusinessTypes,
} from '@/lib/config/shippingConfig';
import { cn } from '@/lib/utils'; // Import cn for conditional classNames

// Define types and constants for this specific quote form
type QuoteRequestProductCategory = 'raw-leather' | 'finished-products' | 'custom';
const productCategories: QuoteRequestProductCategory[] = ['raw-leather', 'finished-products', 'custom'];
const leatherTypes = ["Cowhide", "Buffalo", "Goat", "Sheep", "Exotic", "Other"];
const finishTypes = ["Aniline", "Semi-Aniline", "Pigmented", "Nubuck", "Suede", "Other"];
const timelines = ['asap', '1-2weeks', '1month', '2-3months', 'flexible', 'custom'];


export function QuoteRequestFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasPrefilled = useRef(false);
  const [customTimelineText, setCustomTimelineText] = useState('');
  const [availableColors, setAvailableColors] = useState<string[]>([]); // New state for available colors


  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    businessType: '' as string,
    productCategory: '' as QuoteRequestProductCategory | '',
    // Raw Leather Specific
    leatherType: '',
    finish: '',
    thickness: '',
    // Finished Product Specific
    materialUsed: '',
    dimensions: '',
    // Common
    color: '', // This will be the selected color
    quantity: 0,
    quantityUnit: '',
    timeline: '',
    specifications: '',
    productId: '',
    productName: '',
    productTypeCategory: '' as 'finished-product' | 'raw-leather' | '',
  });

  // Pre-fill logic based on URL params
  useEffect(() => {
    const itemId = searchParams.get('itemId');
    const itemTypeCategoryFromUrl = searchParams.get('itemTypeCategory');
    const itemName = searchParams.get('itemName');

    const prefillProductCategory: QuoteRequestProductCategory | undefined =
      itemTypeCategoryFromUrl === 'finished-product'
        ? 'finished-products'
        : (itemTypeCategoryFromUrl === 'raw-leather'
            ? 'raw-leather'
            : undefined);

    const prefillProductTypeCategory: 'finished-product' | 'raw-leather' | '' =
        (itemTypeCategoryFromUrl === 'finished-product' || itemTypeCategoryFromUrl === 'raw-leather')
            ? itemTypeCategoryFromUrl
            : '';


    if (itemId && itemName && prefillProductCategory && prefillProductTypeCategory && !hasPrefilled.current) {
      setLoading(true);
      const fetchProductDetails = async () => {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          let productDetails: IProduct | IRawLeather | null = null;
          let prefilledName = itemName;
          let prefilledLeatherType = '';
          let prefilledFinish = '';
          let prefilledThickness = '';
          let prefilledMaterialUsed = '';
          let prefilledDimensions = '';
          let prefilledQuantity = 0;
          let prefilledQuantityUnit = '';
          let fetchedColors: string[] = []; // Store all fetched colors

          if (prefillProductTypeCategory === 'finished-product') {
            const res = await axios.get(`${apiBaseUrl}/finished-products/${itemId}`);
            productDetails = res.data.data;
            prefilledName = (productDetails as IProduct).name || prefilledName;
            prefilledQuantity = (productDetails as IProduct).moq || 1;
            prefilledQuantityUnit = (productDetails as IProduct).priceUnit || 'units';
            fetchedColors = (productDetails as IProduct).colorVariants || []; // Get all color variants
            prefilledMaterialUsed = (productDetails as IProduct).materialUsed || '';
            prefilledDimensions = (productDetails as IProduct).dimensions || '';

          } else if (prefillProductTypeCategory === 'raw-leather') {
            const res = await axios.get(`${apiBaseUrl}/raw-leather/${itemId}`);
            productDetails = res.data.data;
            prefilledName = (productDetails as IRawLeather).name || prefilledName;
            prefilledLeatherType = (productDetails as IRawLeather).leatherType || '';
            prefilledFinish = (productDetails as IRawLeather).finish || '';
            prefilledThickness = (productDetails as IRawLeather).thickness || '';
            fetchedColors = (productDetails as IRawLeather).colors || []; // Get all colors
            prefilledQuantity = (productDetails as IRawLeather).minOrderQuantity || 1;
            prefilledQuantityUnit = (productDetails as IRawLeather).priceUnit || 'sq ft';
          }

          if (productDetails || prefilledName) {
            setFormData(prev => ({
              ...prev,
              productId: itemId,
              productName: prefilledName,
              productTypeCategory: prefillProductTypeCategory,
              productCategory: prefillProductCategory,
              leatherType: prefilledLeatherType,
              finish: prefilledFinish,
              thickness: prefilledThickness,
              materialUsed: prefilledMaterialUsed,
              dimensions: prefilledDimensions,
              color: fetchedColors.length > 0 ? fetchedColors[0] : '', // Select first color by default
              quantity: prefilledQuantity,
              quantityUnit: prefilledQuantityUnit, // Set prefilled unit
              specifications: `Quote request for: ${prefilledName}`,
            }));
            setAvailableColors(fetchedColors); // Set available colors
            toast(`Pre-filled from ${prefilledName}`, { icon: '💡' });
            hasPrefilled.current = true;
          } else {
            toast.error('Could not pre-fill product details.');
          }
        } catch (error) {
          console.error("Failed to fetch product for pre-filling:", error);
          toast.error('Failed to pre-fill product details from API.');
        } finally {
          setLoading(false);
        }
      };
      fetchProductDetails();
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required.';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact Person is required.';
    if (!formData.email.trim()) newErrors.email = 'Email Address is required.';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Invalid email format.';
    if (!formData.country.trim()) newErrors.country = 'Country is required.';
    if (!formData.productCategory.trim()) newErrors.productCategory = 'Product Category is required.';

    if (formData.productCategory !== 'custom' && !formData.productName.trim()) {
      newErrors.productName = 'Product Name is required if not a custom request.';
    }

    // Required fields based on new requirements
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity required must be at least 1.';
    if (!formData.quantityUnit.trim()) newErrors.quantityUnit = 'Quantity unit is required.';
    // Color is required for pre-filled or specific products (not custom)
    if (isProductCategorySpecific && !formData.color.trim()) {
      newErrors.color = 'Please select a color or specify in details.';
    }
    // Timeline is optional, but custom text is required if 'custom' is selected
    if (formData.timeline === 'custom' && !customTimelineText.trim()) {
      newErrors.timeline = 'Please specify your custom timeline.';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? 0 : Number(value);
    setFormData((prev) => ({ ...prev, quantity: numValue < 0 ? 0 : numValue }));
    setErrors(prev => ({ ...prev, quantity: '' }));
  };

  const handleSelectChange = (name: string) => (value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value as any }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'timeline' && value !== 'custom') {
      setCustomTimelineText('');
    }

    if (name === 'productCategory') {
      // Clear product specific details and available colors when category changes
      setAvailableColors([]); // Clear available colors
      setFormData(prev => ({
        ...prev,
        productId: '',
        productName: '',
        productTypeCategory: '',
        leatherType: '',
        finish: '',
        thickness: '',
        materialUsed: '',
        dimensions: '',
        color: '', // Clear selected color
        quantityUnit: '', // Reset unit for custom or new category
        specifications: '',
      }));
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    setErrors(prev => ({ ...prev, color: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      console.log('Validation errors:', errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let finalItemTypeCategory = formData.productTypeCategory;
      if (formData.productCategory === 'custom') {
        finalItemTypeCategory = 'finished-product';
      }

      const effectiveTimeline = formData.timeline === 'custom' ? customTimelineText : formData.timeline;

      const payload = {
        itemName: formData.productName || (formData.productCategory === 'custom' ? 'Custom Product Request' : 'Unknown Product'),
        itemId: formData.productId || undefined,
        itemTypeCategory: finalItemTypeCategory || (formData.productCategory === 'raw-leather' ? 'raw-leather' : 'finished-product'),

        customerName: formData.contactPerson,
        customerEmail: formData.email,
        companyName: formData.companyName,
        customerPhone: formData.phone.trim() || undefined,
        destinationCountry: formData.country,

        quantity: formData.quantity,
        quantityUnit: formData.quantityUnit,
        // Combine product specific details and timeline into specifications
        additionalComments: [
          formData.specifications.trim(),
          formData.productName && formData.productCategory === 'custom' ? `Custom Product Name: ${formData.productName}` : '',
          formData.leatherType ? `Leather Type: ${formData.leatherType}` : '',
          formData.finish ? `Finish: ${formData.finish}` : '',
          formData.thickness ? `Thickness: ${formData.thickness}` : '',
          formData.materialUsed ? `Material Used: ${formData.materialUsed}` : '',
          formData.dimensions ? `Dimensions: ${formData.dimensions}` : '',
          formData.color ? `Requested Color: ${formData.color}` : '',
          effectiveTimeline ? `Required Timeline: ${effectiveTimeline}` : '',
        ].filter(Boolean).join('\n').trim() || undefined,
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/quote-requests`, payload);

      if (response.data.success) {
        toast.success('Quote request submitted successfully! We will respond within 48 hours.');
        // Reset ALL fields
        setFormData({
          companyName: '', contactPerson: '', email: '', phone: '',
          country: '', businessType: '' as string,
          productCategory: '' as QuoteRequestProductCategory | '',
          leatherType: '', finish: '', thickness: '', materialUsed: '', dimensions: '', color: '',
          quantity: 0, quantityUnit: '',
          timeline: '', specifications: '',
          productId: '', productName: '', productTypeCategory: '',
        });
        setCustomTimelineText('');
        setAvailableColors([]); // Reset available colors
        hasPrefilled.current = false;
        router.push('/catalog');
      } else {
        toast.error(response.data.message || 'Failed to submit quote request.');
      }
    } catch (error: any) {
      console.error('Quote request submission error:', error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const mappedErrors = backendErrors.reduce((acc: any, err: any) => {
            const fieldName = err.path.join('.').replace(/^body\./, '');
            acc[fieldName] = err.message;
            return acc;
        }, {});
        setErrors(mappedErrors);
        toast.error('Validation failed. Please check your inputs.');
      } else {
        toast.error(error.response?.data?.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isPrefilled = !!(formData.productId && formData.productName && formData.productTypeCategory);
  const isProductCategorySpecific = formData.productCategory === 'raw-leather' || formData.productCategory === 'finished-products';

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <section className="py-20 bg-gradient-to-br from-amber-50 via-background to-amber-50/50 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Quote Request
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Request a
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-400 dark:to-amber-600">
                {" "}
                Quote
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get competitive wholesale pricing for your leather requirements. Our team will provide a detailed quote
              within 48 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>Quote Request Form</span>
                </CardTitle>
                <CardDescription>
                  Please provide detailed information about your requirements for an accurate quote.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {isPrefilled && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md text-sm border border-blue-200 dark:border-blue-700">
                    <p className="font-medium text-blue-800 dark:text-blue-200 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pre-filled for: <span className="font-semibold ml-1">{formData.productName || 'N/A'}</span>
                      {formData.productTypeCategory && <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {formData.productTypeCategory === 'finished-product' ? 'Finished Product' : 'Raw Leather'}
                      </Badge>}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Company Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="companyName" name="companyName" placeholder="Your Company Ltd."
                          value={formData.companyName} onChange={handleChange}
                          required className={errors.companyName ? 'border-red-500' : ''}
                        />
                        {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person <span className="text-red-500">*</span></Label>
                        <Input
                          id="contactPerson" name="contactPerson" placeholder="John Doe"
                          value={formData.contactPerson} onChange={handleChange}
                          required className={errors.contactPerson ? 'border-red-500' : ''}
                        />
                        {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                          id="email" name="email" type="email" placeholder="john@company.com"
                          value={formData.email} onChange={handleChange}
                          required className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567"
                          value={formData.phone} onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                        <Select value={formData.country || undefined} onValueChange={handleSelectChange('country')}>
                          <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select destination country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select value={formData.businessType || undefined} onValueChange={handleSelectChange('businessType')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {configBusinessTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Product Requirements</h3>
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name {formData.productCategory !== 'custom' && <span className="text-red-500">*</span>}</Label>
                      <Input
                        id="productName" name="productName"
                        placeholder={formData.productCategory === 'custom' ? 'Describe your custom product (optional)' : 'e.g., Leather Jacket, Vegetable Tanned Cowhide'}
                        value={formData.productName}
                        onChange={handleChange}
                        readOnly={isPrefilled && isProductCategorySpecific}
                        disabled={isPrefilled && isProductCategorySpecific}
                        className={isPrefilled && isProductCategorySpecific ? "bg-muted-foreground/10" : (errors.productName ? 'border-red-500' : '')}
                        required={formData.productCategory !== 'custom'}
                      />
                       {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="productCategory">Product Category <span className="text-red-500">*</span></Label>
                        <Select
                          value={formData.productCategory || undefined}
                          onValueChange={handleSelectChange('productCategory')}
                          disabled={isPrefilled} // Disable if pre-filled
                        >
                          <SelectTrigger className={cn(errors.productCategory ? 'border-red-500' : '', isPrefilled && 'no-dropdown-arrow')}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {productCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat === 'raw-leather' ? 'Raw Leather Materials' : cat === 'finished-products' ? 'Finished Products' : 'Custom Manufacturing'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.productCategory && <p className="text-red-500 text-xs mt-1">{errors.productCategory}</p>}
                      </div>

                    {formData.productCategory === 'raw-leather' && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="leatherType">Leather Type</Label>
                            <Select
                              value={formData.leatherType || undefined}
                              onValueChange={handleSelectChange('leatherType')}
                              disabled={isPrefilled} // Disable if pre-filled
                            >
                              <SelectTrigger className={cn(isPrefilled ? "bg-muted-foreground/10" : '', isPrefilled && 'no-dropdown-arrow')}>
                                <SelectValue placeholder="Select leather type" />
                              </SelectTrigger>
                              <SelectContent>
                                {leatherTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="finish">Finish</Label>
                            <Select
                              value={formData.finish || undefined}
                              onValueChange={handleSelectChange('finish')}
                              disabled={isPrefilled} // Disable if pre-filled
                            >
                              <SelectTrigger className={cn(isPrefilled ? "bg-muted-foreground/10" : '', isPrefilled && 'no-dropdown-arrow')}>
                                <SelectValue placeholder="Select finish" />
                              </SelectTrigger>
                              <SelectContent>
                                {finishTypes.map(fin => (
                                  <SelectItem key={fin} value={fin}>{fin}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="thickness">Thickness (mm)</Label>
                          <Input
                            id="thickness" name="thickness" placeholder="e.g., 1.2-1.4"
                            value={formData.thickness} onChange={handleChange}
                            readOnly={isPrefilled}
                            disabled={isPrefilled}
                            className={isPrefilled ? "bg-muted-foreground/10" : ''}
                          />
                        </div>
                      </>
                    )}

                    {formData.productCategory === 'finished-products' && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="materialUsed">Material Used</Label>
                            <Input
                              id="materialUsed" name="materialUsed" placeholder="e.g., Cowhide, Suede"
                              value={formData.materialUsed} onChange={handleChange}
                              readOnly={isPrefilled}
                              disabled={isPrefilled}
                              className={isPrefilled ? "bg-muted-foreground/10" : ''}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dimensions">Dimensions</Label>
                            <Input
                              id="dimensions" name="dimensions" placeholder="e.g., 20x30cm, 100x120cm"
                              value={formData.dimensions} onChange={handleChange}
                              readOnly={isPrefilled}
                              disabled={isPrefilled}
                              className={isPrefilled ? "bg-muted-foreground/10" : ''}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Color Selection - Buttons for available colors if product-specific, input for custom */}
                    <div className="space-y-2">
                      <Label htmlFor="color">Color {isProductCategorySpecific && <span className="text-red-500">*</span>}</Label>
                      {isProductCategorySpecific && availableColors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map(colorOption => (
                            <Button
                              key={colorOption}
                              type="button"
                              variant={formData.color === colorOption ? "default" : "outline"}
                              onClick={() => handleColorSelect(colorOption)}
                              disabled={isPrefilled} // Disable color selection if pre-filled
                              className={cn(
                                "capitalize",
                                isPrefilled && "cursor-not-allowed opacity-70"
                              )}
                            >
                              {colorOption}
                            </Button>
                          ))}
                        </div>
                      )}
                      {(isProductCategorySpecific && availableColors.length === 0) || formData.productCategory === 'custom' ? (
                        <Input
                          id="color" name="color" placeholder="e.g., Black, Brown, Tan"
                          value={formData.color} onChange={handleChange}
                          className={errors.color ? 'border-red-500' : ''}
                          required={isProductCategorySpecific}
                          readOnly={isPrefilled && isProductCategorySpecific && availableColors.length > 0} // Make editable if custom, or no predefined colors
                          disabled={isPrefilled && isProductCategorySpecific && availableColors.length > 0}
                        />
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                          For mixed colors or colors not listed, please specify details in "Detailed Specifications".
                      </p>
                      {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity Required <span className="text-red-500">*</span></Label>
                        <Input
                          id="quantity" name="quantity" type="number" min="1"
                          value={formData.quantity === 0 ? '' : formData.quantity}
                          onChange={handleQuantityChange}
                          required className={errors.quantity ? 'border-red-500' : ''}
                        />
                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantityUnit">Quantity Unit <span className="text-red-500">*</span></Label>
                        <Select
                          value={formData.quantityUnit || undefined}
                          onValueChange={handleSelectChange('quantityUnit')}
                          disabled={isPrefilled} // Disable if pre-filled
                        >
                          <SelectTrigger className={cn(isPrefilled ? "bg-muted-foreground/10" : (errors.quantityUnit ? 'border-red-500' : ''), isPrefilled && 'no-dropdown-arrow')}>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="units">Units</SelectItem>
                            <SelectItem value="sq ft">Sq Ft</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="rolls">Rolls</SelectItem>
                            <SelectItem value="yards">Yards</SelectItem>
                            <SelectItem value="meters">Meters</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.quantityUnit && <p className="text-red-500 text-xs mt-1">{errors.quantityUnit}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Required Timeline</Label>
                      <Select value={formData.timeline || undefined} onValueChange={handleSelectChange('timeline')}>
                        <SelectTrigger className={errors.timeline ? 'border-red-500' : ''}>
                          <SelectValue placeholder="When do you need this?" />
                        </SelectTrigger>
                        <SelectContent>
                          {timelines.map(tl => (
                            <SelectItem key={tl} value={tl}>
                              {tl === 'asap' ? 'As soon as possible' :
                               tl === '1-2weeks' ? '1-2 Weeks' :
                               tl === '1month' ? '1 Month' :
                               tl === '2-3months' ? '2-3 Months' :
                               tl === 'flexible' ? 'Flexible' :
                               'Custom Timeline'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.timeline === 'custom' && (
                        <Input
                          id="customTimelineText"
                          name="customTimelineText"
                          placeholder="e.g., By end of October, 2024"
                          value={customTimelineText}
                          onChange={(e) => setCustomTimelineText(e.target.value)}
                          className={`mt-2 ${errors.timeline ? 'border-red-500' : ''}`}
                        />
                      )}
                      {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline}</p>}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="specifications">Detailed Specifications</Label>
                      <Textarea
                        id="specifications" name="specifications"
                        placeholder="Please provide any additional specifications, quality requirements, or special requests..."
                        className="min-h-[100px]"
                        value={formData.specifications} onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-lg py-6"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-5 w-5 text-white mr-2" />
                      ) : (
                        <Send className="w-5 h-5 mr-2" />
                      )}
                      Submit Quote Request
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      By submitting this form, you agree to our terms of service and privacy policy. We'll respond within
                      48 hours with a detailed quote.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">1</span>
                    </div>
                    <h4 className="font-semibold">Review & Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Our team reviews your requirements and analyzes the best options for your needs.
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">2</span>
                    </div>
                    <h4 className="font-semibold">Detailed Quote</h4>
                    <p className="text-sm text-muted-foreground">
                      We prepare a comprehensive quote including pricing, specifications, and delivery terms.
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">3</span>
                    </div>
                    <h4 className="font-semibold">Follow-up Call</h4>
                    <p className="text-sm text-muted-foreground">
                      Our sales team contacts you to discuss the quote and answer any questions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Custom CSS for hiding dropdown arrow */}
      <style jsx global>{`
        .no-dropdown-arrow > button[data-state='closed'],
        .no-dropdown-arrow > button[data-state='open'] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          pointer-events: none; /* Prevent interaction with the arrow area */
        }
        .no-dropdown-arrow > button[data-state='closed'] svg,
        .no-dropdown-arrow > button[data-state='open'] svg {
            display: none; /* Hide the icon */
        }
      `}</style>
    </>
  );
}