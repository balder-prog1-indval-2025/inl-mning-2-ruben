let tempo = 100;
let synths = [];

export function setSaveData(bpm, synths_list) {
  tempo = bpm;
  synths = synths_list;
  //console.log(tempo);
}

export async function loadProjects(id) {
  let projects_request = await fetch("/api/projects");
  let result = await projects_request.json();
  //console.log(result);

  let project_selector_element = document.querySelector("#projsele");
  //console.log(project_selector_element);
  project_selector_element.innerHTML = '<option value="new">New Save</option>';

  let si = 0;

  for (let i = 0; i < result.length; i++) {
    let project = result[i];
    let option_element = document.createElement("option");
    option_element.value = project.name;
    option_element.id = project.id;
    if (String(project.id) === String(id)) {
      si = i + 1;
    }
    option_element.innerText = project.name;
    project_selector_element.appendChild(option_element);
  }

  project_selector_element.selectedIndex = si;

  //await saveProject("plask");
}

//await loadProjects();

let saveButton = document.querySelector(".SaveButton");
saveButton.onclick = async () => {
  let project_selector_element = document.querySelector("#projsele");

  let selected_project = project_selector_element.value;
  //console.log(selected_project);
  if (selected_project == "new") {
    let new_project_name = prompt("Choose a project name:");
    await saveProject(new_project_name, null, tempo, synths);
    return;
  }

  await saveProject(
    selected_project,
    project_selector_element.children[project_selector_element.selectedIndex]
      .id,
    tempo,
    synths
  );
};

let deleteButton = document.querySelector(".DeleteButton");
deleteButton.onclick = async () => {
  let project_selector_element = document.querySelector("#projsele");
  if (project_selector_element.value == "new") return;
  let koll = confirm("säker?");
  if (!koll) return;

  let delete_id =
    project_selector_element.children[project_selector_element.selectedIndex]
      .id;

  let delete_request = await fetch("/api/projects/remove/" + delete_id);
  let result = await delete_request.json();
  await loadProjects();
};

export async function saveProject(project_name, id, tempo_input, synths) {
  const data = {
    bpm: tempo_input,
    synths: synths.map((s) => ({
      oscillators: s.oscillators.map((o) => ({
        signal: o.signal,
        octave: o.octave,
        gain: o.gain,
      })),
      notes: s.timeline.notes,
      reverb: s.reverb.wet.value,
      distortion: s.distortion.wet.value,
    })),
  };

  let fetch_body = JSON.stringify({
    name: project_name.trim().replaceAll(" ", ""),
    data,
  });

  if (id) {
    fetch_body = JSON.stringify({
      id,
      name: project_name,
      data,
    });
  }

  try {
    let save = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: fetch_body,
    });
    let result = await save.json();
    //console.log(result);
    if (!id) {
      id = result.id;
    }
  } catch (error) {
    //console.log("error: ", error);
  }

  await loadProjects(id);
}
