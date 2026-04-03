import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Quiz() {
  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "vocabularies"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setList(data);
      setCurrent(data[Math.floor(Math.random() * data.length)]);
    };
    fetch();
  }, []);

  const check = () => {
    if(answer.toLowerCase() === current.meaning.toLowerCase()){
      setScore(score + 1);
    }
    next();
  };

  const next = () => {
    setAnswer("");
    setCurrent(list[Math.floor(Math.random() * list.length)]);
  };

  if(!current) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-lg">Word: {current.word}</h2>
      <input className="border p-2" value={answer} onChange={e=>setAnswer(e.target.value)} />
      <button onClick={check} className="ml-2 bg-green-500 text-white px-3">Check</button>
      <p>Score: {score}</p>
    </div>
  );
}