import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🎯 Airdrop Radar
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Your trusted source for verified cryptocurrency airdrops
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">📱 Mobile App</h2>
              <p className="text-gray-600 mb-6">
                Download our Flutter app to receive instant airdrop notifications
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Coming Soon
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">⚙️ Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Manage airdrops, verify announcements, and view analytics
              </p>
              <Link href="/admin">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
                  Open Dashboard
                </button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">📊 Supported Exchanges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Binance', 'Bybit', 'Upbit', 'Bithumb'].map((exchange) => (
                <div key={exchange} className="bg-gray-50 rounded-lg p-4">
                  <span className="text-lg font-medium text-gray-800">{exchange}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

