import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Check, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface Transaction {
  _id: string;
  accountId: string;
  type: string;
  amount: string;
  description: string;
  category?: string;
  merchantName?: string;
  status: string;
  referenceNumber?: string;
  createdAt: string;
}

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function TransactionReceiptModal({
  isOpen,
  onClose,
  transaction,
}: TransactionReceiptModalProps) {
  if (!transaction) return null;

  const formatAmount = (type: string, amount: string) => {
    const numAmount = Math.abs(parseFloat(amount));
    const prefix = type === 'deposit' || parseFloat(amount) > 0 ? '+' : '-';
    return `${prefix}$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer';
      case 'payment':
        return 'Bill Payment';
      case 'purchase':
        return 'Crypto Purchase';
      default:
        return 'Transaction';
    }
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EVERSTEAD BANK', pageWidth / 2, 30, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Transaction Receipt', pageWidth / 2, 45, { align: 'center' });
    
    // Date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, 55, { align: 'center' });
    
    // Line separator
    pdf.line(20, 65, pageWidth - 20, 65);
    
    // Transaction details
    let yPos = 80;
    const leftCol = 25;
    const rightCol = 120;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION DETAILS', leftCol, yPos);
    yPos += 15;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    // Reference Number
    pdf.text('Reference Number:', leftCol, yPos);
    pdf.text(transaction.referenceNumber || transaction._id, rightCol, yPos);
    yPos += 12;
    
    // Transaction Type
    pdf.text('Transaction Type:', leftCol, yPos);
    pdf.text(getTransactionTypeLabel(transaction.type), rightCol, yPos);
    yPos += 12;
    
    // Description
    pdf.text('Description:', leftCol, yPos);
    const description = transaction.merchantName || transaction.description;
    pdf.text(description.length > 40 ? description.substring(0, 40) + '...' : description, rightCol, yPos);
    yPos += 12;
    
    // Amount
    pdf.text('Amount:', leftCol, yPos);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatAmount(transaction.type, transaction.amount), rightCol, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 12;
    
    // Date & Time
    pdf.text('Date & Time:', leftCol, yPos);
    pdf.text(new Date(transaction.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), rightCol, yPos);
    yPos += 12;
    
    // Status
    pdf.text('Status:', leftCol, yPos);
    pdf.text(transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1), rightCol, yPos);
    yPos += 12;
    
    // Account ID
    pdf.text('Account:', leftCol, yPos);
    pdf.text(`****${transaction.accountId.toString().slice(-4)}`, rightCol, yPos);
    yPos += 20;
    
    // Line separator
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;
    
    // Footer
    pdf.setFontSize(8);
    pdf.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    pdf.text('For any inquiries, please contact Everstead Bank Customer Service.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    pdf.text('Phone: 1-800-EVERSTEAD | Email: support@eversteadbank.com', pageWidth / 2, yPos, { align: 'center' });
    
    // Save the PDF
    pdf.save(`everstead-receipt-${transaction._id}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Building2 className="h-8 w-8 text-primary mr-2" />
            <div>
              <DialogTitle className="text-xl font-bold">EVERSTEAD BANK</DialogTitle>
              <p className="text-sm text-muted-foreground">Transaction Receipt</p>
            </div>
          </div>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">Transaction Completed</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference #</span>
                <span className="text-sm font-mono">
                  {transaction.referenceNumber || transaction._id?.slice(-8) || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm font-medium">
                  {getTransactionTypeLabel(transaction.type)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm font-medium text-right max-w-32">
                  {transaction.merchantName || transaction.description}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className={`text-lg font-bold ${
                  transaction.type === 'deposit' || parseFloat(transaction.amount) > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatAmount(transaction.type, transaction.amount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date & Time</span>
                <span className="text-sm">
                  {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-medium ${
                  transaction.status === 'completed'
                    ? 'text-green-600'
                    : transaction.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account</span>
                <span className="text-sm font-mono">
                  ****{transaction.accountId?.toString().slice(-4) || '0000'}
                </span>
              </div>
            </div>

            <Separator />

            <div className="text-center text-xs text-muted-foreground">
              <p>This is a computer-generated receipt.</p>
              <p>For inquiries: support@eversteadbank.com</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={downloadPDF} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}