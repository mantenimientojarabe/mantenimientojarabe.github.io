// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDz-lBvMN1B97fcJHOp3Q_By8CoZI-zIs",
    authDomain: "proyecto2-32df6.firebaseapp.com",
    projectId: "proyecto2-32df6",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

async function handleAddUser(event) {
    event.preventDefault();

    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value.trim();
    const userType = document.querySelector('#userType').value;

    if (!username || !password || !userType) {
        showNotification('Por favor, complete todos los campos.', 'error');
        return;
    }

    try {
        // Verificar si el nombre de usuario ya existe
        const userRef = db.collection("users").doc(username);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            showNotification('El nombre de usuario ya está en uso.', 'error');
            return;
        }

        // Crear usuario en Firebase Auth usando un correo falso
        const fakeEmail = `${username}@myapp.com`;
        const userCredential = await auth.createUserWithEmailAndPassword(fakeEmail, password);
        const user = userCredential.user;

        // Guardar el usuario en Firestore
        await userRef.set({
            uid: user.uid,
            username: username,
            role: userType
        });

        showNotification('Usuario registrado exitosamente.', 'success');

        // Limpiar formulario
        document.querySelector('#username').value = '';
        document.querySelector('#password').value = '';
        document.querySelector('#userType').value = '';
    } catch (error) {
        showNotification('Error al registrar usuario: ' + error.message, 'error');
    }
}

// Función para mostrar notificaciones en pantalla
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? 'green' : 'red';
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
