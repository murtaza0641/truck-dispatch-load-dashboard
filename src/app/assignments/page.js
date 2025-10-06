"use client";
import { useEffect, useState } from "react";
import {
  getAssignments,
  getDrivers,
  getUsers,
  createAssignment,
  deleteAssignment,
} from "../../utils/api";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [form, setForm] = useState({ dispatcherId: "", driverId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      setAssignments(await getAssignments());
      setDrivers(await getDrivers());
      setDispatchers(await getUsers());
      setError("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAssignment({ dispatcherId: form.dispatcherId, driverId: form.driverId });
      setForm({ dispatcherId: "", driverId: "" });
      fetchAll();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (dispatcherId, driverId) => {
    if (!confirm("Delete this assignment?")) return;
    setLoading(true);
    try {
      await deleteAssignment({ dispatcherId, driverId });
      fetchAll();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-blue-900 mb-6 tracking-tight">Assignments</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select name="dispatcherId" value={form.dispatcherId} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required>
            <option value="">Select Dispatcher</option>
            {dispatchers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select name="driverId" value={form.driverId} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required>
            <option value="">Select Driver</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2 md:col-span-1">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-60" disabled={loading}>
              Assign
            </button>
          </div>
        </form>
        {error && <div className="text-red-600 mb-2 text-sm font-medium">{error}</div>}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dispatcher</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {assignments.map(a => (
                <tr key={a.dispatcherId + '-' + a.driverId} className="hover:bg-blue-50 transition text-black">
                  <td className="px-4 py-2 whitespace-nowrap">{dispatchers.find(d => d.id === a.dispatcherId)?.name || a.dispatcherId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{drivers.find(d => d.id === a.driverId)?.name || a.driverId}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1 rounded shadow-sm transition" onClick={() => handleDelete(a.dispatcherId, a.driverId)}>Delete</button>
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
