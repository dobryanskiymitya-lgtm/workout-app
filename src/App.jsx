import { useEffect, useState } from "react";
import "./App.css";

const defaultExercises = [
  { id: 1, name: "Жим лёжа", weight: 60, sets: 4, reps: 8 },
  { id: 2, name: "Приседания", weight: 80, sets: 4, reps: 10 },
  { id: 3, name: "Тяга верхнего блока", weight: 45, sets: 3, reps: 12 },
];

function App() {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem("workout-app");
    return saved ? JSON.parse(saved) : defaultExercises;
  });

  const [form, setForm] = useState({ name: "", weight: "", sets: "", reps: "" });

  useEffect(() => {
    localStorage.setItem("workout-app", JSON.stringify(exercises));
  }, [exercises]);

  function addExercise() {
    if (!form.name.trim()) return;

    setExercises([
      {
        id: Date.now(),
        name: form.name,
        weight: Number(form.weight) || 0,
        sets: Number(form.sets) || 0,
        reps: Number(form.reps) || 0,
      },
      ...exercises,
    ]);

    setForm({ name: "", weight: "", sets: "", reps: "" });
  }

  function deleteExercise(id) {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
  }

  function updateExercise(id, field, value) {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  const totalSets = exercises.reduce((sum, item) => sum + Number(item.sets), 0);
  const totalVolume = exercises.reduce(
    (sum, item) => sum + Number(item.weight) * Number(item.sets) * Number(item.reps),
    0
  );

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="badge">Сегодня</p>
          <h1>Workout Pro</h1>
          <p className="subtitle">Удобный дневник тренировки прямо в зале.</p>
        </div>
        <div className="hero-icon">💪</div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <strong>{exercises.length}</strong>
          <span>Упражнения</span>
        </div>
        <div className="stat-card">
          <strong>{totalSets}</strong>
          <span>Подходы</span>
        </div>
        <div className="stat-card">
          <strong>{totalVolume}</strong>
          <span>Объём кг</span>
        </div>
      </section>

      <section className="panel">
        <h2>Добавить упражнение</h2>

        <div className="form-grid">
          <input
            className="full"
            placeholder="Название упражнения"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Вес"
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />

          <input
            placeholder="Подходы"
            type="number"
            value={form.sets}
            onChange={(e) => setForm({ ...form, sets: e.target.value })}
          />

          <input
            placeholder="Повторы"
            type="number"
            value={form.reps}
            onChange={(e) => setForm({ ...form, reps: e.target.value })}
          />
        </div>

        <button className="primary-btn" onClick={addExercise}>
          Добавить
        </button>
      </section>

      <section className="workout-list">
        <h2>План тренировки</h2>

        {exercises.map((exercise) => (
          <article className="exercise-card" key={exercise.id}>
            <div className="exercise-header">
              <input
                className="exercise-title"
                value={exercise.name}
                onChange={(e) => updateExercise(exercise.id, "name", e.target.value)}
              />

              <button className="delete-btn" onClick={() => deleteExercise(exercise.id)}>
                ×
              </button>
            </div>

            <div className="exercise-fields">
              <label>
                <span>Вес, кг</span>
                <input
                  type="number"
                  value={exercise.weight}
                  onChange={(e) =>
                    updateExercise(exercise.id, "weight", Number(e.target.value))
                  }
                />
              </label>

              <label>
                <span>Подходы</span>
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) =>
                    updateExercise(exercise.id, "sets", Number(e.target.value))
                  }
                />
              </label>

              <label>
                <span>Повторы</span>
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) =>
                    updateExercise(exercise.id, "reps", Number(e.target.value))
                  }
                />
              </label>
            </div>

            <div className="volume">
              Объём упражнения:{" "}
              <b>{Number(exercise.weight) * Number(exercise.sets) * Number(exercise.reps)} кг</b>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
