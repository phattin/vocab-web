import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Volume2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      
      // Generate options for multiple choice
      if (config.mode.includes("_mc")) {
        generateOptions(current);
      }
      
      // Speak the word if it's English
      if (config.mode.startsWith("en_to_")) {
        speakWord(current.english);
      }
      
      // Focus input for typing modes
      if (config.mode.includes("_typing") && inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [currentIndex, vocabulary]);

  const fetchVocabulary = async () => {
    try {
      let url = `${API}/vocabulary`;
      
      if (config.filterType === "unit") {
        url = `${API}/vocabulary/by-unit/${config.filterValue}`;
      } else if (config.filterType === "alphabet") {
        url = `${API}/vocabulary/by-alphabet/${config.filterValue}`;
      } else if (config.filterType === "wrong") {
        url = `${API}/vocabulary/by-wrong-words`;
      }
      
      const response = await axios.get(url);
      const words = response.data;
      
      if (words.length === 0) {
        toast.error("Không có từ vựng nào để luyện tập");
        navigate("/practice");
        return;
      }
      
      // Shuffle the vocabulary
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setVocabulary(shuffled);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      toast.error("Không thể tải từ vựng");
      navigate("/practice");
    }
  };

  const generateOptions = (current) => {
    // Get the correct answer
    const correctAnswer = config.mode.startsWith("en_to_") ? current.vietnamese : current.english;
    
    // Get 3 random wrong answers
    const wrongOptions = vocabulary
      .filter(v => v.english !== current.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => config.mode.startsWith("en_to_") ? v.vietnamese : v.english);
    
    // Combine and shuffle
    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = () => {
    const current = vocabulary[currentIndex];
    const correctAnswer = config.mode.startsWith("en_to_") ? current.vietnamese : current.english;
    
    let isAnswerCorrect = false;
    
    if (config.mode.includes("_mc")) {
      isAnswerCorrect = selectedOption === correctAnswer;
    } else {
      // For typing mode, trim and case-insensitive comparison
      isAnswerCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    }
    
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    
    if (isAnswerCorrect) {
      setCorrectCount(correctCount + 1);
    } else {
      setWrongAnswers([...wrongAnswers, current.english]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < vocabulary.length) {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // Finish practice session
      finishPractice();
    }
  };

  const finishPractice = async () => {
    try {
      await axios.post(`${API}/practice-history`, {
        mode: config.mode,
        filter_type: config.filterType,
        filter_value: config.filterValue || null,
        total_questions: vocabulary.length,
        correct_answers: correctCount,
        wrong_answers: wrongAnswers,
      });
      
      // Navigate to results
      navigate("/history");
      toast.success(`Hoàn thành! Đúng ${correctCount}/${vocabulary.length} câu`);
    } catch (error) {
      console.error("Error saving practice history:", error);
      toast.error("Không thể lưu kết quả");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-2xl font-heading font-bold">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return null;
  }

  const current = vocabulary[currentIndex];
  const question = config.mode.startsWith("en_to_") ? current.english : current.vietnamese;
  const correctAnswer = config.mode.startsWith("en_to_") ? current.vietnamese : current.english;

  return (
    <div className="space-y-8" data-testid="practice-session">
      {/* Progress */}
      <div className="card-brutal p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Tiến độ
          </span>
          <span className="text-sm font-bold" data-testid="progress-text">
            {currentIndex + 1} / {vocabulary.length}
          </span>
        </div>
        <div className="w-full bg-background-tertiary border-2 border-borders-default rounded-full h-4 overflow-hidden">
          <div
            className="bg-brand-primary h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className={`flashcard ${showFeedback ? (isCorrect ? 'scale-up' : 'shake') : ''}`}>
        {/* Question */}
        <div className="mb-8">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
            {config.mode.startsWith("en_to_") ? "Từ tiếng Anh" : "Nghĩa tiếng Việt"}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <h2 className="text-5xl sm:text-6xl font-heading font-extrabold" data-testid="question-text">
              {question}
            </h2>
            {config.mode.startsWith("en_to_") && (
              <button
                onClick={() => speakWord(current.english)}
                data-testid="btn-play-audio"
                className="p-4 bg-brand-tertiary border-2 border-borders-default rounded-xl hover:-translate-y-1 transition-all duration-150 shadow-brutal hover:shadow-brutal-lg"
              >
                <Volume2 className="w-8 h-8" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Answer Area */}
        {!showFeedback ? (
          <div className="w-full max-w-2xl">
            {config.mode.includes("_mc") ? (
              // Multiple Choice
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((option, index) => (
                  <button
                    key={index}
                    data-testid={`option-button-${index}`}
                    onClick={() => setSelectedOption(option)}
                    className={`
                      p-6 rounded-xl border-2 border-borders-default font-bold text-lg transition-all duration-150
                      ${selectedOption === option
                        ? "bg-brand-primary shadow-brutal"
                        : "bg-white hover:bg-gray-50 hover:-translate-y-1 hover:shadow-brutal-sm"
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              // Typing
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  data-testid="input-answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim()) {
                      checkAnswer();
                    }
                  }}
                  className="w-full text-center text-3xl font-bold bg-transparent border-b-4 border-borders-default rounded-none focus:border-brand-primary focus:outline-none pb-2"
                  placeholder="Nhập câu trả lời..."
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={checkAnswer}
              data-testid="btn-check-answer"
              disabled={config.mode.includes("_mc") ? !selectedOption : !userAnswer.trim()}
              className="btn-primary w-full mt-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          // Feedback
          <div className="w-full max-w-2xl">
            <div className={`p-8 rounded-2xl border-4 mb-6 ${
              isCorrect
                ? "bg-accents-success border-accents-successBorder"
                : "bg-accents-error border-accents-errorBorder"
            }`}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                {isCorrect ? (
                  <CheckCircle className="w-12 h-12 text-accents-successBorder" strokeWidth={2.5} />
                ) : (
                  <XCircle className="w-12 h-12 text-accents-errorBorder" strokeWidth={2.5} />
                )}
                <span className="text-3xl font-heading font-bold">
                  {isCorrect ? "Chính xác!" : "Sai rồi!"}
                </span>
              </div>
              {!isCorrect && (
                <div className="text-center">
                  <p className="text-lg font-bold mb-2">Đáp án đúng:</p>
                  <p className="text-2xl font-heading font-bold" data-testid="correct-answer">{correctAnswer}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              data-testid="btn-next"
              className="btn-primary w-full text-lg flex items-center justify-center space-x-2"
            >
              <span>{currentIndex + 1 < vocabulary.length ? "Câu tiếp theo" : "Hoàn thành"}</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeSession;