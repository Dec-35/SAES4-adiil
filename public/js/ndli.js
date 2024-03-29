const rooms = document.querySelectorAll('path');

const svg = document.querySelector('svg');
const svgRect = svg.getBoundingClientRect();
var svgWidth = svgRect.width;

// Calculate the offset of the SVG within the flexbox layout
var svgOffsetLeft = svgRect.left;
var svgOffsetTop = svgRect.top;

rooms.forEach((room) => {
  const id = room.getAttribute('id');
  if (!id) return;

  // Add a label for each room based on their ID
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.innerText = id;

  // Get the x and y coordinates for the room
  const roomBoundingBox = room.getBBox();
  const roomX = roomBoundingBox.x + roomBoundingBox.width / 2;
  const roomY = roomBoundingBox.y + roomBoundingBox.height / 2;

  // Calculate the scaling factor for the SVG
  const svgScalingFactor = svgWidth / svg.viewBox.baseVal.width;

  // Adjust positions based on SVG scaling factor, body padding, and SVG offset
  const scaledRoomX = roomX * svgScalingFactor + svgOffsetLeft;
  const scaledRoomY = roomY * svgScalingFactor + svgOffsetTop;

  // Set the label's position based on the adjusted room coordinates
  label.style.position = 'absolute';
  label.style.left = `${scaledRoomX}px`;
  label.style.top = `${scaledRoomY}px`;

  document.body.appendChild(label);

  room.addEventListener('click', () => {
    showTeamsFromRoom(id);
  });
});

//refresh the label positions on window resize
window.addEventListener('resize', refreshSvgs);

function refreshSvgs() {
  //update the SVG offset
  svgWidth = svg.getBoundingClientRect().width;
  svgOffsetLeft = svg.getBoundingClientRect().left;
  svgOffsetTop = svg.getBoundingClientRect().top;

  const labels = document.querySelectorAll('label');
  labels.forEach((label) => {
    const id = label.getAttribute('for');
    const room = document.querySelector(`#${id}`);

    const roomBoundingBox = room.getBBox();
    const roomX = roomBoundingBox.x + roomBoundingBox.width / 2;
    const roomY = roomBoundingBox.y + roomBoundingBox.height / 2;

    const svgScalingFactor = svgWidth / svg.viewBox.baseVal.width;

    const scaledRoomX = roomX * svgScalingFactor + svgOffsetLeft;
    const scaledRoomY = roomY * svgScalingFactor + svgOffsetTop;

    label.style.left = `${scaledRoomX}px`;
    label.style.top = `${scaledRoomY}px`;
  });
}

async function showTeamsFromRoom(id) {
  const teamContainer = document.querySelector('.teamContainer');
  teamContainer.style.display = 'flex';
  teamContainer.querySelector('h2').innerText = 'Salle : ' + id;
  const boxes = teamContainer.querySelectorAll('.newTeamBox');
  boxes.forEach((box) => {
    box.remove();
  });

  const teams = await getTeamsForRoom(id);
  teams.forEach((team) => {
    const teamBox = teamContainer.querySelector('.team');
    const teamName = team.name;
    const teamMembers = team.members;
    const teamList = teamBox.querySelector('ul');
    teamList.innerHTML = '';

    teamMembers.forEach((member) => {
      const memberLi = document.createElement('li');
      memberLi.innerText = member;
      teamList.appendChild(memberLi);
    });

    teamBox.querySelector('h3').innerText = teamName;

    teamBox.querySelector('.showList').addEventListener('click', () => {
      teamList.style.display = 'block';
    });
    //duplicate the box
    const newTeamBox = teamBox.cloneNode(true);
    newTeamBox.style.display = 'block';
    newTeamBox.classList.add('newTeamBox');
    teamContainer.appendChild(newTeamBox);
  });
}

async function getTeamsForRoom(id) {
  try {
    const response = await fetch('/api/ndli/getTeams', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        room: id,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return data.teams;
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // or handle the error as needed
  }
}

function closeOverlay() {
  const teamContainer = document.querySelector('.teamContainer');
  teamContainer.style.display = 'none';
}

document.querySelector('.teamContainer').addEventListener('click', (e) => {
  if (e.target.classList.contains('teamContainer')) {
    closeOverlay();
  }
});

const searchInput = document.getElementById('searchRoomInput');
searchInput.addEventListener('keyup', () => {
  const name = searchInput.value;
  searchRoomForName(name);
});

const searchButton = document.getElementById('searchRoomButton');
searchButton.addEventListener('click', () => {
  const name = searchInput.value;
  searchRoomForName(name);
});

const searchResults = document.getElementById('searchResults');
function searchRoomForName(name) {
  if (name === '') {
    searchResults.innerHTML = '';
    searchResults.classList.remove('show');
    refreshSvgs();
    return;
  }
  searchResults.classList.add('show');

  fetch('/api/ndli/getRoom', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      name: name,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        searchResults.innerHTML = '';
        const results = data.results;
        results.forEach((result) => {
          const member = document.createElement('h4');
          member.innerText = result.member;
          const room = document.createElement('p');
          room.innerText = result.room;

          const roomBox = document.createElement('div');
          roomBox.classList.add('longFlex');
          roomBox.classList.add('roomBox');
          roomBox.addEventListener('click', () => {
            highlightRoom(result.room);
          });

          roomBox.appendChild(member);
          roomBox.appendChild(room);

          searchResults.appendChild(roomBox);
        });
      } else {
        searchResults.innerText = data.reason;
      }
      refreshSvgs();
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
}

function clearSearch() {
  searchInput.value = '';
  searchRoomForName('');
}

function highlightRoom(roomName) {
  const room = document.getElementById(roomName);
  if (roomName === 'Mordor') {
    alert(
      "La salle est au rez de chaussez (elle n'est pas affichée sur le plan)"
    );
    return;
  }
  room.style.fill = '#d6b3ac';
  setTimeout(() => {
    room.style.fill = 'var(--salleColor)';
  }, 500);
}
