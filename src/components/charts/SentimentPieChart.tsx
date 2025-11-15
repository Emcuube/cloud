import { Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { esSearch } from "../../api/esClient";

const POLL_INTERVAL_MS = 15000;

export default function SentimentPieChart() {
  const [chart, setChart] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await esSearch({
          size: 0,
          aggs: {
            sentiments: {
              terms: { field: "sentiment" },
            },
          },
        });

        const buckets = res?.aggregations?.sentiments?.buckets || [];

        if (!mounted) return;

        setChart({
          labels: buckets.map((b: any) => b.key),
          datasets: [
            {
              data: buckets.map((b: any) => b.doc_count),
              backgroundColor: ["#4CAF50", "#F44336", "#9E9E9E"],
            },
          ],
        });
      } catch (err) {
        // ignore and keep previous data
      }
    };

    const initial = setTimeout(() => fetchData(), 400);
    const interval = setInterval(() => fetchData(), POLL_INTERVAL_MS);

    const onIndexed = () => fetchData();
    window.addEventListener('reviewIndexed', onIndexed as EventListener);

    return () => {
      mounted = false;
      clearTimeout(initial);
      clearInterval(interval);
      window.removeEventListener('reviewIndexed', onIndexed as EventListener);
    };
  }, []);

  if (!chart) return <div>Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl mb-4 font-semibold">Sentiment Breakdown</h2>
      <Pie data={chart} />
    </div>
  );
}
