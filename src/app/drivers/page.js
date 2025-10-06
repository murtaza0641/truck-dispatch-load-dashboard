"use client";
import { useEffect, useState } from "react";
import { getDrivers, createDriver, updateDriver, deleteDriver } from "../../utils/api";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    MC_number: "",
    truckType: "",
    contactNumber: "",
    email: "",
    joinDate: "",
    sales_agent_id: "",
    percentage: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      setDrivers(await getDrivers());
      setError("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDriver(editingId, form);
      } else {
        await createDriver(form);
      }
      setForm({
        name: "",
        MC_number: "",
        truckType: "",
        contactNumber: "",
        email: "",
        joinDate: "",
        sales_agent_id: "",
        percentage: ""
      });
      setEditingId(null);
      fetchDrivers();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleEdit = driver => {
    setForm({
      name: driver.name || "",
      MC_number: driver.MC_number || "",
      truckType: driver.truckType || "",
      contactNumber: driver.contactNumber || "",
      email: driver.email || "",
      joinDate: driver.joinDate || "",
      sales_agent_id: driver.sales_agent_id || "",
      percentage: driver.percentage || ""
    });
    setEditingId(driver.id);
  };

  const handleDelete = async id => {
    if (!confirm("Delete this driver?")) return;
    setLoading(true);
    try {
      await deleteDriver(id);
      fetchDrivers();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-blue-900 mb-6 tracking-tight">Drivers</h1>
        <form onSubmit={handleSubmit} className="grid text-blue-900 grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" required />
          </div>
          <div>
            <label htmlFor="MC_number" className="block mb-1 font-medium">MC Number</label>
            <input id="MC_number" name="MC_number" value={form.MC_number} onChange={handleChange} placeholder="MC Number" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" required />
          </div>
          <div>
            <label htmlFor="truckType" className="block mb-1 font-medium">Truck Type</label>
            <input id="truckType" name="truckType" value={form.truckType} onChange={handleChange} placeholder="Truck Type" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" required />
          </div>
          <div>
            <label htmlFor="contactNumber" className="block mb-1 font-medium">Contact Number</label>
            <input id="contactNumber" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" required />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <input id="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" required />
          </div>
          <div>
            <label htmlFor="joinDate" className="block mb-1 font-medium">Join Date</label>
            <input id="joinDate" name="joinDate" value={form.joinDate} onChange={handleChange} placeholder="Join Date" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" type="date" required />
          </div>
          <div>
            <label htmlFor="sales_agent_id" className="block mb-1 font-medium">Sales Agent ID</label>
            <input id="sales_agent_id" name="sales_agent_id" value={form.sales_agent_id} onChange={handleChange} placeholder="Sales Agent ID" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" />
          </div>
          <div>
            <label htmlFor="percentage" className="block mb-1 font-medium">Percentage</label>
            <input id="percentage" name="percentage" value={form.percentage} onChange={handleChange} placeholder="Percentage" className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" />
          </div>
          <div className="flex gap-2 mt-2 md:col-span-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-60" disabled={loading}>
              {editingId ? "Update" : "Add"} Driver
            </button>
            {editingId && (
              <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition" onClick={() => { setForm({ name: "", MC_number: "", truckType: "", contactNumber: "", email: "", joinDate: "" }); setEditingId(null); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <div className="text-red-600 mb-2 text-sm font-medium">{error}</div>}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MC #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Truck Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales Agent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-blue-50 transition text-black">
                  <td className="px-4 py-2 whitespace-nowrap">{driver.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.MC_number}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.truckType}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.contactNumber}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.joinDate}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.sales_agent_id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{driver.percentage}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded shadow-sm transition" onClick={() => handleEdit(driver)}>Edit</button>
                    <button className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1 rounded shadow-sm transition" onClick={() => handleDelete(driver.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
