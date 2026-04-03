import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, List } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AddVocabulary = () => {
  const [formData, setFormData] = useState({
    english: "",
    vietnamese: "",
    unit: "",
  });
  const [existingUnits, setExistingUnits] = useState([]);
  const [recentWords, setRecentWords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
    fetchRecentWords();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API}/units`);
      setExistingUnits(response.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const fetchRecentWords = async () => {
    try {
      const response = await axios.get(`${API}/vocabulary`);
      setRecentWords(response.data.slice(-5).reverse());
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.english || !formData.vietnamese || !formData.unit) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/vocabulary`, formData);
      toast.success(`Đã thêm từ "${formData.english}" thành công!`);
      
      // Reset form
      setFormData({
        english: "",
        vietnamese: "",
        unit: formData.unit, // Keep the unit for convenience
      });
      
      // Refresh data
      fetchUnits();
      fetchRecentWords();
      
      // Focus back to english input
      document.getElementById("english-input")?.focus();
    } catch (error) {
      console.error("Error adding vocabulary:", error);
      toast.error("Không thể thêm từ vựng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="add-vocabulary-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight mb-4">
          Thêm từ vựng mới
        </h1>
        <p className="text-base sm:text-lg text-text-secondary font-medium">
          Nhập từ tiếng Anh và nghĩa tiếng Việt theo chủ đề
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card-brutal p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* English Word */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Từ tiếng Anh
                </label>
                <input
                  id="english-input"
                  type="text"
                  data-testid="input-english"
                  value={formData.english}
                  onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                  className="input-brutal"
                  placeholder="Nhập từ tiếng Anh..."
                  autoFocus
                />
              </div>

              {/* Vietnamese Meaning */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Nghĩa tiếng Việt
                </label>
                <input
                  type="text"
                  data-testid="input-vietnamese"
                  value={formData.vietnamese}
                  onChange={(e) => setFormData({ ...formData, vietnamese: e.target.value })}
                  className="input-brutal"
                  placeholder="Nhập nghĩa tiếng Việt..."
                />
              </div>

              {/* Unit/Topic */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Chủ đề / Unit
                </label>
                <input
                  type="text"
                  data-testid="input-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input-brutal"
                  placeholder="VD: Unit 1, Animals, Food..."
                  list="units-list"
                />
                <datalist id="units-list">
                  {existingUnits.map((unit) => (
                    <option key={unit.name} value={unit.name} />
                  ))}
                </datalist>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="btn-submit-vocab"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span>{loading ? "Đang thêm..." : "Thêm từ vựng"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Recent Words & Units */}
        <div className="space-y-6">
          {/* Recent Words */}
          <div className="card-brutal p-6">
            <div className="flex items-center space-x-2 mb-4">
              <List className="w-5 h-5" strokeWidth={2.5} />
              <h3 className="text-lg font-heading font-bold">Từ vừa thêm</h3>
            </div>
            {recentWords.length === 0 ? (
              <p className="text-text-muted text-sm">Chưa có từ nào</p>
            ) : (
              <div className="space-y-3">
                {recentWords.map((word, index) => (
                  <div
                    key={index}
                    data-testid={`recent-word-${index}`}
                    className="border-l-4 border-brand-primary pl-3 py-2"
                  >
                    <p className="font-bold text-text-primary">{word.english}</p>
                    <p className="text-sm text-text-secondary">{word.vietnamese}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-bold border-2 border-borders-default rounded-full bg-brand-tertiary">
                      {word.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Units Summary */}
          <div className="card-brutal p-6">
            <h3 className="text-lg font-heading font-bold mb-4">Chủ đề hiện có</h3>
            {existingUnits.length === 0 ? (
              <p className="text-text-muted text-sm">Chưa có chủ đề nào</p>
            ) : (
              <div className="space-y-2">
                {existingUnits.map((unit) => (
                  <div
                    key={unit.name}
                    data-testid={`unit-${unit.name}`}
                    className="flex items-center justify-between p-2 border-2 border-borders-light rounded-lg"
                  >
                    <span className="font-bold text-sm">{unit.name}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-brand-tertiary border-2 border-borders-default rounded-full">
                      {unit.word_count} từ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVocabulary;