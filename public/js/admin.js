function removeParticipant(email, eventId, type) {
  var areYouSure = confirm('Voulez-vous vraiment supprimer cet utilisateur ?');
  if (!areYouSure) return;

  fetch('/api/admin/removeUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email, eventId, type}),
  }).then((res) => {
    if (res.status === 200) {
      userAlertGood(
        'Utilisateur supprimé. Rafraichir la page pour voir les changements'
      );
    } else {
      return res.json().then((data) => {
        userAlert(data.error);
      });
    }
  });
}
