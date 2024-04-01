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
      console.log(data.purchases);
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

  const itemImage = document.createElement('img');
  itemImage.classList.add('itemImage');
  itemImage.src = item.image;

  const itemDesc = document.createElement('div');
  itemDesc.classList.add('itemDesc');
  itemDesc.innerHTML = `<h3>${
    item.item_name
  }</h3><p>Acheté le ${item.purchase_date.toLocaleString(
    'fr-FR'
  )}</p><h3 class='itemPrice'>${item.item_price}</h3>`;

  card.appendChild(itemImage);
  card.appendChild(itemDesc);

  return card;
}
