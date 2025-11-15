import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { esSearch } from "../../api/esClient";

const POLL_INTERVAL_MS = 15000;

export default function RatingBarChart() {
  const [chart, setChart] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await esSearch({
          size: 0,
          aggs: {
            ratings: {
              terms: { field: "rating" },
            },
          },
        });

        const buckets = res?.aggregations?.ratings?.buckets || [];

        if (!mounted) return;

        setChart({
          labels: buckets.map((b: any) => b.key),
          datasets: [
            {
              label: "Count",
              data: buckets.map((b: any) => b.doc_count),
              backgroundColor: "#4A90E2",
            },
          ],
        });
      } catch (err) {
        // ignore error and keep previous chart
      }
    };

    const initial = setTimeout(() => fetchData(), 600);
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
      <h2 className="text-xl mb-4 font-semibold">Rating Distribution</h2>
      <Bar data={chart} />
    </div>
  );
}
