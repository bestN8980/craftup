import { useEffect, useState } from "react";
import api from "../../services/api";

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString("vi-VN")}đ`;

const formatShortPrice = (price) => {
  const value = Number(price || 0);

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}tr`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }

  return value.toString();
};

function RevenueChart() {
  const [period, setPeriod] = useState("7");
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/orders/seller/revenue?period=${period}`
        );

        setRevenue(response.data.data);
      } catch (err) {
        console.error("Lỗi lấy doanh thu:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải dữ liệu doanh thu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [period]);

  const data = revenue?.chartData || [];

  const maxRevenue = Math.max(
    ...data.map((item) => Number(item.revenue || 0)),
    1
  );

  const points = data
    .map((item, index) => {
      const x =
        data.length > 1
          ? 45 + (index * 600) / (data.length - 1)
          : 345;

      const y =
        180 - (Number(item.revenue || 0) / maxRevenue) * 150;

      return `${x},${y}`;
    })
    .join(" ");

  const growth = Number(revenue?.growth || 0);

  const labelInterval = Math.max(
    1,
    Math.ceil(data.length / 7)
  );

  return (
    <div className="seller-panel revenue-panel">
      <div className="seller-panel-header">
        <div>
          <h3>Doanh thu</h3>
          <p>Biểu đồ doanh thu của gian hàng</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="seller-period-select"
        >
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu doanh thu...</p>
      ) : error ? (
        <p className="revenue-error">{error}</p>
      ) : (
        <>
          <div className="seller-chart-summary">
            <h2>{formatPrice(revenue?.totalRevenue)}</h2>

            <span>
              <span
                className={
                  growth >= 0 ? "chart-up" : "chart-down"
                }
              >
                {growth > 0 ? "↑" : growth < 0 ? "↓" : ""}
                {Math.abs(growth)}%
              </span>{" "}
              so với kỳ trước
            </span>
          </div>

          <div className="seller-chart">
            <div className="chart-y-labels">
              {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
                <span key={ratio}>
                  {formatShortPrice(maxRevenue * ratio)}
                </span>
              ))}
            </div>

            <div className="chart-content">
              <svg
                viewBox="0 0 680 210"
                preserveAspectRatio="none"
                className="revenue-svg"
              >
                {[30, 67.5, 105, 142.5, 180].map((y) => (
                  <line
                    key={y}
                    x1="20"
                    y1={y}
                    x2="660"
                    y2={y}
                    stroke="#eee8e2"
                    strokeDasharray="4 5"
                  />
                ))}

                {data.length > 0 && (
                  <>
                    <polygon
                      points={`45,180 ${points} 645,180`}
                      fill="url(#revenueGradient)"
                    />

                    <polyline
                      points={points}
                      fill="none"
                      stroke="#9b6341"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {data.map((item, index) => {
                      const x =
                        data.length > 1
                          ? 45 + (index * 600) / (data.length - 1)
                          : 345;

                      const y =
                        180 -
                        (Number(item.revenue || 0) /
                          maxRevenue) *
                          150;

                      return (
                        <circle
                          key={item.date}
                          cx={x}
                          cy={y}
                          r={data.length > 30 ? 2 : 4}
                          fill="#fff"
                          stroke="#9b6341"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </>
                )}

                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#c28a62"
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor="#c28a62"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
              </svg>

              <div className="chart-x-labels">
                {data.map((item, index) => {
                  if (
                    index % labelInterval !== 0 &&
                    index !== data.length - 1
                  ) {
                    return null;
                  }

                  return (
                    <span key={item.date}>
                      {new Date(
                        `${item.date}T00:00:00`
                      ).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RevenueChart;