"use client";
import { useEffect, useState, useRef } from "react";
import { getDrivers, getLoads } from "../../../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InvoiceCreatePage() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [loads, setLoads] = useState([]);
  const [percentage, setPercentage] = useState("");
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const invoiceRef = useRef(null);

  useEffect(() => {
    async function fetchDrivers() {
      setLoading(true);
      try {
        setDrivers(await getDrivers());
        setError("");
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (!selectedDriver) {
      setPercentage("");
      return;
    }
    const driver = drivers.find(d => d.id == selectedDriver);
    setPercentage(driver?.percentage || "");
  }, [selectedDriver, drivers]);

  useEffect(() => {
    async function fetchLoads() {
      if (!selectedDriver) {
        setLoads([]);
        setSelectedLoads([]);
        return;
      }
      setLoading(true);
      try {
        const allLoads = await getLoads();
        const filtered = allLoads.filter(l => l.driverName == selectedDriver && l.loadStatus == "delivered" && l.payment_status == "unpaid");
        setLoads(filtered);
        setSelectedLoads(filtered.map(l => l.id)); // select all by default
        setError("");
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchLoads();
  }, [selectedDriver]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  // Only use selected loads for calculations and invoice
  const selectedLoadsData = loads.filter(l => selectedLoads.includes(l.id));
  const grossLoadTotal = selectedLoadsData.reduce((sum, l) => sum + (parseFloat(l.loadAmount) || 0), 0);
  const commissionRate = parseFloat(percentage) || 0;
  const commissionAmount = grossLoadTotal * (commissionRate / 100);
  const finalNetPay = grossLoadTotal - commissionAmount;

  // PDF Generation
  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;
    // Save original styles
    const originalColor = element.style.color;
    const originalBg = element.style.backgroundColor;
    // Set supported colors for html2canvas
    element.style.color = '#222';
    element.style.backgroundColor = '#fff';
    // Render PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    // Restore original styles
    element.style.color = originalColor;
    element.style.backgroundColor = originalBg;
    const driverName = drivers.find(d => d.id == selectedDriver)?.name || "Invoice";
    pdf.save(`${driverName}_Settlement.pdf`);
  };

  const driver = drivers.find(d => d.id == selectedDriver);

  return (
    <div className="p-4 md:p-8 flex flex-col items-center">
      {/* Action Bar */}
      <div className="print-hidden w-full max-w-4xl mb-6 flex justify-end">
        <button onClick={handleDownloadPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-300">
          Download PDF
        </button>
      </div>
      {/* Driver Selection & Percentage */}
      <div className="max-w-4xl w-full mt-8">
        <div className="mb-6">
          <label htmlFor="driver" className="block mb-1 font-medium">Select Driver</label>
          <select id="driver" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option value="">Choose a driver</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="percentage" className="block mb-1 font-medium">Commission Percentage</label>
          <input id="percentage" type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
      </div>
      {/* Loads Selection Table */}
      <div className="max-w-4xl w-full mb-8">
        <h2 className="text-lg font-bold mb-2">Select Loads for Invoice</h2>
        <table className="min-w-full divide-y divide-gray-200 text-blue-900">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3"></th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin/Dest.</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/mile</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pay</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {loads.map(load => {
              const miles = parseFloat(load.miles) || 0;
              const amt = parseFloat(load.loadAmount) || 0;
              const ratePerMile = miles > 0 ? (amt / miles).toFixed(2) : "-";
              const from = (load.loadFrom || "-").split(" ").slice(0, 6).join(" ");
              const to = (load.loadTo || "-").split(" ").slice(0, 6).join(" ");
              return (
                <tr key={load.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={selectedLoads.includes(load.id)} onChange={() => {
                      if (selectedLoads.includes(load.id)) {
                        setSelectedLoads(selectedLoads.filter(lid => lid !== load.id));
                      } else {
                        setSelectedLoads([...selectedLoads, load.id]);
                      }
                    }} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(load.dateTime)}</td>
                  <td className="px-3 py-2 font-medium text-indigo-600 whitespace-nowrap">{load.loadNumber || load.loadId}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{`${from} to ${to}`}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{miles || "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500">{ratePerMile}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-right font-medium">{formatCurrency(amt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!loading && loads.length === 0) && (
          <div className="text-gray-500 mt-2">No delivered & unpaid loads for this driver.</div>
        )}
      </div>
      {/* Invoice Container */}
      <div ref={invoiceRef} className="invoice-container bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-100">
        {/* ...existing code for invoice, but use selectedLoadsData instead of loads... */}
        <header className="flex justify-between items-start mb-10 border-b pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">DRIVER SETTLEMENT</h1>
            <p className="text-lg text-indigo-600 font-semibold mt-1">Settlement ID: DRV-{selectedDriver || "00000"}</p>
            <p className="text-sm text-gray-500 mt-1">Issue Date: {formatDate(new Date())}</p>
            <p className="text-sm text-gray-500">Pay Period: {formatDate(new Date())} to {formatDate(new Date())}</p>
          </div>
          <div className="text-right">
            <img src="/next.svg" alt="Company Logo" className="h-12 w-auto mb-2 ml-auto rounded-md" />
            <p className="text-xl font-bold text-gray-700">Drive Now Logistics</p>
            <p className="text-sm text-gray-500">123 Main St, City, State</p>
            <p className="text-sm text-gray-500">(555) 123-4567 | info@drivenow.com</p>
          </div>
        </header>
        {/* Payee & Company Account Information */}
        <section className="mb-10 bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
          <h2 className="text-lg font-bold text-indigo-800 mb-4">SETTLEMENT DETAILS</h2>
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-700">
            {/* Driver Info */}
            <div>
              <h3 className="text-base font-bold text-indigo-700 mb-2">Driver Information</h3>
              <div className="mb-2"><span className="font-semibold">Driver Name:</span> <span className="text-gray-900">{driver?.name || "N/A"}</span></div>
              <div className="mb-2"><span className="font-semibold">MC Number:</span> <span>{driver?.MC_number || "N/A"}</span></div>
              <div className="mb-2"><span className="font-semibold">Contact Number:</span> <span>{driver?.contactNumber || "N/A"}</span></div>
              <div className="mb-2"><span className="font-semibold">Email:</span> <span>{driver?.email || "N/A"}</span></div>
            </div>
            {/* Company Account Info */}
            <div>
              <h3 className="text-base font-bold text-indigo-700 mb-2">Drive Now Logistics Account</h3>
              <div className="mb-2"><span className="font-semibold">Bank Name:</span> <span className="font-mono">Global Transport Bank</span></div>
              <div className="mb-2"><span className="font-semibold">Account Holder:</span> <span className="font-mono">Drive Now Logistics</span></div>
              <div className="mb-2"><span className="font-semibold">Account Number:</span> <span className="text-lg font-extrabold text-indigo-700">9876543210</span></div>
              <div className="mb-2"><span className="font-semibold">Contact:</span> <span className="font-mono">(555) 123-4567 | info@drivenow.com</span></div>
            </div>
          </div>
        {/* Settlement Summary Section */}
        <section className="mb-10 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">Settlement Summary</h2>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
            <div><span className="font-semibold">Gross Income:</span> <span>{formatCurrency(grossLoadTotal)}</span></div>
            <div><span className="font-semibold">Dispatch Service Fee (%):</span> <span>{commissionRate}%</span></div>
            <div><span className="font-semibold">Due Amount:</span> <span>{formatCurrency(commissionAmount)}</span></div>
          </div>
        </section>
        </section>
        {/* I. Load Service Breakdown (Table) */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">I. LOAD SERVICE BREAKDOWN (GROSS PAY)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-blue-900">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin/Dest.</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miles</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/mile</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pay</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {selectedLoadsData.map(load => {
                  const miles = parseFloat(load.miles) || 0;
                  const amt = parseFloat(load.loadAmount) || 0;
                  const ratePerMile = miles > 0 ? (amt / miles).toFixed(2) : "-";
                  return (
                    <tr key={load.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(load.dateTime)}</td>
                      <td className="px-3 py-2 font-medium text-indigo-600 whitespace-nowrap">{load.loadNumber || load.loadId}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{
                        (() => {
                          const from = (load.loadFrom || "-").split(" ").slice(0, 6).join(" ");
                          const to = (load.loadTo || "-").split(" ").slice(0, 6).join(" ");
                          return `${from} to ${to}`;
                        })()
                      }</td>
                      <td className="px-3 py-2 whitespace-nowrap">{miles || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{ratePerMile}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-medium">{formatCurrency(amt)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan={5}></td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-gray-700" colSpan={2}>
                    TOTAL GROSS LOAD PAY: {formatCurrency(grossLoadTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
            {!loading && selectedLoadsData.length === 0 && <div className="text-gray-500 mt-2">No loads selected for invoice.</div>}
          </div>
        </section>
        {/* II. Commission and Fees */}
        <section className="mb-10 p-6 bg-red-50 rounded-lg border-l-4 border-red-600">
          <h2 className="text-xl font-bold text-red-700 mb-4 border-b pb-2">II. COMMISSION AND FEES</h2>
          <div className="flex justify-between text-lg mb-2">
            <span className="font-medium text-gray-800">Gross Pay Subject to Commission:</span>
            <span className="font-semibold text-gray-800">{formatCurrency(grossLoadTotal)}</span>
          </div>
          <div className="flex justify-between text-xl font-extrabold mb-4">
            <span className="font-medium text-red-700">Commission Rate ({commissionRate}%):</span>
            <span className="font-extrabold text-red-700">{formatCurrency(commissionAmount)}</span>
          </div>
        </section>
        {/* III. Payment Instructions for Commission */}
        <section className="mb-10 p-6 bg-gray-50 rounded-lg border-l-4 border-gray-400">
          <h2 className="text-xl font-bold text-gray-700 mb-3 border-b pb-2">III. PAYMENT INSTRUCTIONS</h2>
          <p className="text-sm text-gray-600 mb-3">Please remit the dispatch service fee directly to the company account above within 24 hours.</p>
        </section>
        {/* Only show NET PAY DUE TO DRIVER as dispatch service fee */}
        <section className="bg-indigo-700 text-white p-6 rounded-lg shadow-xl">
          <div className="flex justify-between text-3xl font-extrabold">
            <span> DUE BALANCE</span>
            <span>{formatCurrency(commissionAmount)}</span>
          </div>
        </section>
        {/* Footer Notes */}
        <footer className="mt-8 text-sm text-gray-600 border-t pt-4">
          <p className="font-semibold">Terms & Notes:</p>
          <p>1. This settlement is based on a dispatch service fee of <span>{commissionRate}%</span> of the total gross income.</p>
          <p>2. Payment will be processed via <span>{driver?.paymentMethod || "Direct Deposit"}</span> within 24 hours.</p>
          <p>3. Drive Now Logistics provides dispatch services to truck owners and drivers. The fee is a fixed percentage of gross income as agreed.</p>
          <p className="mt-4 text-center text-gray-500">Thank you for your reliable service this period!</p>
        </footer>
        {error && <div className="text-red-600 mb-2">{error}</div>}
      </div>
    </div>
  );
}
