import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, BookMarked, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_words: 0,
    total_units: 0,
    words_needing_review: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick, testId }) => (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`
        card-brutal p-6 sm:p-8
        ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-200" : ""}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border-2 border-borders-default ${color}`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-muted mb-2">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
        {loading ? "..." : value}
      </p>
    </div>
  );

  const ActionCard = ({ title, description, icon: Icon, color, onClick, testId }) => (
    <div
      onClick={onClick}
      data-testid={testId}
      className="card-brutal-interactive p-6 sm:p-8"
    >
      <div className={`inline-flex p-3 rounded-xl border-2 border-borders-default mb-4 ${color}`}>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
      </div>
      <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2">{title}</h3>
      <p className="text-text-secondary font-medium">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Hero Section */}
      <div className="text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight mb-4">
          Chào mừng đến với
          <span className="text-brand-primary"> Vocab Trainer</span>
        </h1>
        <p className="text-base sm:text-lg text-text-secondary font-medium max-w-2xl">
          Ôn luyện từ vựng tiếng Anh hiệu quả với nhiều chế độ luyện tập đa dạng
        </p>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Tổng số từ vựng"
          value={stats.total_words}
          color="bg-brand-tertiary"
          testId="stat-total-words"
        />
        <StatCard
          icon={BookMarked}
          label="Số chủ đề"
          value={stats.total_units}
          color="bg-brand-secondary"
          testId="stat-total-units"
        />
        <StatCard
          icon={AlertCircle}
          label="Từ cần ôn lại"
          value={stats.words_needing_review}
          color="bg-accents-warning"
          onClick={() => navigate("/practice")}
          testId="stat-words-review"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6">
          Bắt đầu ngay
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title="Thêm từ vựng mới"
            description="Thêm từ vựng mới theo chủ đề để bắt đầu học"
            icon={BookOpen}
            color="bg-brand-primary"
            onClick={() => navigate("/add")}
            testId="action-add-vocab"
          />
          <ActionCard
            title="Luyện tập ngay"
            description="Chọn chế độ luyện tập phù hợp với bạn"
            icon={TrendingUp}
            color="bg-brand-secondary"
            onClick={() => navigate("/practice")}
            testId="action-start-practice"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;