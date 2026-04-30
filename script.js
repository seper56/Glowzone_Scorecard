const holes = Array.from({ length: 18 }, (_, i) => i + 1);
const pars = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2];

let players = [
  { id: 1, name: "NAME", scores: Array(18).fill("") },
  { id: 2, name: "NAME", scores: Array(18).fill("") },
  { id: 3, name: "NAME", scores: Array(18).fill("") },
  { id: 4, name: "NAME", scores: Array(18).fill("") }
];

const scorePanel = document.getElementById("scorePanel");
const rulesPanel = document.getElementById("rulesPanel");

const scoreHead = document.getElementById("scoreHead");
const scoreBody = document.getElementById("scoreBody");
const scoreFoot = document.getElementById("scoreFoot");
const summaryList = document.getElementById("summaryList");

const addPlayerBtn = document.getElementById("addPlayerBtn");
const removePlayerBtn = document.getElementById("removePlayerBtn");
const rulesViewBtn = document.getElementById("rulesViewBtn");
const scorecardViewBtn = document.getElementById("scorecardViewBtn");
const backToScorecardBtn = document.getElementById("backToScorecardBtn");

function sumScores(scores, start, end) {
  let total = 0;

  for (let i = start; i <= end; i++) {
    const value = parseInt(scores[i], 10);
    total += Number.isNaN(value) ? 0 : value;
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
  scoreHead.innerHTML = `
    <tr>
      <th class="hole-col">HOLE</th>
      <th class="par-col">PAR</th>
      ${players.map((player, index) => `
        <th class="player-col">
          <input
            class="player-name-input"
            type="text"
            maxlength="12"
            value="${escapeHtml(player.name)}"
            data-player-id="${player.id}"
            aria-label="Player ${index + 1} name"
          />
        </th>
      `).join("")}
    </tr>
  `;

  document.querySelectorAll(".player-name-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const player = players.find((p) => p.id === Number(event.target.dataset.playerId));
      if (!player) return;

      player.name = event.target.value;
      renderSummary();
    });
  });
}

function makeSummaryRow(label, parTotal, start, end) {
  return `
    <tr class="summary-row">
      <td>${label}</td>
      <td>${parTotal}</td>
      ${players.map((player) => `<td>${sumScores(player.scores, start, end)}</td>`).join("")}
    </tr>
  `;
}

function renderBody() {
  let html = "";

  holes.forEach((hole, holeIndex) => {
    html += `
      <tr>
        <td><span class="hole-flag">${hole}</span></td>
        <td>${pars[holeIndex]}</td>
        ${players.map((player) => `
          <td>
            <input
              class="score-input"
              type="number"
              min="0"
              inputmode="numeric"
              value="${player.scores[holeIndex]}"
              data-player-id="${player.id}"
              data-hole-index="${holeIndex}"
              aria-label="${escapeHtml(player.name)} hole ${hole}"
            />
          </td>
        `).join("")}
      </tr>
    `;

    if (holeIndex === 8) {
      html += makeSummaryRow("FRONT 9", 27, 0, 8);
    }
  });

  scoreBody.innerHTML = html;
  attachScoreEvents();
}

function renderFoot() {
  scoreFoot.innerHTML =
    makeSummaryRow("BACK 9", 26, 9, 17) +
    makeSummaryRow("TOTAL", 53, 0, 17);
}

function updateSummaryRowsOnly() {
  const frontRow = scoreBody.querySelector(".summary-row");
  if (frontRow) {
    frontRow.outerHTML = makeSummaryRow("FRONT 9", 27, 0, 8);
  }

  renderFoot();
}

function attachScoreEvents() {
  document.querySelectorAll(".score-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const player = players.find((p) => p.id === Number(event.target.dataset.playerId));
      const holeIndex = Number(event.target.dataset.holeIndex);

      if (!player) return;

      player.scores[holeIndex] = event.target.value;

      updateSummaryRowsOnly();
      renderSummary();
    });
  });
}

function renderSummary() {
  const stats = players.map((player) => {
    const front = sumScores(player.scores, 0, 8);
    const back = sumScores(player.scores, 9, 17);
    const total = front + back;
    const hasAny = player.scores.some((score) => score !== "");

    return {
      name: player.name.trim() || "NAME",
      front,
      back,
      total,
      hasAny
    };
  });

  const ranked = [...stats]
    .filter((player) => player.hasAny)
    .sort((a, b) => a.total - b.total);

  summaryList.innerHTML = stats.map((player) => {
    const isLeader =
      ranked.length > 0 &&
      player.hasAny &&
      ranked[0].name === player.name &&
      ranked[0].total === player.total;

    return `
      <div class="summary-item${isLeader ? " leading" : ""}">
        <div>${escapeHtml(player.name)}</div>
        <div>F9: ${player.front} | B9: ${player.back} | Total: ${player.total}</div>
      </div>
    `;
  }).join("");
}

function renderEverything() {
  renderHeader();
  renderBody();
  renderFoot();
  renderSummary();
}

function addPlayer() {
  players.push({
    id: Date.now(),
    name: "NAME",
    scores: Array(18).fill("")
  });

  renderEverything();
}

function removeLastPlayer() {
  if (players.length <= 1) return;

  players.pop();
  renderEverything();
}

function showRules() {
  scorePanel.classList.add("hidden");
  rulesPanel.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function showScorecard() {
  rulesPanel.classList.add("hidden");
  scorePanel.classList.remove("hidden");
  window.scrollTo(0, 0);
}

addPlayerBtn.addEventListener("click", addPlayer);
removePlayerBtn.addEventListener("click", removeLastPlayer);
rulesViewBtn.addEventListener("click", showRules);
scorecardViewBtn.addEventListener("click", showScorecard);
backToScorecardBtn.addEventListener("click", showScorecard);

renderEverything();
showScorecard();