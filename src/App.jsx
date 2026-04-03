import { Routes, Route, Link } from "react-router-dom";
import AddWord from "./pages/AddWord";
import Quiz from "./pages/Quiz";
import History from "./pages/History";

export default function App() {
  return (
    <div className="p-4">
      <nav className="flex gap-4 mb-4">
        <Link to="/">Add</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/history">History</Link>
      </nav>
      <Routes>
        <Route path="/" element={<AddWord />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}