import { useState } from "react";

function App() {
  const [workouts, setWorkouts] = useState(["Жим лёжа", "Приседания", "Бег"]);
  const [newWorkout, setNewWorkout] = useState("");

  function addWorkout() {
    if (newWorkout.trim() === "") return;

    setWorkouts([...workouts, newWorkout]);
    setNewWorkout("");
  }

  function deleteWorkout(index) {
    setWorkouts(workouts.filter((_, i) => i !== index));
  }

  return (
    <div style={{ padding: 30, textAlign: "center" }}>
      <h1>Workout App 💪</h1>
      <p>Добавь свою тренировку:</p>

      <input
        value={newWorkout}
        onChange={(e) => setNewWorkout(e.target.value)}
        placeholder="Например: Подтягивания"
        style={{ padding: 10, fontSize: 16 }}
      />

      <button
        onClick={addWorkout}
        style={{ padding: 10, marginLeft: 10, fontSize: 16 }}
      >
        Добавить
      </button>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 30 }}>
        {workouts.map((workout, index) => (
          <li key={index} style={{ marginBottom: 10 }}>
            {workout}
            <button
              onClick={() => deleteWorkout(index)}
              style={{ marginLeft: 10 }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
