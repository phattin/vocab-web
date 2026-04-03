import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddVocabulary from "./pages/AddVocabulary";
import PracticeSetup from "./pages/PracticeSetup";
import PracticeSession from "./pages/PracticeSession";
import PracticeHistory from "./pages/PracticeHistory";
import { Toaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddVocabulary />} />
            <Route path="/practice" element={<PracticeSetup />} />
            <Route path="/practice/session" element={<PracticeSession />} />
            <Route path="/history" element={<PracticeHistory />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;