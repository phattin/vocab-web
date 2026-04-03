import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, ListFilter, Target, PlayCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PracticeSetup = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [hasWrongWords, setHasWrongWords] = useState(false);
  const [config, setConfig] = useState({
    filterType: "all", // "all", "unit", "alphabet", "wrong"
    filterValue: "",
    mode: "en_to_vi_mc", // "en_to_vi_mc", "vi_to_en_mc", "en_to_vi_typing", "vi_to_en_typing"
  });

  useEffect(() => {
    fetchUnits();
    checkWrongWords();
  }, []);

  const fetchUnits = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "units"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUnits(data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const checkWrongWords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "wrong_words"));
      setHasWrongWords(!querySnapshot.empty);
    } catch (error) {
      console.error("Error checking wrong words:", error);
    }
  };

  const handleStartPractice = () => {
    if ((config.filterType === "unit" || config.filterType === "alphabet") && !config.filterValue) {
      toast.error("Vui lòng chọn giá trị lọc");
      return;
    }

    // Navigate to practice session with config
    navigate("/practice/session", { state: config });
  };

  const FilterCard = ({ type, title, description, icon: Icon, testId }) => {
    const isActive = config.filterType === type;
    return (
      <div
        onClick={() => setConfig({ ...config, filterType: type, filterValue: "" })}
        data-testid={testId}
        className={`
          card-brutal p-6 cursor-pointer transition-all duration-200
          ${isActive ? "ring-4 ring-brand-primary -translate-y-1 shadow-brutal-lg" : "hover:-translate-y-1 hover:shadow-brutal-lg"}
        `}
      >
        <div className={`inline-flex p-3 rounded-xl border-2 border-borders-default mb-3 ${
          isActive ? "bg-brand-primary" : "bg-white"
        }`}>
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-heading font-bold mb-1">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    );
  };

  const ModeCard = ({ mode, title, description, testId }) => {
    const isActive = config.mode === mode;
    return (
      <div
        onClick={() => setConfig({ ...config, mode })}
        data-testid={testId}
        className={`
          card-brutal p-6 cursor-pointer transition-all duration-200
          ${isActive ? "ring-4 ring-brand-secondary -translate-y-1 shadow-brutal-lg" : "hover:-translate-y-1 hover:shadow-brutal-lg"}
        `}
      >
        <h3 className="text-lg font-heading font-bold mb-1">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    );
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="space-y-8" data-testid="practice-setup-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight mb-4">
          Cài đặt luyện tập
        </h1>
        <p className="text-base sm:text-lg text-text-secondary font-medium">
          Chọn cách bạn muốn ôn tập từ vựng
        </p>
      </div>

      {/* Filter Type */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 flex items-center space-x-2">
          <ListFilter className="w-6 h-6" strokeWidth={2.5} />
          <span>Chọn phạm vi ôn tập</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterCard
            type="all"
            title="Tất cả từ"
            description="Ôn tập toàn bộ từ vựng"
            icon={BookOpen}
            testId="filter-all"
          />
          <FilterCard
            type="unit"
            title="Theo chủ đề"
            description="Chọn một chủ đề cụ thể"
            icon={Target}
            testId="filter-unit"
          />
          <FilterCard
            type="alphabet"
            title="Theo chữ cái"
            description="Từ bắt đầu bằng một chữ cái"
            icon={ListFilter}
            testId="filter-alphabet"
          />
          <FilterCard
            type="wrong"
            title="Từ sai"
            description={hasWrongWords ? "Ôn lại các từ đã sai" : "Chưa có từ sai"}
            icon={Target}
            testId="filter-wrong"
          />
        </div>
      </div>

      {/* Filter Value Selection */}
      {config.filterType === "unit" && (
        <div className="card-brutal p-6">
          <h3 className="text-lg font-heading font-bold mb-4">Chọn chủ đề</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {units.map((unit) => (
              <button
                key={unit.name}
                data-testid={`unit-option-${unit.name}`}
                onClick={() => setConfig({ ...config, filterValue: unit.name })}
                className={`
                  p-4 rounded-xl border-2 border-borders-default font-bold text-left transition-all duration-150
                  ${config.filterValue === unit.name
                    ? "bg-brand-primary shadow-brutal"
                    : "bg-white hover:bg-gray-50 hover:-translate-y-0.5"
                  }
                `}
              >
                <div className="text-base">{unit.name}</div>
                <div className="text-xs text-text-muted mt-1">{unit.word_count} từ</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {config.filterType === "alphabet" && (
        <div className="card-brutal p-6">
          <h3 className="text-lg font-heading font-bold mb-4">Chọn chữ cái đầu</h3>
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                data-testid={`alphabet-option-${letter}`}
                onClick={() => setConfig({ ...config, filterValue: letter })}
                className={`
                  p-3 rounded-xl border-2 border-borders-default font-bold font-heading text-lg transition-all duration-150
                  ${config.filterValue === letter
                    ? "bg-brand-primary shadow-brutal"
                    : "bg-white hover:bg-gray-50 hover:-translate-y-0.5"
                  }
                `}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Practice Mode */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6" strokeWidth={2.5} />
          <span>Chọn chế độ luyện tập</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModeCard
            mode="en_to_vi_mc"
            title="Anh → Việt (Trắc nghiệm)"
            description="Xem từ tiếng Anh, chọn nghĩa đúng"
            testId="mode-en-vi-mc"
          />
          <ModeCard
            mode="vi_to_en_mc"
            title="Việt → Anh (Trắc nghiệm)"
            description="Xem nghĩa tiếng Việt, chọn từ đúng"
            testId="mode-vi-en-mc"
          />
          <ModeCard
            mode="en_to_vi_typing"
            title="Anh → Việt (Nhập liệu)"
            description="Xem từ tiếng Anh, nhập nghĩa"
            testId="mode-en-vi-typing"
          />
          <ModeCard
            mode="vi_to_en_typing"
            title="Việt → Anh (Nhập liệu)"
            description="Xem nghĩa tiếng Việt, nhập từ"
            testId="mode-vi-en-typing"
          />
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleStartPractice}
          data-testid="btn-start-practice"
          className="btn-primary text-lg px-8 py-4 flex items-center space-x-3"
        >
          <PlayCircle className="w-6 h-6" strokeWidth={2.5} />
          <span>Bắt đầu luyện tập</span>
        </button>
      </div>
    </div>
  );
};

export default PracticeSetup;