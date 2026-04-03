import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, List } from "lucide-react";

// ✅ Firebase
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

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
    fetchData();
  }, []);

  // ✅ Lấy dữ liệu từ Firestore
  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "vocabularies"));
      const data = snapshot.docs.map((doc) => doc.data());

      // 👉 Recent words (5 từ mới nhất)
      setRecentWords(data.slice(-5).reverse());

      // 👉 Units + count
      const unitMap = {};
      data.forEach((item) => {
        if (!unitMap[item.unit]) {
          unitMap[item.unit] = 0;
        }
        unitMap[item.unit]++;
      });

      const unitsArray = Object.keys(unitMap).map((unit) => ({
        name: unit,
        word_count: unitMap[unit],
      }));

      setExistingUnits(unitsArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    }
  };

  // ✅ Thêm từ vào Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.english || !formData.vietnamese || !formData.unit) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "vocabularies"), {
        english: formData.english,
        vietnamese: formData.vietnamese,
        unit: formData.unit,
        createdAt: new Date(),
      });

      toast.success(`Đã thêm từ "${formData.english}"`);

      // Reset form
      setFormData({
        english: "",
        vietnamese: "",
        unit: formData.unit,
      });

      // Reload data
      fetchData();

      document.getElementById("english-input")?.focus();
    } catch (error) {
      console.error("Error adding vocab:", error);
      toast.error("Không thể thêm từ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Thêm từ vựng</h1>
        <p className="text-text-secondary">
          Nhập từ tiếng Anh và nghĩa tiếng Việt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2">
          <div className="card-brutal p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                id="english-input"
                type="text"
                placeholder="English..."
                value={formData.english}
                onChange={(e) =>
                  setFormData({ ...formData, english: e.target.value })
                }
                className="input-brutal"
              />

              <input
                type="text"
                placeholder="Vietnamese..."
                value={formData.vietnamese}
                onChange={(e) =>
                  setFormData({ ...formData, vietnamese: e.target.value })
                }
                className="input-brutal"
              />

              <input
                type="text"
                placeholder="Unit..."
                list="units"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="input-brutal"
              />

              <datalist id="units">
                {existingUnits.map((u) => (
                  <option key={u.name} value={u.name} />
                ))}
              </datalist>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {loading ? "Đang thêm..." : "Thêm"}
              </button>
            </form>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* Recent */}
          <div className="card-brutal p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <List /> Từ vừa thêm
            </h3>
            {recentWords.length === 0 ? (
              <p>Chưa có</p>
            ) : (
              recentWords.map((w, i) => (
                <div key={i} className="border-l-4 pl-2 mb-2">
                  <b>{w.english}</b>
                  <p className="text-sm">{w.vietnamese}</p>
                  <span className="text-xs">{w.unit}</span>
                </div>
              ))
            )}
          </div>

          {/* Units */}
          <div className="card-brutal p-4">
            <h3 className="font-bold mb-3">Chủ đề</h3>
            {existingUnits.map((u) => (
              <div key={u.name} className="flex justify-between text-sm">
                <span>{u.name}</span>
                <span>{u.word_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVocabulary;