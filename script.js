const playerForm = document.getElementById("player-form");
const playerList = document.getElementById("player-list");
const teamsContainer = document.getElementById("teams-container");
const numTeamsInput = document.getElementById("num-teams");
const createTeamsButton = document.getElementById("create-teams");
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");

let players = JSON.parse(localStorage.getItem("players")) || [];
let recentTeams = []; // Хранение последних двух составов

function updatePlayerList() {
    playerList.innerHTML = "";
    if (players.length === 0) {
        playerList.innerHTML = "<p class='text-muted'>Список игроков пуст. Добавьте игроков выше.</p>";
        return;
    }
    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div>
                <input type="checkbox" class="select-player" data-index="${index}">
                ${player.name} - Атака: ${player.attack}, Полузащита: ${player.midfield}, Защита: ${player.defense}
            </div>
            <div>
                <button class="btn btn-sm btn-warning" onclick="editPlayer(${index})">Редактировать</button>
                <button class="btn btn-sm btn-danger" onclick="removePlayer(${index})">Удалить</button>
            </div>
        `;
        playerList.appendChild(li);
    });
}

function removePlayer(index) {
    players.splice(index, 1);
    localStorage.setItem("players", JSON.stringify(players));
    updatePlayerList();
}

function editPlayer(index) {
    const player = players[index];
    document.getElementById("edit-index").value = index;
    document.getElementById("edit-name").value = player.name;
    document.getElementById("edit-attack").value = player.attack;
    document.getElementById("edit-midfield").value = player.midfield;
    document.getElementById("edit-defense").value = player.defense;
    editModal.style.display = "block";
}

function closeEditModal() {
    editModal.style.display = "none";
}

editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = document.getElementById("edit-index").value;
    const name = document.getElementById("edit-name").value.trim();
    const attack = parseInt(document.getElementById("edit-attack").value);
    const midfield = parseInt(document.getElementById("edit-midfield").value);
    const defense = parseInt(document.getElementById("edit-defense").value);

    if (!name || isNaN(attack) || isNaN(midfield) || isNaN(defense)) {
        alert("Пожалуйста, заполните все поля корректно.");
        return;
    }

    players[index] = { name, attack, midfield, defense };
    localStorage.setItem("players", JSON.stringify(players));
    closeEditModal();
    updatePlayerList();
});

playerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("player-name").value.trim();
    const attack = parseInt(document.getElementById("player-attack").value);
    const midfield = parseInt(document.getElementById("player-midfield").value);
    const defense = parseInt(document.getElementById("player-defense").value);

    if (!name || isNaN(attack) || isNaN(midfield) || isNaN(defense)) {
        alert("Пожалуйста, заполните все поля корректно.");
        return;
    }

    players.push({ name, attack, midfield, defense });
    localStorage.setItem("players", JSON.stringify(players));
    updatePlayerList();

    playerForm.reset();
});

createTeamsButton.addEventListener("click", () => {
    const numTeams = parseInt(numTeamsInput.value);
    const selectedPlayers = players.filter((_, index) =>
        document.querySelector(`.select-player[data-index="${index}"]`).checked
    );

    if (numTeams < 2 || selectedPlayers.length < numTeams) {
        alert("Недостаточно игроков или команд.");
        return;
    }

    let newTeams;
    while (true) {
        newTeams = generateBalancedTeams(shuffleArray(selectedPlayers), numTeams);
        if (!isRecentTeam(newTeams)) {
            break;
        }
    }

    recentTeams.push(newTeams);
    if (recentTeams.length > 2) recentTeams.shift();

    renderTeams(newTeams);
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateBalancedTeams(players, numTeams) {
    const teams = Array.from({ length: numTeams }, () => ({ attack: 0, midfield: 0, defense: 0, players: [] }));

    // Сортировка игроков по общей силе (сумма характеристик)
    players.sort((a, b) => (b.attack + b.midfield + b.defense) - (a.attack + a.midfield + a.defense));

    // Жадный алгоритм распределения
    for (const player of players) {
        teams.sort((a, b) =>
            (a.attack + a.midfield + a.defense) - (b.attack + b.midfield + b.defense)
        );
        teams[0].players.push(player);
        teams[0].attack += player.attack;
        teams[0].midfield += player.midfield;
        teams[0].defense += player.defense;
    }

    return teams.map((team) => team.players);
}

function isRecentTeam(newTeams) {
    const teamStrings = newTeams.map((team) =>
        team.map((player) => player.name).sort().join(",")
    );

    return recentTeams.some((recent) => {
        const recentStrings = recent.map((team) =>
            team.map((player) => player.name).sort().join(",")
        );
        return JSON.stringify(teamStrings) === JSON.stringify(recentStrings);
    });
}

function renderTeams(teams) {
    teamsContainer.innerHTML = "";
    teams.forEach((team, i) => {
        const teamDiv = document.createElement("div");
        teamDiv.className = "card mb-3";
        teamDiv.innerHTML = `
            <div class="card-header">Команда ${i + 1}</div>
            <ul class="list-group list-group-flush">
                ${team.map((p) => `<li class="list-group-item">${p.name}</li>`).join("")}
            </ul>
        `;
        teamsContainer.appendChild(teamDiv);
    });
}

updatePlayerList();
