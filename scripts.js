let contact = getContact();

document.getElementById('delete-contact').addEventListener('click', deleteContact);

if (!contact) {
  // Show contact form
  document.getElementById('contact-form').style.display = 'block';
  document.getElementById('save-contact').addEventListener('click', saveContact);
} else {
  // Show contact form as disabled and scanner
  
  document.getElementById('contact-form').style.display = 'block';
  document.getElementById('contact-name').value = contact.name;
  document.getElementById('contact-email').value = contact.email;
  document.getElementById('contact-name').disabled = true;
  document.getElementById('contact-email').disabled = true;
  startScanner();
}

function getContact() {
  let contactStr = document.cookie.match('(^|[^;]+)\\s*contact\\s*=\\s*([^;]+)');
  if (contactStr) {
	return JSON.parse(contactStr.pop());
  }
  return null;
}

function saveContact() {
  let name = document.getElementById('contact-name').value.trim();
  let email = document.getElementById('contact-email').value.trim();
  if (!name || !email) {
	alert('Please enter a valid name and email.');
	return;
  }
  let contact = { name: name, email: email };
  document.cookie = 'contact=' + JSON.stringify(contact) + ';path=/';
  document.getElementById('contact-name').disabled = true;
  document.getElementById('contact-email').disabled = true;
  startScanner();
  document.getElementById('save-contact').removeEventListener('click', saveContact);
}

function deleteContact() {
  document.cookie = "contact=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.getElementById('contact-name').value = "";
  document.getElementById('contact-email').value = "";
  document.getElementById('contact-name').disabled = false;
  document.getElementById('contact-email').disabled = false;
  location.reload();
}

function startScanner() {
  // Hide contact form and show scanner
  // document.getElementById('contact-form').style.display = 'none';
  document.getElementById('scanner').style.display = 'block';

  let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function(content) {
	sendData(content);
  });
  Instascan.Camera.getCameras().then(function(cameras) {
	if (cameras.length > 0) {
    scanner.start(-1);
	} else {
	  console.error('No cameras found.');
	}
  }).catch(function(e) {
	console.error(e);
  });

  function sendData(studentURL) {
	let contact = getContact();
	let data = { studentURL: studentURL, companyContact: contact };
	fetch('https://prod-117.westeurope.logic.azure.com:443/workflows/6063fa4dc6e74fd79450369e4907d8cb/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NRqi05Ha0BSJ-04XzI_YzjymY9bPjtAYP8qQ5FBqLZ8', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(data)
  })
  .then(response => {
	if (!response.ok) {
	  throw new Error('Network response was not ok');
	}
	console.log('QR code data sent successfully');
	scanner.stop();
	document.getElementById('student-cv').href = studentURL;
	document.getElementById('message').style.display = 'block';
	document.getElementById('restart-scanner').style.display = 'block';
	document.getElementById('preview').style.display = 'none';
	document.getElementById('restart-scanner').addEventListener('click', restartScanner);
  })
  .catch(error => {
	console.error('Error sending QR code data:', error);
  });
}

function restartScanner() {
  // Hide message and restart scanner
  document.getElementById('student-cv').href = "";
  document.getElementById('preview').style.display = 'block';
  document.getElementById('message').style.display = 'none';
  document.getElementById('restart-scanner').style.display = 'none';
  startScanner();
}}
