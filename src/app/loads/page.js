"use client";
import { useEffect, useState } from "react";
import { getLoads, createLoad, updateLoad, deleteLoad, getUsers, getDrivers, getDriversForDispatcher } from "../../utils/api";
import { formatDateTime } from "../../components/formatDateTime";


export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignedDrivers, setAssignedDrivers] = useState([]);

  const [form, setForm] = useState({
    pickedUp_dateTime: "",
    dropOff_dateTime: "",
    driverName: "",
    dispatcherId: "",
    loadFrom: "",
    loadTo: "",
    brokerCompany: "",
    brokerMC: "",
    brokerName: "",
    loadNumber: "",
    loadAmount: "",
    miles: "",
    loadStatus: "booked",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLoads = async () => {
    setLoading(true);
    try {
      setLoads(await getLoads());
      setError("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLoads(); }, []);

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

    const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
      setError("");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = async e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "dispatcherId" && value) {
      try {
        const result = await getDriversForDispatcher(value);
        setAssignedDrivers(result);
      } catch (err) {
        setAssignedDrivers([]);
      }
    } else if (name === "dispatcherId" && !value) {
      setAssignedDrivers([]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateLoad(editingId, form);
      } else {
        await createLoad(form);
      }
      setForm({
        pickedUp_dateTime: "",
        dropOff_dateTime: "",
        driverName: "",
        dispatcherId: "",
        loadFrom: "",
        loadTo: "",
        brokerCompany: "",
        brokerMC: "",
        brokerName: "",
        loadNumber: "",
        loadAmount: "",
        miles: "",
        loadStatus: "booked",
      });
      setEditingId(null);
      fetchLoads();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleEdit = load => {
    console.log(load.pickedUp_dateTime);
    let pickedUp_dateTime=formatDateTime(new Date(load.pickedUp_dateTime));
    let dropOff_dateTime1=formatDateTime(new Date(load.dropOff_dateTime));
    
    setForm({
      pickedUp_dateTime: pickedUp_dateTime || "",
      dropOff_dateTime: dropOff_dateTime1 || "",
      driverName: load.driverName || "",
      dispatcherId: load.dispatcherId || "",
      loadFrom: load.loadFrom || "",
      loadTo: load.loadTo || "",
      brokerCompany: load.brokerCompany || "",
      brokerMC: load.brokerMC || "",
      brokerName: load.brokerName || "",
      loadNumber: load.loadNumber || "",
      loadAmount: load.loadAmount || "",
      miles: load.miles || "",
      loadStatus: load.loadStatus || "booked",
    });
    setEditingId(load.id);
  };

  const handleDelete = async id => {
    if (!confirm("Delete this load?")) return;
    setLoading(true);
    try {
      await deleteLoad(id);
      fetchLoads();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-blue-900 mb-6 tracking-tight">Loads</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <label htmlFor="pickedUp_dateTime" className="mb-1 text-sm font-medium text-gray-700">Pickup Date/Time</label>
            <input id="pickedUp_dateTime" name="pickedUp_dateTime" value={form.pickedUp_dateTime} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" type="datetime-local" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dropOff_dateTime" className="mb-1 text-sm font-medium text-gray-700">Dropoff Date/Time</label>
            <input id="dropOff_dateTime" name="dropOff_dateTime" value={form.dropOff_dateTime} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" type="datetime-local" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dispatcherId" className="mb-1 text-sm font-medium text-gray-700">Dispatcher</label>
            <select id="dispatcherId" name="dispatcherId" value={form.dispatcherId} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required>
              <option value="">Select Dispatcher</option>
              {users.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="driverName" className="mb-1 text-sm font-medium text-gray-700">Driver</label>
            <select id="driverName" name="driverName" value={form.driverName} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required>
              <option value="">Select Driver</option>
              {(form.dispatcherId ? assignedDrivers : drivers).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="loadFrom" className="mb-1 text-sm font-medium text-gray-700">From</label>
            <input id="loadFrom" name="loadFrom" value={form.loadFrom} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="loadTo" className="mb-1 text-sm font-medium text-gray-700">To</label>
            <input id="loadTo" name="loadTo" value={form.loadTo} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="brokerCompany" className="mb-1 text-sm font-medium text-gray-700">Broker Company</label>
            <input id="brokerCompany" name="brokerCompany" value={form.brokerCompany} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="brokerMC" className="mb-1 text-sm font-medium text-gray-700">Broker MC</label>
            <input id="brokerMC" name="brokerMC" value={form.brokerMC} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="brokerName" className="mb-1 text-sm font-medium text-gray-700">Broker Name</label>
            <input id="brokerName" name="brokerName" value={form.brokerName} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="loadNumber" className="mb-1 text-sm font-medium text-gray-700">Load Number</label>
            <input id="loadNumber" name="loadNumber" value={form.loadNumber} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="loadAmount" className="mb-1 text-sm font-medium text-gray-700">Load Amount</label>
            <input id="loadAmount" name="loadAmount" value={form.loadAmount} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required type="number" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="miles" className="mb-1 text-sm font-medium text-gray-700">Miles</label>
            <input id="miles" name="miles" value={form.miles} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required type="number" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="ratePerMile" className="mb-1 text-sm font-medium text-gray-700">Rate / Mile</label>
            <input id="ratePerMile" name="ratePerMile" value={(() => {
              const amt = parseFloat(form.loadAmount) || 0;
              const miles = parseFloat(form.miles) || 0;
              return miles > 0 ? (amt / miles).toFixed(2) : "";
            })()} readOnly className="bg-gray-100 text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none" type="number" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="loadPercentage" className="mb-1 text-sm font-medium text-gray-700">Load %</label>
            <input id="loadPercentage" name="loadPercentage" value={(() => {
              const driver = drivers.find(d => d.id == form.driverName);
              return driver?.percentage || "";
            })()} readOnly className="bg-gray-100 text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none" type="number" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="netAmount" className="mb-1 text-sm font-medium text-gray-700">Net Amount</label>
            <input id="netAmount" name="netAmount" value={(() => {
              const amt = parseFloat(form.loadAmount) || 0;
              const driver = drivers.find(d => d.id == form.driverName);
              const perc = driver?.percentage || 0;
              return amt * perc / 100 ? (amt * perc / 100).toFixed(2) : "";
            })()} readOnly className="bg-gray-100 text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none" type="number" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="loadStatus" className="mb-1 text-sm font-medium text-gray-700">Load Status</label>
            <select id="loadStatus" name="loadStatus" value={form.loadStatus} onChange={handleChange} className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required>
              <option value="booked">Booked</option>
              <option value="pickedUp">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2 md:col-span-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-60" disabled={loading}>
              {editingId ? "Update" : "Add"} Load
            </button>
            {editingId && (
              <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition" onClick={() => { setForm({
                pickedUp_dateTime: "",
                dropOff_dateTime: "",
                driverName: "",
                dispatcherId: "",
                loadFrom: "",
                loadTo: "",
                brokerCompany: "",
                brokerMC: "",
                brokerName: "",
                loadNumber: "",
                loadAmount: "",
                loadPercentage: "",
                netAmount: "",
                loadStatus: "booked",
                dateTime: ""
              }); setEditingId(null); }}>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pickup</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dropoff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dispatcher</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Broker Co</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Broker MC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Broker Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Load #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Miles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate/Mile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">%</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loads.map(load => {
                let pickedUpDate = new Date(load.pickedUp_dateTime).toLocaleString();
                let dropOffDate = new Date(load.dropOff_dateTime).toLocaleString();
                let dateTime = new Date(load.dateTime).toLocaleString();
                return (
                  <tr key={load.id} className="hover:bg-blue-50 transition text-black">
                    <td className="px-4 py-2 whitespace-nowrap">{pickedUpDate}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{dropOffDate}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{drivers.find(d => d.id === load.driverName)?.name || load.driverName}</td>
                    {/* <td className="px-4 py-2 whitespace-nowrap">{load.driverName}</td> */}
                    <td className="px-4 py-2 whitespace-nowrap">{users.find(u => u.id === load.dispatcherId)?.name || load.dispatcherId}</td>
                    {/* <td className="px-4 py-2 whitespace-nowrap">{load.dispatcherId}</td> */}
                  <td className="px-4 py-2 whitespace-nowrap">{load.loadFrom}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.loadTo}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.brokerCompany}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.brokerMC}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.brokerName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.loadNumber}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.loadAmount}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{load.miles}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{(() => {
                    const amt = parseFloat(load.loadAmount) || 0;
                    const miles = parseFloat(load.miles) || 0;
                    return miles > 0 ? (amt / miles).toFixed(2) : "";
                  })()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{(() => {
                    const driver = drivers.find(d => d.id == load.driverName);
                    return driver?.percentage || "";
                  })()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{(() => {
                    const amt = parseFloat(load.loadAmount) || 0;
                    const driver = drivers.find(d => d.id == load.driverName);
                    const perc = driver?.percentage || 0;
                    return amt * perc / 100 ? (amt * perc / 100).toFixed(2) : "";
                  })()}</td>
                  {/* <td className="px-4 py-2 whitespace-nowrap">{load.netAmount}</td> */}
                  <td className="px-4 py-2 whitespace-nowrap">{load.loadStatus}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{dateTime}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded shadow-sm transition" onClick={() => handleEdit(load)}>Edit</button>
                    <button className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1 rounded shadow-sm transition" onClick={() => handleDelete(load.id)}>Delete</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
