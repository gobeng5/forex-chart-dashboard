import React, { useEffect, useRef, useState } from "react";

function App() {
  const wsRef = useRef(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3");

    ws.onopen = () => {
      console.log("🟢 Connected to Deriv. Subscribing to R_75...");
      ws.send(JSON.stringify({ ticks: "R_75", subscribe: 1 }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("📡 Tick received:", data);
      if (data.tick?.quote) {
        setPrice(data.tick.quote);
      }
    };

    ws.onerror = (e) => console.error("❌ WebSocket error", e);
    ws.onclose = () => console.warn("⚠️ WebSocket closed");

    wsRef.current = ws;
    return () => ws.close();
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-blue-600">Deriv Tick Test</h1>
      {price ? (
        <p className="text-lg mt-4 text-green-600">Live Price: {price}</p>
      ) : (
        <p className="text-lg mt-4 text-red-600">Waiting for price...</p>
      )}
    </div>
  );
}

export default App;
