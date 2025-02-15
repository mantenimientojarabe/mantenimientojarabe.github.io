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

async function handleLogin(event) {
    event.preventDefault();

    // Obtener los valores de los campos de entrada
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value.trim();

    if (!username || !password) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    try {
        // Buscar el usuario en Firestore por nombre de usuario
        const userRef = db.collection("users").doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            alert('Nombre de usuario no encontrado.');
            return;
        }

        const userData = userDoc.data();
        const fakeEmail = `${username}@myapp.com`;

        // Autenticar usuario en Firebase Authentication usando el correo falso
        const userCredential = await auth.signInWithEmailAndPassword(fakeEmail, password);
        const user = userCredential.user;

        // Redirigir según el rol del usuario
        if (userData.role === "administrador") {
            window.location.href = "principal.html"; // Página de Administrador
        } else if (userData.role === "usuario") {
            window.location.href = "normal.html"; // Página de Usuario
        } else {
            alert('Rol no reconocido.');
        }
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
}