import React, { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSignal = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://forex-chart-analyzer-1.onrender.com/generate-signal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: "Boom 1000",
          price: 2032
        }),
      });
      const data = await response.json();
      setSignal(data.signal);
    } catch (error) {
      console.error("Error fetching signal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        📈 AI Forex Signal Dashboard
      </h1>

      {loading && <p className="text-gray-500">Fetching signal...</p>}

      {signal ? (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-3 text-gray-700">
          <p><strong>Symbol:</strong> {signal.symbol}</p>
          <p><strong>HTF:</strong> {signal.timeframe_htf}</p>
          <p><strong>LTF:</strong> {signal.timeframe_ltf}</p>
          <p><strong>Direction:</strong> {signal.direction}</p>
          <p><strong>Order Type:</strong> {signal.order_type}</p>
          <p><strong>Entry:</strong> {signal.entry}</p>
          <p><strong>Stop Loss:</strong> {signal.sl}</p>
          <p><strong>Take Profit:</strong> {signal.tp}</p>
          <p><strong>Confidence:</strong> {signal.confidence}%</p>
        </div>
      ) : (
        !loading && <p className="text-red-500">No valid signal returned</p>
      )}
    </div>
  );
}

export default App;
