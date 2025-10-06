// Utility functions for API calls to the Express.js backend
const API_BASE = 'http://localhost:5000/api';

export async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Users
export const getUsers = () => fetchAPI('/users');
export const getUser = (id) => fetchAPI(`/users/${id}`);
export const createUser = (data) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) => fetchAPI(`/users/${id}`, { method: 'DELETE' });

// Loads
export const getLoads = () => fetchAPI('/loads');
export const getLoad = (id) => fetchAPI(`/loads/${id}`);
export const createLoad = (data) => fetchAPI('/loads', { method: 'POST', body: JSON.stringify(data) });
export const updateLoad = (id, data) => fetchAPI(`/loads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLoad = (id) => fetchAPI(`/loads/${id}`, { method: 'DELETE' });

// Drivers
export const getDrivers = () => fetchAPI('/drivers');
export const getDriver = (id) => fetchAPI(`/drivers/${id}`);
export const createDriver = (data) => fetchAPI('/drivers', { method: 'POST', body: JSON.stringify(data) });
export const updateDriver = (id, data) => fetchAPI(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDriver = (id) => fetchAPI(`/drivers/${id}`, { method: 'DELETE' });

// Assignments
export const getAssignments = () => fetchAPI('/assignments');
export const getDriversForDispatcher = (dispatcherId) => fetchAPI(`/assignments/drivers/${dispatcherId}`);
export const getDispatchersForDriver = (driverId) => fetchAPI(`/assignments/dispatchers/${driverId}`);
export const createAssignment = (data) => fetchAPI('/assignments', { method: 'POST', body: JSON.stringify(data) });
export const deleteAssignment = (data) => fetchAPI('/assignments', { method: 'DELETE', body: JSON.stringify(data) });
