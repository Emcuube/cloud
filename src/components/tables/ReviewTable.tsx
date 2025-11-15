import { useEffect, useState } from "react";
import { esSearch } from "../../api/esClient";

const POLL_INTERVAL_MS = 15000;
const MAX_VISIBLE_ROWS = 10;
const ROW_HEIGHT_PX = 56;

export default function ReviewTable() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await esSearch({
          size: 50,
          sort: [{ timestamp: { order: "desc" } }],
          query: { match_all: {} },
        });

        const docs = res?.hits?.hits?.map((hit: any) => hit._source) || [];
        if (!mounted) return;
        setRows(docs);
      } catch (err) {
        // ignore and keep previous rows
      }
    };

    // initial small delay to avoid colliding with other startup requests
    const initial = setTimeout(() => fetchData(), 300);
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);

    const onIndexed = () => fetchData();
    window.addEventListener('reviewIndexed', onIndexed as EventListener);

    return () => {
      mounted = false;
      clearTimeout(initial);
      clearInterval(interval);
      window.removeEventListener('reviewIndexed', onIndexed as EventListener);
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Latest Reviews</h2>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: `${MAX_VISIBLE_ROWS * ROW_HEIGHT_PX}px` }}
      >
        <table className="w-full table-auto text-left">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b">
              <th className="p-2">Rating</th>
              <th className="p-2">Review</th>
              <th className="p-2">Department</th>
              <th className="p-2">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{r.rating}</td>
                <td className="p-2">{(r.review || '').substring(0, 60)}...</td>
                <td className="p-2">{r.department}</td>
                <td className="p-2">{r.sentiment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
