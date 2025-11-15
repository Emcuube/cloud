import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';

interface Review {
  reviewId: string;
  reviewDateTime: string;
  timestamp: number;
  clothingId: string;
  age: number;
  title: string;
  review: string;
  rating: number;
  recommended: boolean;
  division: string;
  department: string;
  class: string;
}

const API_URL = import.meta.env.VITE_REVIEWS_API_URL;

const formatDate = (isoDate: string) => {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleString();
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'rating' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 75 }),
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách review từ DynamoDB');
      }

      const data = await response.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const tableRows = useMemo(() => {
    const sorted = [...reviews];

    if (sortField && sortDir) {
      sorted.sort((a, b) => {
        const direction = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'date') {
          const aTime = a.timestamp || new Date(a.reviewDateTime || 0).getTime();
          const bTime = b.timestamp || new Date(b.reviewDateTime || 0).getTime();
          return (aTime - bTime) * direction;
        }
        return (a.rating - b.rating) * direction;
      });
    }

    return sorted.map((review) => ({
      ...review,
      displayDate: formatDate(review.reviewDateTime),
      shortReview: review.review?.length > 140 ? `${review.review.slice(0, 140)}…` : review.review,
    }));
  }, [reviews, sortField, sortDir]);

  const handleSortClick = (field: 'date' | 'rating') => {
    // cycle: null -> desc -> asc -> null
    if (sortField !== field) {
      setSortField(field);
      setSortDir('desc');
      return;
    }

    if (sortDir === 'desc') {
      setSortDir('asc');
      return;
    }

    if (sortDir === 'asc') {
      setSortField(null);
      setSortDir(null);
      return;
    }

    // default when returning from null
    setSortField(field);
    setSortDir('desc');
  };

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviewId((prev) => (prev === reviewId ? null : reviewId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review List</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchReviews}
            disabled={isLoading}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white shadow">
        <div
          className="overflow-x-auto"
          style={{ height: 'calc(115vh - 220px)' }}
        >
          <div
            className="overflow-y-auto"
            style={{ height: '100%' }}
          >
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="sticky top-0 bg-gray-100 text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    Date
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => handleSortClick('date')}
                    >
                      {sortField === 'date' ? (sortDir === 'asc' ? '⬆️' : '⬇️') : '↕️'}
                    </button>
                  </div>
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    Rating
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => handleSortClick('rating')}
                    >
                      {sortField === 'rating' ? (sortDir === 'asc' ? '⬆️' : '⬇️') : '↕️'}
                    </button>
                  </div>
                </th>
                <th className="px-4 py-3">Recommended</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Age</th>
              </tr>
            </thead>
              <tbody>
                {tableRows.map((review) => (
                  <Fragment key={review.reviewId}>
                    <tr className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500">{review.displayDate}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{review.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <button
                          type="button"
                          className="text-left text-gray-700 underline-offset-2 hover:underline"
                          onClick={() => toggleExpanded(review.reviewId)}
                        >
                          {review.shortReview}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold">{review.rating.toFixed(1)}</td>
                      <td className="px-4 py-3">{review.recommended ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">{review.department}</td>
                      <td className="px-4 py-3">{review.division}</td>
                      <td className="px-4 py-3">{review.class}</td>
                      <td className="px-4 py-3">{review.age}</td>
                    </tr>
                    {expandedReviewId === review.reviewId && (
                      <tr className="border-t border-gray-100 bg-gray-50">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-2 text-sm font-semibold text-gray-700">Review</div>
                            <p className="text-gray-700 leading-relaxed">{review.review}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {!tableRows.length && !isLoading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Không có dữ liệu để hiển thị.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {isLoading && (
          <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">Đang tải dữ liệu...</div>
        )}
      </div>
    </div>
  );
}
