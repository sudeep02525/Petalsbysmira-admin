"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { Search, Building2, Mail, Phone, Calendar, DollarSign, Layers } from "lucide-react";
import dayjs from "dayjs";

export default function CorporateEnquiriesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["corporate-enquiries"],
    queryFn: async () => {
      const res = await axiosInstance.get("/corporate-enquiries");
      return res.data;
    },
  });

  const rawEnquiries = data?.enquiries || [];
  const enquiries = rawEnquiries.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.companyName?.toLowerCase().includes(q) ||
      item.contactName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.budget?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[var(--color-gold)]" /> Corporate Gifting Enquiries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bespoke and volume gifting requests submitted from the atelier portal.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, contact, email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-sm bg-white dark:bg-[#0a0a0a] focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white dark:text-white transition-all shadow-sm"
            />
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Total Leads: {enquiries.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-black dark:text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Budget Range</th>
                <th className="px-6 py-4 font-medium">Client Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading corporate enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No corporate enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {dayjs(enq.createdAt).format("MMM DD, YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {enq.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{enq.contactName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {enq.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {enq.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                      {enq.quantity} units
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                        {enq.budget}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 italic">
                        &ldquo;{enq.message}&rdquo;
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

