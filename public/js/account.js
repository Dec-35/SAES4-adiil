const achatsContainer = document.getElementById('achats');

fetch('/api/user/purchases', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      if (data.purchases.length === 0) {
        const noPurchase = document.createElement('h4');
        noPurchase.innerText = "Vous n'avez pas encore effectué d'achat";
        achatsContainer.appendChild(noPurchase);
      } else {
        data.purchases.forEach((purchase) => {
          const itemCard = createItemCard(purchase);
          achatsContainer.appendChild(itemCard);
        });
      }
    } else {
      alert('Error getting user purchases');
    }
  });

function createItemCard(item) {
  const card = document.createElement('div');
  card.classList.add('itemCard');
  card.onclick = () => {
    showCardDetails(item);
  };

  if (item.is_canceled) {
    card.classList.add('canceled');
  }

  const itemImage = document.createElement('img');
  itemImage.classList.add('itemImage');
  itemImage.src = item.image;
  if (item.type === 'grade') {
    itemImage.style.setProperty('object-fit', 'scale-down');
  } else {
    itemImage.style.setProperty('object-fit', 'cover');
  }

  const itemDesc = document.createElement('div');
  itemDesc.classList.add('itemDesc');
  itemDesc.innerHTML = `<h3>${item.item_name}</h3><p>Acheté le ${new Date(
    item.purchase_date
  ).toLocaleDateString(
    'fr-FR'
  )}</p><h3 class='itemPrice'>${item.item_price.toFixed(2)} €</h3>`;

  card.appendChild(itemImage);
  card.appendChild(itemDesc);

  return card;
}

function showCardDetails(purchase) {
  const info = document.getElementById('overlay');
  info.classList.toggle('visible');
  // Close the overlay when clicking outside of it
  info.onclick = (e) => {
    if (e.target.id === 'overlay') {
      info.classList.toggle('visible');
    }
  };

  const itemImage = document.getElementById('image');
  itemImage.style.setProperty('--image-url', `url(${purchase.image})`);

  if (purchase.type === 'grade') {
    itemImage.style.setProperty('background-size', 'auto 90%');
  } else {
    itemImage.style.setProperty('background-size', 'cover');
  }

  document.getElementById('eventTitle').innerHTML = '';
  document.getElementById('eventTitle').innerText = purchase.item_name;
  if (purchase.is_canceled) {
    const canceled = document.createElement('p');
    canceled.id = 'canceled';
    canceled.innerText = 'Annulé';
    document.getElementById('eventTitle').appendChild(canceled);

    document.getElementById('remboursementButton').style.display = 'none';
  } else {
    document.getElementById('remboursementButton').style.display = 'block';
  }

  //remove all the children of the showMore div excpet the #eventDescription
  const showMore = document.getElementById('showMore');
  showMore.innerHTML = '<p id="eventDescription"></p>';

  document.getElementById('eventDescription').innerText = purchase.description;

  if (purchase.type === 'event') {
    const location = document.createElement('p');
    location.id = 'eventLocation';
    location.className = 'icons';
    location.innerText = purchase.location;

    const eventFullTime = new Date(purchase.eventDate);
    const eventDate = eventFullTime.toLocaleDateString('default', {
      month: 'long',
      day: 'numeric',
    });
    const eventTime = eventFullTime.toLocaleTimeString('fr-FR', {
      hour: 'numeric',
      minute: 'numeric',
    });
    const eventDateTime = `Le ${eventDate} à ${eventTime}`;

    const time = document.createElement('p');
    time.id = 'eventTime';
    time.className = 'icons';
    time.innerText = eventDateTime;

    document.getElementById('showMore').appendChild(location);
    document.getElementById('showMore').appendChild(time);
  }

  if (purchase.type === 'product') {
    let newName = purchase.item_name;
    //remove the (size) form the name
    if (newName.includes('(')) {
      newName = newName.slice(0, newName.indexOf('('));
    }

    itemImage.style.cursor = 'pointer';
    itemImage.onclick = () => {
      window.location.href = `/shop/product/archive/${newName}`;
    };
  } else {
    itemImage.style.cursor = 'default';
    itemImage.onclick = () => {};
  }

  document.getElementById('itemCardPrice').innerText =
    purchase.item_price.toFixed(2) + ' €';
  const purchaseDate = new Date(purchase.purchase_date);
  const month = purchaseDate.toLocaleString('default', {month: 'long'});
  const formattedDate = `Acheté le ${purchaseDate.getDate()} ${month} ${purchaseDate.getFullYear()}`;
  document.querySelector('#priceAndDate > p').innerText = formattedDate;
}
