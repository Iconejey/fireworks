$('#auth').onclick = async () => {
	const success = await authenticate(true);
	if (success) onAuth();
};

async function onAuth() {
	$('#out').disabled = false;
	$('#write').disabled = false;

	const data = await getAccountInfo();
	const { name, email } = data;
	$('#name').innerText = name;
	$('#email').innerText = email;
}

$('#out').onclick = signOut;

STORAGE.onChange(console.log);
$('#write').onclick = e => STORAGE.write('test.txt', 'Hello, World!');

if (userSignedIn()) onAuth();
