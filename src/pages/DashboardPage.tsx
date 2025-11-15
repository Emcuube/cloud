import SentimentLineChart from "../components/charts/SentimentLineChart";
import RatingBarChart from "../components/charts/RatingBarChart";
import SentimentPieChart from "../components/charts/SentimentPieChart";
import ReviewTable from "../components/tables/ReviewTable";

export default function DashboardPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentLineChart />
        <RatingBarChart />
        <SentimentPieChart />
      </div>

      <div className="mt-10">
        <ReviewTable />
      </div>
    </div>
  );
}
