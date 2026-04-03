import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Volume2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

// ✅ Firebase
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const PracticeSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state;
  const inputRef = useRef(null);

  const [vocabulary, setVocabulary] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!config) {
      navigate("/practice");
      return;
    }
    fetchVocabulary();
  }, []);

  useEffect(() => {
    if (vocabulary.length > 0 && currentIndex < vocabulary.length) {
      const current = vocabulary[currentIndex];

      if (config.mode.includes("_mc")) {
        generateOptions(current);
      }

      if (config.mode.startsWith("en_to_")) {
        speakWord(current.english);
      }

      if (config.mode.includes("_typing") && inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [currentIndex, vocabulary]);

  // ✅ Lấy dữ liệu từ Firebase
  const fetchVocabulary = async () => {
    try {
      const snapshot = await getDocs(collection(db, "vocabularies"));
      let words = snapshot.docs.map((doc) => doc.data());

      // 👉 FILTER
      if (config.filterType === "unit") {
        words = words.filter((w) => w.unit === config.filterValue);
      } else if (config.filterType === "alphabet") {
        words = words.filter((w) =>
          w.english.toLowerCase().startsWith(config.filterValue.toLowerCase())
        );
      } else if (config.filterType === "wrong") {
        const wrong = JSON.parse(localStorage.getItem("wrongWords") || "[]");
        words = words.filter((w) => wrong.includes(w.english));
      }

      if (words.length === 0) {
        toast.error("Không có từ vựng");
        navigate("/practice");
        return;
      }

      // 👉 Shuffle
      const shuffled = [...words].sort(() => Math.random() - 0.5);

      setVocabulary(shuffled);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu");
      navigate("/practice");
    }
  };

  const generateOptions = (current) => {
    const correctAnswer = config.mode.startsWith("en_to_")
      ? current.vietnamese
      : current.english;

    const wrongOptions = vocabulary
      .filter((v) => v.english !== current.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) =>
        config.mode.startsWith("en_to_") ? v.vietnamese : v.english
      );

    const all = [correctAnswer, ...wrongOptions].sort(
      () => Math.random() - 0.5
    );

    setOptions(all);
  };

  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  const checkAnswer = () => {
    const current = vocabulary[currentIndex];
    const correctAnswer = config.mode.startsWith("en_to_")
      ? current.vietnamese
      : current.english;

    let correct = false;

    if (config.mode.includes("_mc")) {
      correct = selectedOption === correctAnswer;
    } else {
      correct =
        userAnswer.trim().toLowerCase() ===
        correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      const updatedWrong = [...wrongAnswers, current.english];
      setWrongAnswers(updatedWrong);

      // 👉 lưu local (để ôn lại)
      localStorage.setItem("wrongWords", JSON.stringify(updatedWrong));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < vocabulary.length) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      finishPractice();
    }
  };

  // ✅ Lưu history vào Firebase
  const finishPractice = async () => {
    try {
      await addDoc(collection(db, "practice_history"), {
        mode: config.mode,
        filterType: config.filterType,
        total: vocabulary.length,
        correct: correctCount,
        wrong: wrongAnswers,
        createdAt: new Date(),
      });

      toast.success(`Đúng ${correctCount}/${vocabulary.length}`);
      navigate("/history");
    } catch (error) {
      console.error(error);
      toast.error("Không lưu được lịch sử");
    }
  };

  if (loading) return <div className="text-center mt-20">Đang tải...</div>;

  const current = vocabulary[currentIndex];
  const question = config.mode.startsWith("en_to_")
    ? current.english
    : current.vietnamese;

  const correctAnswer = config.mode.startsWith("en_to_")
    ? current.vietnamese
    : current.english;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">
        {currentIndex + 1}/{vocabulary.length}
      </h2>

      <h1 className="text-4xl text-center font-bold">{question}</h1>

      {!showFeedback ? (
        <>
          {config.mode.includes("_mc") ? (
            <div className="grid grid-cols-2 gap-4">
              {options.map((op, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(op)}
                  className={`p-4 border ${
                    selectedOption === op ? "bg-purple-300" : ""
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          ) : (
            <input
              ref={inputRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="border p-2 w-full text-center"
            />
          )}

          <button
            onClick={checkAnswer}
            className="btn-primary w-full mt-4"
          >
            Kiểm tra
          </button>
        </>
      ) : (
        <>
          <h2 className={isCorrect ? "text-green-500" : "text-red-500"}>
            {isCorrect ? "Đúng" : "Sai"}
          </h2>

          {!isCorrect && <p>Đáp án: {correctAnswer}</p>}

          <button onClick={handleNext} className="btn-primary w-full">
            Tiếp
          </button>
        </>
      )}
    </div>
  );
};

export default PracticeSession;