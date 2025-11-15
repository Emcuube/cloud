import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { esSearch } from "../../api/esClient";

const POLL_INTERVAL_MS = 15000; // refresh every 15 seconds (reduce request rate)

export default function SentimentLineChart() {
  const [chart, setChart] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await esSearch({
          size: 0,
          aggs: {
            trends: {
              date_histogram: {
                field: "reviewDateTime",
                calendar_interval: "day",
              },
            },
          },
        });

        const buckets = res?.aggregations?.trends?.buckets || [];

        if (!mounted) return;

        setChart({
          labels: buckets.map((b: any) => b.key_as_string),
          datasets: [
            {
              label: "Sentiment Count",
              data: buckets.map((b: any) => b.doc_count),
              borderColor: "#FF9800",
              backgroundColor: "rgba(255, 152, 0, 0.3)",
              fill: true,
            },
          ],
        });
      } catch (err) {
        // silent catch - keep previous chart if exists
        // optionally: add logging here for debugging
        // console.error('SentimentLineChart fetch error', err);
      }
    };

    // initial small delay so this chart is less likely to collide with other startup requests
    const initialTimer = setTimeout(() => fetchData(), 800);

    const interval = setInterval(() => {
      fetchData();
    }, POLL_INTERVAL_MS);

    // Listen for immediate refresh events from the simulator
    const onIndexed = () => fetchData();
    window.addEventListener('reviewIndexed', onIndexed as EventListener);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('reviewIndexed', onIndexed as EventListener);
    };
  }, []);

  if (!chart) return <div>Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl mb-4 font-semibold">Sentiment Trend Over Time</h2>
      <Line data={chart} />
    </div>
  );
}
