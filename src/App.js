import React, { useState } from "react";
import "./index.css";

function App() {
  const [signal, setSignal] = useState(null);
  const [history, setHistory] = useState([]);
  const [symbol, setSymbol] = useState("Boom 1000");
  const [loading, setLoading] = useState(false);

  const symbols = [
    "Boom 1000",
    "Boom 500",
    "Crash 1000",
    "Crash 500",
    "Volatility 75 Index",
    "Volatility 100 Index"
  ];

  const fetchSignal = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://forex-chart-analyzer-1.onrender.com/generate-signal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol,
          price: 2032
        }),
      });

      const data = await response.json();
      const newSignal = data.signal;

      if (newSignal) {
        setSignal(newSignal);
        setHistory((prev) => [newSignal, ...prev.slice(0, 4)]); // keep max 5
      } else {
        setSignal(null);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setSignal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4 flex items-center gap-2">
        📊 AI Forex Signal Dashboard
      </h1>

      {/* Symbol Selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Symbol:</label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="p-2 rounded border bg-white"
        >
          {symbols.map((sym) => (
            <option key={sym} value={sym}>
              {sym}
            </option>
          ))}
        </select>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchSignal}
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        🔄 Refresh Signal
      </button>

      {/* Current Signal */}
      {loading && <p className="text-gray-500">Fetching signal...</p>}

      {signal && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">📍 Current Signal</h2>
          <SignalCard signal={signal} />
        </div>
      )}

      {/* Signal History */}
      {history.length > 1 && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">🕘 Recent Signals</h2>
          <div className="space-y-4">
            {history.slice(1).map((sig, index) => (
              <SignalCard key={index} signal={sig} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Simple card component to display a signal
function SignalCard({ signal }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-sm">
      <p><strong>Symbol:</strong> {signal.symbol}</p>
      <p><strong>HTF:</strong> {signal.timeframe_htf}</p>
      <p><strong>LTF:</strong> {signal.timeframe_ltf}</p>
      <p><strong>Direction:</strong> {signal.direction}</p>
      <p><strong>Order Type:</strong> {signal.order_type}</p>
      <p><strong>Entry:</strong> {signal.entry}</p>
      <p><strong>SL:</strong> {signal.sl}</p>
      <p><strong>TP:</strong> {signal.tp}</p>
      <p><strong>Confidence:</strong> {signal.confidence}%</p>
    </div>
  );
}

export default App;
