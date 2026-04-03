import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddWord() {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [unit, setUnit] = useState("");

  const handleAdd = async () => {
    await addDoc(collection(db, "vocabularies"), {
      word,
      meaning,
      unit,
      createdAt: new Date()
    });
    alert("Added!");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">Add Word</h1>
      <input className="border p-2 w-full mb-2" placeholder="Word" onChange={e=>setWord(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Meaning" onChange={e=>setMeaning(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Unit" onChange={e=>setUnit(e.target.value)} />
      <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2">Save</button>
    </div>
  );
}