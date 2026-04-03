import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { History, Calendar, Target, TrendingUp, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PracticeHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/practice-history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Không thể tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  const getModeLabel = (mode) => {
    const labels = {
      "en_to_vi_mc": "Anh → Việt (Trắc nghiệm)",
      "vi_to_en_mc": "Việt → Anh (Trắc nghiệm)",
      "en_to_vi_typing": "Anh → Việt (Nhập liệu)",
      "vi_to_en_typing": "Việt → Anh (Nhập liệu)",
    };
    return labels[mode] || mode;
  };

  const getFilterLabel = (filterType, filterValue) => {
    if (filterType === "all") return "Tất cả từ";
    if (filterType === "unit") return `Unit: ${filterValue}`;
    if (filterType === "alphabet") return `Chữ cái: ${filterValue}`;
    if (filterType === "wrong") return "Từ sai";
    return filterType;
  };

  const handleRedoWrongWords = () => {
    navigate("/practice/session", {
      state: {
        filterType: "wrong",
        filterValue: null,
        mode: "en_to_vi_mc",
      },
    });
  };

  const getScoreColor = (correct, total) => {
    const percentage = (correct / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8" data-testid="practice-history-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight mb-4">
            Lịch sử luyện tập
          </h1>
          <p className="text-base sm:text-lg text-text-secondary font-medium">
            Xem lại kết quả các bài luyện tập của bạn
          </p>
        </div>
        
        {history.some(h => h.wrong_answers.length > 0) && (
          <button
            onClick={handleRedoWrongWords}
            data-testid="btn-redo-wrong"
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
            <span>Ôn lại từ sai</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-2xl font-heading font-bold">Đang tải...</div>
        </div>
      ) : history.length === 0 ? (
        <div className="card-brutal p-12 text-center">
          <History className="w-16 h-16 mx-auto mb-4 text-text-muted" strokeWidth={2} />
          <h3 className="text-2xl font-heading font-bold mb-2">Chưa có lịch sử</h3>
          <p className="text-text-secondary mb-6">Bắt đầu luyện tập để xem kết quả tại đây</p>
          <button
            onClick={() => navigate("/practice")}
            className="btn-primary"
          >
            Bắt đầu luyện tập
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => {
            const percentage = Math.round((item.correct_answers / item.total_questions) * 100);
            
            return (
              <div
                key={index}
                data-testid={`history-item-${index}`}
                className="card-brutal p-6"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    {/* Mode & Filter */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-5 h-5 text-brand-primary" strokeWidth={2.5} />
                      <h3 className="text-lg font-heading font-bold">
                        {getModeLabel(item.mode)}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 border-borders-default bg-brand-tertiary">
                        {getFilterLabel(item.filter_type, item.filter_value)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 border-borders-default bg-white">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(item.completed_at), "dd MMM yyyy, HH:mm", { locale: vi })}
                      </span>
                    </div>

                    {/* Wrong words preview */}
                    {item.wrong_answers.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold uppercase text-text-muted mb-2">
                          Từ sai ({item.wrong_answers.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.wrong_answers.slice(0, 5).map((word, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-bold bg-accents-error border-2 border-accents-errorBorder rounded"
                            >
                              {word}
                            </span>
                          ))}
                          {item.wrong_answers.length > 5 && (
                            <span className="px-2 py-1 text-xs font-bold text-text-muted">
                              +{item.wrong_answers.length - 5} từ khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className={`text-5xl font-heading font-extrabold mb-2 ${getScoreColor(item.correct_answers, item.total_questions)}`}>
                      {percentage}%
                    </div>
                    <div className="text-sm font-bold text-text-muted">
                      {item.correct_answers}/{item.total_questions} đúng
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PracticeHistory;