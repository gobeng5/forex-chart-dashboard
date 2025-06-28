import React, { useState, useEffect, useRef } from "react";
import "./index.css";

// TradingView chart mapping
const symbolToTVFormat = (symbol) => {
  const map = {
    "Boom 1000": "OANDA:XAUUSD",
    "Boom 500": "OANDA:GBPUSD",
    "Crash 1000": "OANDA:USDJPY",
    "Crash 500": "OANDA:EURUSD",
    "Volatility 75 Index": "BINANCE:BTCUSDT",
    "Volatility 100 Index": "BINANCE:ETHUSDT"
  };
  return map[symbol] || "OANDA:EURUSD";
};

// Deriv price feed mapping
const mapToDerivSymbol = (symbol) => {
  const map = {
    "Boom 1000": "R_100",
    "Boom 500": "R_50",
    "Crash 1000": "R_100",
    "Crash 500": "R_50",
    "Volatility 75 Index": "R_75",
    "Volatility 25 Index": "R_25",
    "Volatility 10 Index": "R_10",
    "Volatility 100 Index": "R_100"
  };
  return map[symbol] || "R_75";
};

function App() {
  const [signal, setSignal] = useState(null);
  const [history, setHistory] = useState([]);
  const [symbol, setSymbol] = useState("Volatility 75 Index");
  const [livePrice, setLivePrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);

  const symbols = [
    "Boom 1000",
    "Boom 500",
    "Crash 1000",
    "Crash 500",
    "Volatility 75 Index",
    "Volatility 25 Index",
    "Volatility 10 Index",
    "Volatility 100 Index"
  ];

  // ✅ Connect to Deriv WebSocket for live price feed
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const derivSymbol = mapToDerivSymbol(symbol);
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3");

    ws.onopen = () => {
      ws.send(JSON.stringify({
        ticks: derivSymbol,
        subscribe: 1
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.tick) {
        setLivePrice(data.tick.quote);
      }
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

  const fetchSignal = async () => {
    if (!livePrice) return;

    setLoading(true);
    try {
      const response = await fetch("https://forex-chart-analyzer-1.onrender.com/generate-signal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol,
          price: livePrice  // 🧠 use exact live price
        }),
      });

      const data = await response.json();

      const newSignal = {
        ...data.signal,
        timestamp: new Date().toLocaleString()
      };

      if (data.signal) {
        setSignal(newSignal);
        setHistory((prev) => [newSignal, ...prev.slice(0, 4)]);
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

      {/* 🔘 Symbol Dropdown */}
      <div className="mb-2">
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

      {/* 📡 Live Price */}
      {livePrice && (
        <p className="text-sm text-gray-600 mb-4">
          🔴 Live Price: <span className="font-mono">{livePrice}</span>
        </p>
      )}

      {/* 🔄 Refresh Button */}
      <button
        onClick={fetchSignal}
        disabled={!livePrice}
        className={`mb-6 px-6 py-2 rounded-lg transition ${
          livePrice
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        🔄 Refresh Signal
      </button>

      {/* 📍 Current Signal */}
      {loading && <p className="text-gray-500">Fetching signal...</p>}

      {signal && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">📍 Current Signal</h2>
          <SignalCard signal={signal} />
        </div>
      )}

      {/* 🕘 Signal History */}
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

// 📦 Signal Card Component
function SignalCard({ signal }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-1">
      <p><strong>Symbol:</strong> {signal.symbol}</p>
      <p><strong>HTF:</strong> {signal.timeframe_htf}</p>
      <p><strong>LTF:</strong> {signal.timeframe_ltf}</p>
      <p><strong>Direction:</strong> {signal.direction}</p>
      <p><strong>Order Type:</strong> {signal.order_type}</p>
      <p><strong>Entry:</strong> {signal.entry}</p>
      <p><strong>SL:</strong> {signal.sl}</p>
      <p><strong>TP:</strong> {signal.tp}</p>
      <p><strong>Confidence:</strong> {signal.confidence}%</p>
      <p><strong>Generated:</strong> {signal.timestamp}</p>

      <div className="mt-4">
        <iframe
          src={`https://www.tradingview.com/widgetembed/?symbol=${symbolToTVFormat(
            signal.symbol
          )}&interval=15&hidesidetoolbar=1&theme=light`}
          width="100%"
          height="300"
          frameBorder="0"
          allowTransparency="true"
          scrolling="no"
          title="Chart Preview"
        ></iframe>
      </div>
    </div>
  );
}

export default App;
