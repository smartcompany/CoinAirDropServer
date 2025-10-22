'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Airdrop {
  id: string;
  exchange: string;
  token: string | null;
  title: string;
  risk_score: number;
  verified: boolean;
  post_date: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
  });
  const [filter, setFilter] = useState({
    exchange: '',
    verified: '',
  });

  useEffect(() => {
    fetchAirdrops();
  }, [filter]);

  const fetchAirdrops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.exchange) params.append('exchange', filter.exchange);
      if (filter.verified) params.append('verified', filter.verified);
      
      const response = await fetch(`/api/airdrops?${params.toString()}`);
      const result = await response.json();
      
      setAirdrops(result.data || []);
      
      // Calculate stats
      const total = result.pagination?.total || 0;
      const verified = result.data?.filter((a: Airdrop) => a.verified).length || 0;
      setStats({
        total,
        verified,
        pending: total - verified,
      });
    } catch (error) {
      console.error('Error fetching airdrops:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCrawler = async () => {
    if (!confirm('Run crawler now? This may take a few minutes.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/crawler/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });
      
      const result = await response.json();
      alert(`Crawler completed!\nFound: ${result.result?.total || 0}\nSaved: ${result.result?.saved || 0}`);
      fetchAirdrops();
    } catch (error) {
      console.error('Error running crawler:', error);
      alert('Failed to run crawler');
    }
  };

  const updateAirdrop = async (id: string, updates: Partial<Airdrop>) => {
    try {
      const response = await fetch(`/api/airdrops/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        fetchAirdrops();
      }
    } catch (error) {
      console.error('Error updating airdrop:', error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'bg-green-100 text-green-800';
    if (score <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">🎯 Airdrop Radar Admin</h1>
            </Link>
            <button
              onClick={runCrawler}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Run Crawler
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Total Airdrops</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Verified</div>
            <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange
              </label>
              <select
                value={filter.exchange}
                onChange={(e) => setFilter({ ...filter, exchange: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All Exchanges</option>
                <option value="binance">Binance</option>
                <option value="bybit">Bybit</option>
                <option value="upbit">Upbit</option>
                <option value="bithumb">Bithumb</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <select
                value={filter.verified}
                onChange={(e) => setFilter({ ...filter, verified: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Airdrops List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Airdrops</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : airdrops.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No airdrops found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exchange</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {airdrops.map((airdrop) => (
                    <tr key={airdrop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 uppercase">
                          {airdrop.exchange}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {airdrop.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {airdrop.token || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(airdrop.risk_score)}`}>
                          {airdrop.risk_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          airdrop.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {airdrop.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(airdrop.post_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!airdrop.verified && (
                          <button
                            onClick={() => updateAirdrop(airdrop.id, { verified: true })}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            ✓ Verify
                          </button>
                        )}
                        <a
                          href={`/admin/airdrops/${airdrop.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

