const holes = Array.from({ length: 18 }, (_, i) => i + 1);
const pars = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2];

let players = [
  { id: 1, name: "Player 1", scores: Array(18).fill("") },
  { id: 2, name: "Player 2", scores: Array(18).fill("") },
  { id: 3, name: "Player 3", scores: Array(18).fill("") },
  { id: 4, name: "Player 4", scores: Array(18).fill("") }
];

let noticeShown = false;

const scoreHead = document.getElementById("scoreHead");
const scoreBody = document.getElementById("scoreBody");
const scoreFoot = document.getElementById("scoreFoot");
const summaryList = document.getElementById("summaryList");

const addPlayerBtn = document.getElementById("addPlayerBtn");
const removePlayerBtn = document.getElementById("removePlayerBtn");
const scorecardViewBtn = document.getElementById("scorecardViewBtn");
const rulesViewBtn = document.getElementById("rulesViewBtn");
const themeBtn = document.getElementById("themeBtn");

const scorecardView = document.getElementById("scorecardView");
const rulesView = document.getElementById("rulesView");

function sumScores(scores, start, end) {
  let total = 0;
  for (let i = start; i <= end; i++) {
    total += Number(scores[i] || 0);
  }
  return total;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHeader() {
  scoreHead.innerHTML = "";

  const row = document.createElement("tr");
  row.innerHTML = `
    <th class="hole-col">HOLE</th>
    <th class="par-col">PAR</th>
    ${players.map((player, index) => `
      <th class="player-col">
        <input
          class="player-name-input"
          type="text"
          maxlength="14"
          value="${escapeHtml(player.name)}"
          data-player-id="${player.id}"
          aria-label="Player ${index + 1} name"
        />
      </th>
    `).join("")}
  `;

  scoreHead.appendChild(row);

  scoreHead.querySelectorAll(".player-name-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const playerId = Number(e.target.dataset.playerId);
      const player = players.find((p) => p.id === playerId);
      if (!player) return;
      player.name = e.target.value;
      renderSummary();
    });
  });
}

function makeSummaryRow(label, parTotal, start, end) {
  const row = document.createElement("tr");
  row.className = "summary-row";
  row.innerHTML = `
    <td>${label}</td>
    <td>${parTotal}</td>
    ${players.map((player) => `<td>${sumScores(player.scores, start, end)}</td>`).join("")}
  `;
  return row;
}

function renderBody() {
  scoreBody.innerHTML = "";

  holes.forEach((hole, holeIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="hole-pill">${hole}</span></td>
      <td>${pars[holeIndex]}</td>
      ${players.map((player) => `
        <td>
          <input
            class="score-input"
            type="number"
            min="1"
            max="99"
            inputmode="numeric"
            value="${player.scores[holeIndex]}"
            data-player-id="${player.id}"
            data-hole-index="${holeIndex}"
            aria-label="${player.name} hole ${hole}"
          />
        </td>
      `).join("")}
    `;
    scoreBody.appendChild(row);

    if (holeIndex === 8) {
      scoreBody.appendChild(makeSummaryRow("FRONT 9", 27, 0, 8));
    }
  });

  attachScoreEvents();
}

function renderFoot() {
  scoreFoot.innerHTML = "";
  scoreFoot.appendChild(makeSummaryRow("BACK 9", 26, 9, 17));
  scoreFoot.appendChild(makeSummaryRow("TOTAL", 53, 0, 17));
}

function attachScoreEvents() {
  document.querySelectorAll(".score-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const playerId = Number(e.target.dataset.playerId);
      const holeIndex = Number(e.target.dataset.holeIndex);
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      player.scores[holeIndex] = e.target.value;
      renderTableOnly();
      renderSummary();
    });
  });
}

function renderSummary() {
  summaryList.innerHTML = "";

  const stats = players.map((player) => {
    const front = sumScores(player.scores, 0, 8);
    const back = sumScores(player.scores, 9, 17);
    const total = front + back;
    const hasAny = player.scores.some((score) => score !== "");
    return {
      name: player.name.trim() || "Player",
      front,
      back,
      total,
      hasAny
    };
  });

  const ranked = [...stats]
    .filter((player) => player.hasAny)
    .sort((a, b) => a.total - b.total);

  players.forEach((player, index) => {
    const data = stats[index];
    const isLeader = ranked.length > 0 && ranked[0].name === data.name && ranked[0].total === data.total;

    const item = document.createElement("div");
    item.className = `summary-item${isLeader ? " leading" : ""}`;
    item.innerHTML = `
      <div class="summary-name">${escapeHtml(data.name)}</div>
      <div class="summary-data">
        <div>Front 9: <strong>${data.front}</strong></div>
        <div>Back 9: <strong>${data.back}</strong></div>
        <div>Total: <strong>${data.total}</strong></div>
      </div>
    `;
    summaryList.appendChild(item);
  });
}

function renderTableOnly() {
  renderBody();
  renderFoot();
}

function renderEverything() {
  renderHeader();
  renderBody();
  renderFoot();
  renderSummary();
}

function addPlayer() {
  if (players.length >= 4 && !noticeShown) {
    alert("The printed card says max 4 people per group. You can still add more players digitally.");
    noticeShown = true;
  }

  players.push({
    id: Date.now(),
    name: `Player ${players.length + 1}`,
    scores: Array(18).fill("")
  });

  renderEverything();
}

function removeLastPlayer() {
  if (players.length <= 1) return;
  players.pop();
  renderEverything();
}

function showScorecard() {
  scorecardView.classList.add("active-view");
  rulesView.classList.remove("active-view");
  scorecardViewBtn.classList.add("active");
  rulesViewBtn.classList.remove("active");
}

function showRules() {
  rulesView.classList.add("active-view");
  scorecardView.classList.remove("active-view");
  rulesViewBtn.classList.add("active");
  scorecardViewBtn.classList.remove("active");
}

addPlayerBtn.addEventListener("click", addPlayer);
removePlayerBtn.addEventListener("click", removeLastPlayer);
scorecardViewBtn.addEventListener("click", showScorecard);
rulesViewBtn.addEventListener("click", showRules);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
});

renderEverything();
showScorecard();