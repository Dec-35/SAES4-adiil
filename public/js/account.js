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
      data.purchases.forEach((purchase) => {
        const itemCard = createItemCard(purchase);
        achatsContainer.appendChild(itemCard);
      });
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

  const itemImage = document.createElement('img');
  itemImage.classList.add('itemImage');
  itemImage.src = item.image;

  const itemDesc = document.createElement('div');
  itemDesc.classList.add('itemDesc');
  itemDesc.innerHTML = `<h3>${
    item.name
  }</h3><p>Acheté le ${item.purchaseDate.toLocaleString(
    'fr-FR'
  )}</p><h3 class='itemPrice'>${item.price}</h3>`;

  card.appendChild(itemImage);
  card.appendChild(itemDesc);

  return card;
}
