"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoads, getDrivers, getUsers } from "../../utils/api";

export default function LoadManagementDashboard() {
	const router = useRouter();
	const [loads, setLoads] = useState([]);
	const [drivers, setDrivers] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Dashboard controls
	const [search, setSearch] = useState("");
	const [filterDriver, setFilterDriver] = useState("");
	const [filterDispatcher, setFilterDispatcher] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
		const [sortBy, setSortBy] = useState("pickup");
		const [sortOrder, setSortOrder] = useState("asc");
	const [filterPaymentStatus, setFilterPaymentStatus] = useState("");

	useEffect(() => {
		async function fetchAll() {
			try {
				setLoads(await getLoads());
				setDrivers(await getDrivers());
				setUsers(await getUsers());
				setError("");
			} catch (e) {
				setError(e.message);
			}
			setLoading(false);
		}
		fetchAll();
	}, []);

	// Filter, search, and sort loads
	const displayedLoads = loads
		.filter(load => {
            
			// if (filterDriver && load.driverName !== filterDriver) return false;

			if (filterDriver && load.driverName != filterDriver) return false;
			if (filterDispatcher && load.dispatcherId != filterDispatcher) return false;
			if (filterPaymentStatus && load.payment_status !== filterPaymentStatus) return false;
			if (filterStatus && load.loadStatus !== filterStatus) return false;

			return true;
		})
		.filter(load => {
			if (!search.trim()) return true;
			const searchLower = search.toLowerCase();
			return Object.values(load).some(val =>
				val && val.toString().toLowerCase().includes(searchLower)
			);
		})
			.sort((a, b) => {
				let result = 0;
				if (sortBy === "pickup") {
					result = new Date(a.pickedUp_dateTime) - new Date(b.pickedUp_dateTime);
				} else if (sortBy === "dropoff") {
					result = new Date(a.dropOff_dateTime) - new Date(b.dropOff_dateTime);
				} else if (sortBy === "id") {
					result = (a.id || 0) - (b.id || 0);
				}
				return sortOrder === "asc" ? result : -result;
			});

	if (loading) return <div className="p-8">Loading...</div>;
	if (error) return <div className="p-8 text-red-600">{error}</div>;

	return (
		<div className="max-w-7xl mx-auto px-2 sm:px-4">
			<div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-2">
				<h1 className="text-2xl font-semibold text-blue-900 mb-6 tracking-tight">Load Management Dashboard</h1>
				<div className="mb-6 grid grid-cols-1 text-blue-900 md:grid-cols-6 gap-4 items-end">
					<div className="md:col-span-7 flex justify-end">
						<a href="/invoice/create" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">Create Invoice</a>
					</div>
					<div className="md:col-span-2">
						<label htmlFor="search" className="block mb-1 font-medium">Search Loads</label>
						<input id="search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all fields..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
					</div>
					<div>
						<label htmlFor="filterDriver" className="block mb-1 font-medium">Driver</label>
						<select id="filterDriver" value={filterDriver} onChange={e => setFilterDriver(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
							<option value="">All Drivers</option>
							{drivers.map(d => (
								<option key={d.id} value={d.id}>{d.name}</option>
							))}
                            {console.log(filterDriver)}
						</select>
					</div>
					<div>
						<label htmlFor="filterDispatcher" className="block mb-1 font-medium">Dispatcher</label>
						<select id="filterDispatcher" value={filterDispatcher} onChange={e => setFilterDispatcher(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
							<option value="">All Dispatchers</option>
							{users.map(u => (
								<option key={u.id} value={u.id}>{u.name}</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="filterStatus" className="block mb-1 font-medium">Status</label>
						<select id="filterStatus" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
							<option value="">All Statuses</option>
							<option value="booked">Booked</option>
							<option value="pickedUp">Picked Up</option>
							<option value="delivered">Delivered</option>
							<option value="canceled">Canceled</option>
						</select>
					</div>
					<div>
						<label htmlFor="filterPaymentStatus" className="block mb-1 font-medium">Payment Status</label>
						<select id="filterPaymentStatus" value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
							<option value="">All Payment Status</option>
							<option value="unpaid">Unpaid</option>
							<option value="invoiced">Invoiced</option>
							<option value="paid">Paid</option>
						</select>
					</div>
								<div>
									<label htmlFor="sortBy" className="block mb-1 font-medium">Sort By</label>
									<select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
										<option value="pickup">Pickup Date</option>
										<option value="dropoff">Delivery Date</option>
										<option value="id">Load ID</option>
									</select>
								</div>
								<div className="flex flex-col justify-end">
									<button
										type="button"
										onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-blue-50 hover:bg-blue-100 font-medium text-blue-700 transition"
									>
										{sortOrder === "asc" ? "Ascending" : "Descending"}
									</button>
								</div>
				</div>
				<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">&nbsp;</th>
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
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">% </th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Status</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
								<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-100">
							{displayedLoads.map(load => {
								let pickedUpDate = new Date(load.pickedUp_dateTime).toLocaleString();
								let dropOffDate = new Date(load.dropOff_dateTime).toLocaleString();
								let dateTime = new Date(load.dateTime).toLocaleString();
								let dotColor = "bg-gray-300";
								if (load.payment_status === "unpaid") dotColor = "bg-red-500";
								else if (load.payment_status === "invoiced") dotColor = "bg-blue-500";
								else if (load.payment_status === "paid") dotColor = "bg-green-500";
								return (
									<tr key={load.id} className="hover:bg-blue-50 transition text-black cursor-pointer" onClick={() => router.push(`/load_managment/${load.id}`)}>
										<td className="px-2 py-2 whitespace-nowrap">
											<span className={`inline-block w-3 h-3 rounded-full mr-2 align-middle ${dotColor}`}></span>
										</td>
										<td className="px-4 py-2 whitespace-nowrap">{pickedUpDate}</td>
										<td className="px-4 py-2 whitespace-nowrap">{dropOffDate}</td>
										<td className="px-4 py-2 whitespace-nowrap">{drivers.find(d => d.id === load.driverName)?.name || load.driverName}</td>
										<td className="px-4 py-2 whitespace-nowrap">{users.find(u => u.id === load.dispatcherId)?.name || load.dispatcherId}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.loadFrom}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.loadTo}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.brokerCompany}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.brokerMC}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.brokerName}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.loadNumber}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.loadAmount}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.loadPercentage}</td>
															<td className="px-4 py-2 whitespace-nowrap">{
																Number(load.loadAmount) && Number(load.loadPercentage)
																	? (Number(load.loadAmount) * Number(load.loadPercentage) / 100).toFixed(2)
																	: "0.00"
															}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.loadStatus}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.payment_status}</td>
										<td className="px-4 py-2 whitespace-nowrap">{load.invoice_number}</td>
										<td className="px-4 py-2 whitespace-nowrap">{dateTime}</td>
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
