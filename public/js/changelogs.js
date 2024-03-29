const list = document.querySelector('#changelogsList');

fetch('/api/getChangelogs')
  .then((response) => response.json())
  .then((data) => {
    const datalist = data.changelogsArray;
    datalist.forEach((changelog) => {
      const li = document.createElement('li');
      li.setAttribute('class', 'list-group-item');
      li.setAttribute('id', changelog);
      li.innerHTML = `<a href="/changelogs/${changelog}">${changelog}</a>`;
      list.appendChild(li);
    });
  });
