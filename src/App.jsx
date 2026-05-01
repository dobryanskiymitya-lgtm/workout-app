import { useEffect, useMemo, useState } from "react";
import "./App.css";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem("workout-history");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    date: today(),
    name: "",
    weight: "",
    sets: "",
    reps: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState("Все");

  useEffect(() => {
    localStorage.setItem("workout-history", JSON.stringify(records));
  }, [records]);

  function saveRecord() {
    if (!form.name.trim()) return;

    const record = {
      id: editingId || Date.now(),
      date: form.date,
      name: form.name.trim(),
      weight: Number(form.weight) || 0,
      sets: Number(form.sets) || 0,
      reps: Number(form.reps) || 0,
    };

    if (editingId) {
      setRecords(records.map((item) => (item.id === editingId ? record : item)));
      setEditingId(null);
    } else {
      setRecords([record, ...records]);
    }

    setForm({
      date: today(),
      name: "",
      weight: "",
      sets: "",
      reps: "",
    });
  }

  function editRecord(record) {
    setEditingId(record.id);
    setForm(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteRecord(id) {
    setRecords(records.filter((item) => item.id !== id));
  }

  const exercises = useMemo(() => {
    return ["Все", ...new Set(records.map((item) => item.name))];
  }, [records]);

  const filteredRecords =
    selectedExercise === "Все"
      ? records
      : records.filter((item) => item.name === selectedExercise);

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const bestWeight = filteredRecords.length
    ? Math.max(...filteredRecords.map((item) => item.weight))
    : 0;

  const totalVolume = filteredRecords.reduce(
    (sum, item) => sum + item.weight * item.sets * item.reps,
    0
  );

  const groupedByDate = sortedRecords.reduce((groups, item) => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
    return groups;
  }, {});

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="badge">Дневник прогресса</p>
          <h1>Workout Tracker</h1>
          <p>Следи за весами, подходами и ростом силы по датам.</p>
        </div>
        <div className="heroIcon">💪</div>
      </header>

      <section className="stats">
        <div>
          <strong>{records.length}</strong>
          <span>записей</span>
        </div>
        <div>
          <strong>{bestWeight}</strong>
          <span>лучший вес</span>
        </div>
        <div>
          <strong>{totalVolume}</strong>
          <span>общий объём</span>
        </div>
      </section>

      <section className="panel">
        <h2>{editingId ? "Редактировать упражнение" : "Добавить упражнение"}</h2>

        <div className="form">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            placeholder="Название упражнения"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="number"
            placeholder="Вес, кг"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />

          <input
            type="number"
            placeholder="Подходы"
            value={form.sets}
            onChange={(e) => setForm({ ...form, sets: e.target.value })}
          />

          <input
            type="number"
            placeholder="Повторы"
            value={form.reps}
            onChange={(e) => setForm({ ...form, reps: e.target.value })}
          />
        </div>

        <button className="mainBtn" onClick={saveRecord}>
          {editingId ? "Сохранить изменения" : "Добавить запись"}
        </button>
      </section>

      <section className="filter">
        <h2>Прогресс</h2>

        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {exercises.map((exercise) => (
            <option key={exercise}>{exercise}</option>
          ))}
        </select>
      </section>

      <section className="timeline">
        {Object.keys(groupedByDate).length === 0 && (
          <div className="empty">Пока нет записей</div>
        )}

        {Object.entries(groupedByDate).map(([date, items]) => (
          <div className="day" key={date}>
            <h3>{date}</h3>

            <div className="cardsRow">
              {items.map((item) => (
                <article className="recordCard" key={item.id}>
                  <div className="cardTop">
                    <h4>{item.name}</h4>
                    <button onClick={() => deleteRecord(item.id)}>×</button>
                  </div>

                  <div className="numbers">
                    <div>
                      <strong>{item.weight}</strong>
                      <span>кг</span>
                    </div>
                    <div>
                      <strong>{item.sets}</strong>
                      <span>подходы</span>
                    </div>
                    <div>
                      <strong>{item.reps}</strong>
                      <span>повторы</span>
                    </div>
                  </div>

                  <p className="volume">
                    Объём: <b>{item.weight * item.sets * item.reps} кг</b>
                  </p>

                  <button className="editBtn" onClick={() => editRecord(item)}>
                    Изменить
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;
