import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur sticky top-0 z-50 shadow-lg rounded-b-2xl mx-auto max-w-7xl mt-2 mb-6 px-4 py-3 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-3">
        <span className="bg-blue-600 rounded-full w-9 h-9 flex items-center justify-center shadow-md">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M7 17l5-8 5 8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <span className="font-semibold text-lg text-blue-900 tracking-wide">Drive Now Logistics</span>
      </div>
      <div className="flex gap-2 md:gap-4">
  <Link href="/users" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">Users</Link>
  <Link href="/loads" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">Loads</Link>
  <Link href="/drivers" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">Drivers</Link>
  <Link href="/assignments" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">Assignments</Link>
  <Link href="/load_managment" className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">Load Management</Link>
      </div>
    </nav>
  );
}
