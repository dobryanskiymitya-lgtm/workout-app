import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

function App() {
  const [workoutName, setWorkoutName] = useState("");
  const [timerInput, setTimerInput] = useState("60");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem("workout-app-data");
    return saved ? JSON.parse(saved) : [];
  });

  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("workout-app-data", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          playFinishSound();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const totalSeconds = useMemo(() => {
    const value = Number(timerInput);
    return value > 0 ? value : 60;
  }, [timerInput]);

  const stats = useMemo(() => {
    let exercises = 0;
    let sets = 0;
    let volume = 0;
    let done = 0;

    workouts.forEach((workout) => {
      exercises += workout.exercises.length;

      workout.exercises.forEach((exercise) => {
        const s = Number(exercise.sets) || 0;
        const r = Number(exercise.reps) || 0;
        const w = Number(exercise.weight) || 0;

        sets += s;
        volume += s * r * w;

        if (exercise.done) done += 1;
      });
    });

    return {
      workouts: workouts.length,
      exercises,
      sets,
      volume,
      done,
    };
  }, [workouts]);

  function setupAudio() {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioRef.current = new AudioContext();
      }
    }
  }

  function playFinishSound() {
    try {
      setupAudio();

      const context = audioRef.current;
      if (!context) return;

      if (context.state === "suspended") {
        context.resume();
      }

      const now = context.currentTime;

      [0, 0.2, 0.4].forEach((delay) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, now + delay);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.2, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.18);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(now + delay);
        oscillator.stop(now + delay + 0.2);
      });
    } catch (error) {
      console.error(error);
    }
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function applyTimer() {
    const value = Number(timerInput);

    if (!value || value <= 0) {
      alert("Введите корректное время");
      return;
    }

    setSecondsLeft(value);
    setIsRunning(false);
    setIsFinished(false);
  }

  function startTimer() {
    setupAudio();

    if (secondsLeft === 0) {
      setSecondsLeft(totalSeconds);
    }

    setIsFinished(false);
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
  }

  function addWorkout() {
    if (!workoutName.trim()) {
      alert("Введите название тренировки");
      return;
    }

    const newWorkout = {
      id: Date.now(),
      name: workoutName.trim(),
      exercises: [],
      draft: {
        name: "",
        sets: "",
        reps: "",
        weight: "",
      },
    };

    setWorkouts((prev) => [newWorkout, ...prev]);
    setWorkoutName("");
  }

  function deleteWorkout(workoutId) {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== workoutId));
  }

  function updateDraft(workoutId, field, value) {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              draft: {
                ...workout.draft,
                [field]: value,
              },
            }
          : workout
      )
    );
  }

  function addExercise(workoutId) {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id !== workoutId) return workout;

        const draft = workout.draft;

        if (
          !draft.name.trim() ||
          !String(draft.sets).trim() ||
          !String(draft.reps).trim() ||
          !String(draft.weight).trim()
        ) {
          alert("Заполни все поля упражнения");
          return workout;
        }

        const newExercise = {
          id: Date.now() + Math.random(),
          name: draft.name.trim(),
          sets: draft.sets,
          reps: draft.reps,
          weight: draft.weight,
          done: false,
        };

        return {
          ...workout,
          exercises: [...workout.exercises, newExercise],
          draft: {
            name: "",
            sets: "",
            reps: "",
            weight: "",
          },
        };
      })
    );
  }

  function deleteExercise(workoutId, exerciseId) {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.filter(
                (exercise) => exercise.id !== exerciseId
              ),
            }
          : workout
      )
    );
  }

  function toggleExercise(workoutId, exerciseId) {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? { ...exercise, done: !exercise.done }
                  : exercise
              ),
            }
          : workout
      )
    );
  }

  function clearAllData() {
    const confirmed = confirm("Удалить все тренировки?");
    if (!confirmed) return;

    setWorkouts([]);
  }

  const progress =
    totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="app">
      <div className="phone">
        <header className="hero">
          <div>
            <span className="badge">Fitness Planner</span>
            <h1>Тренировки</h1>
            <p>Упражнения, подходы, вес, отдых и статистика в одном месте.</p>
          </div>

          <button className="ghost-button" onClick={clearAllData}>
            Очистить
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Тренировок</span>
            <strong>{stats.workouts}</strong>
          </div>

          <div className="stat-card">
            <span>Упражнений</span>
            <strong>{stats.exercises}</strong>
          </div>

          <div className="stat-card">
            <span>Готово</span>
            <strong>{stats.done}</strong>
          </div>

          <div className="stat-card">
            <span>Объём</span>
            <strong>{stats.volume} кг</strong>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <h2>Новая тренировка</h2>
          </div>

          <div className="main-form">
            <input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addWorkout();
              }}
              placeholder="Например: Грудь и трицепс"
            />

            <button onClick={addWorkout}>Добавить</button>
          </div>
        </section>

        <section className="card timer-card">
          <div className="section-header">
            <h2>Таймер отдыха</h2>

            <span
              className={`status ${
                isFinished ? "finished" : isRunning ? "running" : ""
              }`}
            >
              {isFinished ? "Время вышло" : isRunning ? "Идёт" : "Готов"}
            </span>
          </div>

          <div className="timer-layout">
            <div className="timer-circle">
              <svg viewBox="0 0 140 140">
                <circle className="timer-track" cx="70" cy="70" r="52" />
                <circle
                  className="timer-progress"
                  cx="70"
                  cy="70"
                  r="52"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>

              <div className="timer-center">
                <strong>{formatTime(secondsLeft)}</strong>
                <span>отдых</span>
              </div>
            </div>

            <div className="timer-controls">
              <div className="timer-input">
                <input
                  type="number"
                  min="1"
                  value={timerInput}
                  onChange={(e) => setTimerInput(e.target.value)}
                  placeholder="Секунды"
                />

                <button className="secondary-button" onClick={applyTimer}>
                  Установить
                </button>
              </div>

              <div className="timer-buttons">
                <button onClick={startTimer}>Старт</button>
                <button className="secondary-button" onClick={pauseTimer}>
                  Пауза
                </button>
                <button className="danger-soft-button" onClick={resetTimer}>
                  Сброс
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="workouts">
          {workouts.length === 0 ? (
            <div className="empty">
              <div>🏋️</div>
              <h3>Пока тренировок нет</h3>
              <p>Добавь первую тренировку и начни вести прогресс.</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <article className="workout-card" key={workout.id}>
                <div className="workout-header">
                  <div>
                    <h3>{workout.name}</h3>
                    <p>{workout.exercises.length} упражнений</p>
                  </div>

                  <button
                    className="danger-button"
                    onClick={() => deleteWorkout(workout.id)}
                  >
                    Удалить
                  </button>
                </div>

                <div className="exercise-form">
                  <input
                    value={workout.draft.name}
                    onChange={(e) =>
                      updateDraft(workout.id, "name", e.target.value)
                    }
                    placeholder="Упражнение"
                  />

                  <input
                    type="number"
                    value={workout.draft.sets}
                    onChange={(e) =>
                      updateDraft(workout.id, "sets", e.target.value)
                    }
                    placeholder="Подходы"
                  />

                  <input
                    type="number"
                    value={workout.draft.reps}
                    onChange={(e) =>
                      updateDraft(workout.id, "reps", e.target.value)
                    }
                    placeholder="Повторы"
                  />

                  <input
                    type="number"
                    value={workout.draft.weight}
                    onChange={(e) =>
                      updateDraft(workout.id, "weight", e.target.value)
                    }
                    placeholder="Вес"
                  />

                  <button onClick={() => addExercise(workout.id)}>
                    Добавить
                  </button>
                </div>

                <div className="exercise-list">
                  {workout.exercises.length === 0 ? (
                    <p className="small-empty">Упражнений пока нет</p>
                  ) : (
                    workout.exercises.map((exercise) => (
                      <div
                        className={`exercise-item ${
                          exercise.done ? "done" : ""
                        }`}
                        key={exercise.id}
                      >
                        <button
                          className="check-button"
                          onClick={() =>
                            toggleExercise(workout.id, exercise.id)
                          }
                        >
                          {exercise.done ? "✓" : ""}
                        </button>

                        <div className="exercise-info">
                          <strong>{exercise.name}</strong>
                          <p>
                            {exercise.sets} подходов • {exercise.reps} повторов
                            • {exercise.weight} кг
                          </p>
                        </div>

                        <button
                          className="delete-exercise-button"
                          onClick={() =>
                            deleteExercise(workout.id, exercise.id)
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
