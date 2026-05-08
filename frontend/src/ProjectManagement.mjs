export async function loadProjects() {
  let projects_request = await fetch("/api/projects");
  let result = await projects_request.json();
  console.log(result);
  await saveProject();
}

export async function saveProject(tempo_input, synths) {
  /*
    const data = {
      bpm: parseFloat(tempo_input.value),
      synths: synths.map(s => ({
        oscillators: s.oscillators.map(o => ({ signal: o.signal, octave: o.octave })),
        notes: s.timeline.notes,
      })),
    };
    */

  const data = {
    gabagool: true,
  };

  try {
    let save = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "gabagoo", data }),
    });
    let result = await save.json();
    console.log(result);
  } catch (error) {
    console.log("error: ", error);
  }
}
