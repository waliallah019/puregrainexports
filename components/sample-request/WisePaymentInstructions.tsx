import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle, ExternalLink, Loader2 } from "lucide-react";

interface WisePaymentInstructionsProps {
  transferId: string;
  shippingFee: number;
  onPaymentConfirmed: (transferId: string) => void;
  onCancel: () => void;
  paymentInstructions?: any;
}

const WisePaymentInstructions: React.FC<WisePaymentInstructionsProps> = ({
  transferId,
  shippingFee,
  onPaymentConfirmed,
  onCancel,
  paymentInstructions
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string>('pending');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopied(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const checkTransferStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/sample-requests/check-wise-transfer?transferId=${transferId}`);
      const data = await response.json();
      
      if (data.success && data.status) {
        setTransferStatus(data.status);
        
        // In test mode, immediately confirm payment
        if (data._testMode || transferId.startsWith('test-transfer-')) {
          toast.success('Payment confirmed! (Test Mode)');
          onPaymentConfirmed(transferId);
          return;
        }
        
        if (data.status === 'outgoing_payment_sent' || data.status === 'funded' || data.status === 'incoming_payment_waiting') {
          toast.success('Payment confirmed!');
          onPaymentConfirmed(transferId);
        } else if (data.status === 'cancelled' || data.status === 'failed') {
          toast.error('Payment was cancelled or failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error checking transfer status:', error);
      // In test mode, if check fails, still allow confirmation
      if (transferId.startsWith('test-transfer-')) {
        toast.success('Payment confirmed! (Test Mode)');
        onPaymentConfirmed(transferId);
      } else {
        toast.error('Failed to check payment status. Please try again.');
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Auto-check status every 30 seconds
  useEffect(() => {
    if (transferStatus === 'pending' || transferStatus === 'processing') {
      const interval = setInterval(() => {
        checkTransferStatus();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [transferStatus, transferId]);

  const getBankDetails = () => {
    if (!paymentInstructions) return null;
    
    // Wise payment instructions structure may vary
    const accountDetails = paymentInstructions?.accountDetails || paymentInstructions;
    return accountDetails;
  };

  const bankDetails = getBankDetails();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-amber-600" />
            <span>Payment Instructions</span>
          </CardTitle>
          <CardDescription>
            Please complete the payment of <span className="font-semibold text-foreground">${shippingFee.toFixed(2)}</span> using the details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankDetails ? (
            <div className="space-y-4">
              {bankDetails.accountNumber && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Number</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={bankDetails.accountNumber}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                    >
                      {copied === 'Account Number' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {bankDetails.routingNumber && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Routing Number</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={bankDetails.routingNumber}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankDetails.routingNumber, 'Routing Number')}
                    >
                      {copied === 'Routing Number' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {bankDetails.swiftCode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">SWIFT Code</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={bankDetails.swiftCode}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankDetails.swiftCode, 'SWIFT Code')}
                    >
                      {copied === 'SWIFT Code' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {bankDetails.bankName && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bank Name</Label>
                  <Input value={bankDetails.bankName} readOnly />
                </div>
              )}

              {bankDetails.iban && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">IBAN</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={bankDetails.iban}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankDetails.iban, 'IBAN')}
                    >
                      {copied === 'IBAN' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {bankDetails.reference && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reference / Memo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={bankDetails.reference}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(bankDetails.reference, 'Reference')}
                    >
                      {copied === 'Reference' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Please include this reference when making the payment
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Transfer ID:</strong> {transferId}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                  Please contact us at support@puregrain.com with your Transfer ID to receive payment instructions.
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-700 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> After completing the payment, click the button below to confirm. 
              Your sample request will be processed once payment is verified.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={checkTransferStatus}
              disabled={isCheckingStatus}
              className="flex-1 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800"
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {transferId.startsWith('test-transfer-') ? 'Processing...' : 'Checking...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Completed Payment
                  {transferId.startsWith('test-transfer-') && (
                    <span className="ml-2 text-xs opacity-75">(Test Mode)</span>
                  )}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {transferStatus && transferStatus !== 'pending' && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium">Payment Status: <span className="capitalize">{transferStatus.replace(/_/g, ' ')}</span></p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you have any questions about the payment process, please contact us at{' '}
            <a href="mailto:support@puregrain.com" className="text-amber-600 hover:underline">
              support@puregrain.com
            </a>
            {' '}or call us at{' '}
            <a href="tel:+1234567890" className="text-amber-600 hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WisePaymentInstructions;

