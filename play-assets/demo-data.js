const DEMO_DATA = {
  weeks: {
    "wk_2026_33": {
      week: { week_id: "wk_2026_33", week_number: 33, source: "Manual" },
      generated_at: "2026-08-10T07:00:00.000Z",
      sessions: [
        {
          session_id: "sess_push_a",
          title: "Empuje A",
          estimated_duration_min: 60,
          session_completion: { status: "completed", started_at: "2026-08-10T07:05:00.000Z", completed_at: "2026-08-10T08:10:00.000Z" },
          session_notes: "Buena sesión. Press de banca estable, remo con sensación de más fuerza.",
          exercises: [
            {
              exercise_id: "ex_press_banca",
              name: "Press de Banca",
              machine_name: "Banco Libre",
              equipment_csv_name: "Banco Libre",
              baseline: { planned_sets: 4, planned_reps: 6, planned_load: 80 },
              override: null,
              target_1rm: { value: 100 },
              execution: {
                sets: [
                  { set_index: 0, load: 60, reps: 8, rir: 3, notes: "", done: true },
                  { set_index: 1, load: 70, reps: 6, rir: 2, notes: "", done: true },
                  { set_index: 2, load: 75, reps: 5, rir: 2, notes: "Tensión buena", done: true },
                  { set_index: 3, load: 80, reps: 4, rir: 1, notes: "", done: true }
                ]
              },
              completion: { status: "completed", completed_at: "2026-08-10T07:45:00.000Z" },
              notes: ""
            },
            {
              exercise_id: "ex_press_hombro",
              name: "Press Militar",
              machine_name: "Multipower",
              equipment_csv_name: "Multipower",
              baseline: { planned_sets: 3, planned_reps: 8, planned_load: 40 },
              override: null,
              target_1rm: { value: 52 },
              execution: {
                sets: [
                  { set_index: 0, load: 32.5, reps: 8, rir: 3, notes: "", done: true },
                  { set_index: 1, load: 37.5, reps: 7, rir: 2, notes: "", done: true },
                  { set_index: 2, load: 40, reps: 5, rir: 2, notes: "", done: false }
                ]
              },
              completion: { status: "in_progress", completed_at: null },
              notes: ""
            }
          ]
        },
        {
          session_id: "sess_remo",
          title: "Tirón A",
          estimated_duration_min: 55,
          session_completion: { status: "pending", started_at: null, completed_at: null },
          session_notes: "",
          exercises: [
            {
              exercise_id: "ex_jalon",
              name: "Jalón al Pecho",
              machine_name: "Polea Alta",
              equipment_csv_name: "Polea Alta",
              baseline: { planned_sets: 4, planned_reps: 10, planned_load: 50 },
              override: null,
              execution: { sets: [] },
              completion: { status: "pending", completed_at: null },
              notes: ""
            }
          ]
        }
      ]
    },
    "wk_2026_32": {
      week: { week_id: "wk_2026_32", week_number: 32, source: "Manual" },
      generated_at: "2026-08-03T07:00:00.000Z",
      sessions: [
        {
          session_id: "sess_pierna_a",
          title: "Pierna A",
          estimated_duration_min: 70,
          session_completion: { status: "completed", started_at: "2026-08-04T07:10:00.000Z", completed_at: "2026-08-04T08:25:00.000Z" },
          session_notes: "Sentadilla pesada, nuevo RIR registro.",
          exercises: [
            {
              exercise_id: "ex_sentadilla",
              name: "Sentadilla",
              machine_name: "Jaula",
              equipment_csv_name: "Jaula",
              baseline: { planned_sets: 5, planned_reps: 5, planned_load: 100 },
              override: null,
              target_1rm: { value: 125 },
              execution: {
                sets: [
                  { set_index: 0, load: 80, reps: 5, rir: 3, notes: "", done: true },
                  { set_index: 1, load: 90, reps: 5, rir: 2, notes: "", done: true },
                  { set_index: 2, load: 97.5, reps: 5, rir: 2, notes: "", done: true },
                  { set_index: 3, load: 102.5, reps: 5, rir: 1, notes: "PR semana", done: true },
                  { set_index: 4, load: 100, reps: 5, rir: 2, notes: "", done: true }
                ]
              },
              completion: { status: "completed", completed_at: "2026-08-04T08:10:00.000Z" },
              notes: ""
            }
          ]
        }
      ]
    }
  }
};
