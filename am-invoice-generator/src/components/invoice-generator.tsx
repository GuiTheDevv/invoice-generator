"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Table components implemented inline
import { Plus, Trash2, RefreshCw, Download } from "lucide-react";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [clientName, setClientName] = useState("TechCorp Inc.");
  const [clientAddress, setClientAddress] = useState(
    "456 Innovation Drive, Silicon Valley, CA 94000"
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      description: "Software Development - Frontend",
      quantity: 40,
      unitPrice: 125,
    },
    {
      id: 2,
      description: "Monthly SaaS Subscription",
      quantity: 1,
      unitPrice: 299,
    },
    {
      id: 3,
      description: "Custom API Integration",
      quantity: 1,
      unitPrice: 1500,
    },
  ]);
  const [taxRate, setTaxRate] = useState(0.08);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [projectName, setProjectName] = useState("Web Application Development");
  const [servicesPeriod, setServicesPeriod] = useState("December 2024");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Generate invoice number only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    if (!invoiceNumber) {
      const uuid = crypto.randomUUID();
      setInvoiceNumber(`INV-${uuid.slice(0, 8).toUpperCase()}`);
    }
  }, [invoiceNumber]);

  useEffect(() => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    setSubtotal(newSubtotal);
    setTotal(newSubtotal * (1 + taxRate));
  }, [items, taxRate]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "description"
                  ? value
                  : Number.parseFloat(value as string) || 0,
            }
          : item
      )
    );
  };

  const generateNewInvoiceNumber = () => {
    if (isClient) {
      const uuid = crypto.randomUUID();
      setInvoiceNumber(`INV-${uuid.slice(0, 8).toUpperCase()}`);
    }
  };

  const handleGeneratePdf = () => {
    if (!invoiceRef.current || !isClient) return;
    setIsGeneratingPdf(true);

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoiceNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 40px; 
                position: relative;
                background: white;
              }
              body::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                height: 400px;
                background-image: url('/assets/am-logo.svg');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
              }
              .invoice { 
                max-width: 800px; 
                margin: 0 auto; 
                position: relative;
                z-index: 1;
                background: white;
              }
              .header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
              .logo { height: 60px; width: auto; }
              h1 { font-size: 2em; border-bottom: 2px solid #333; padding-bottom: 10px; margin: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .text-right { text-align: right; }
              .totals { margin-top: 20px; text-align: right; }
              .total-row { font-size: 1.2em; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #666; }
              hr { margin: 20px 0; border: none; border-top: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="invoice">
              <div class="header">
                <img src="/assets/am-logo.svg" alt="Company Logo" class="logo" onerror="this.style.display='none'">
                <h1>INVOICE</h1>
              </div>
              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
              <hr>
              <p><strong>Bill To:</strong></p>
              <p>${clientName}</p>
              <p>${clientAddress}</p>
              <hr>
              <p><strong>Project:</strong> ${projectName}</p>
              <p><strong>Services Period:</strong> ${servicesPeriod}</p>
              <p><strong>Payment Terms:</strong> ${paymentTerms}</p>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.description}</td>
                      <td class="text-right">${item.quantity}</td>
                      <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                      <td class="text-right">$${(
                        item.quantity * item.unitPrice
                      ).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="totals">
                <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
                <p><strong>Tax (${(taxRate * 100).toFixed(1)}%):</strong> $${(
        subtotal * taxRate
      ).toFixed(2)}</p>
                <p class="total-row"><strong>Total:</strong> $${total.toFixed(
                  2
                )}</p>
              </div>
              <p class="footer">Thank you for your business!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    setIsGeneratingPdf(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/assets/am-logo.svg"
              alt="Company Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <CardTitle>Invoice Generator</CardTitle>
              <CardDescription>
                Fill in the details to generate your invoice and export as PDF.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateNewInvoiceNumber}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clientAddress">Client Address</Label>
              <Input
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="servicesPeriod">Services Period</Label>
              <Input
                id="servicesPeriod"
                value={servicesPeriod}
                onChange={(e) => setServicesPeriod(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Invoice Items</Label>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left">
                      Description
                    </th>
                    <th className="border border-gray-200 p-3 text-left w-24">
                      Quantity
                    </th>
                    <th className="border border-gray-200 p-3 text-left w-32">
                      Unit Price
                    </th>
                    <th className="border border-gray-200 p-3 text-left w-32">
                      Total
                    </th>
                    <th className="border border-gray-200 p-3 text-left w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Item description"
                        />
                      </td>
                      <td className="border border-gray-200 p-3">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          min="1"
                        />
                      </td>
                      <td className="border border-gray-200 p-3">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="border border-gray-200 p-3 text-right">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="border border-gray-200 p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Rate and Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate * 100}
                onChange={(e) =>
                  setTaxRate(Number.parseFloat(e.target.value) / 100 || 0)
                }
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">
                  ${(subtotal * taxRate).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGeneratePdf}
            className="w-full"
            disabled={isGeneratingPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? "Generating PDF..." : "Print Invoice"}
          </Button>
        </CardFooter>
      </Card>

      {/* Hidden PDF version */}
      <div className="hidden">
        <div
          ref={invoiceRef}
          style={{
            padding: "40px",
            maxWidth: "800px",
            fontFamily: "Arial, sans-serif",
            position: "relative",
            background: "white",
          }}
        >
          {/* Watermark */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              height: "400px",
              backgroundImage: "url('/assets/am-logo.svg')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              opacity: 0.1,
              zIndex: -1,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <img
              src="/assets/am-logo.svg"
              alt="Company Logo"
              style={{ height: "60px", width: "auto" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h1
              style={{
                fontSize: "2em",
                borderBottom: "2px solid #333",
                paddingBottom: "10px",
                margin: "0",
              }}
            >
              INVOICE
            </h1>
          </div>
          <p>
            <strong>Invoice #: </strong>
            {invoiceNumber}
          </p>
          <p>
            <strong>Invoice Date: </strong>
            {invoiceDate}
          </p>
          <p>
            <strong>Due Date: </strong>
            {dueDate}
          </p>
          <hr style={{ margin: "20px 0" }} />
          <p>
            <strong>Bill To:</strong>
          </p>
          <p>{clientName}</p>
          <p>{clientAddress}</p>
          <hr style={{ margin: "20px 0" }} />
          <p>
            <strong>Project:</strong> {projectName}
          </p>
          <p>
            <strong>Services Period:</strong> {servicesPeriod}
          </p>
          <p>
            <strong>Payment Terms:</strong> {paymentTerms}
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Description
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Quantity
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Rate
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.description}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <p>
              <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
            </p>
            <p>
              <strong>Tax ({(taxRate * 100).toFixed(1)}%):</strong> $
              {(subtotal * taxRate).toFixed(2)}
            </p>
            <p style={{ fontSize: "1.2em", fontWeight: "bold" }}>
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
          </div>
          <p style={{ marginTop: "40px", textAlign: "center", color: "#666" }}>
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
}
