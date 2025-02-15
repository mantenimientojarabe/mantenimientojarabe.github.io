// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDz-lBvMN1B97fcJHOp3Q_By8CoZI-zIs",
    authDomain: "proyecto2-32df6.firebaseapp.com",
    projectId: "proyecto2-32df6",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const userTable = document.getElementById('userTable');
const confirmModal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
let userToDelete = null;

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

// Escuchar cambios en tiempo real y mostrar usuarios
db.collection("users").onSnapshot(snapshot => {
    userTable.innerHTML = ''; // Limpiar la tabla antes de actualizar

    snapshot.forEach(doc => {
        const userData = doc.data();
        const username = userData.username;
        const role = userData.role;
        const userId = doc.id;

        const row = document.createElement('tr');
        row.setAttribute('data-id', userId);

        row.innerHTML = `
            <td>${username}</td>
            <td>${role}</td>
            <td><button onclick="openDeleteModal('${userId}')">Eliminar</button></td>
        `;

        userTable.appendChild(row);
    });
});

// Función para abrir la ventana modal y asignar usuario a eliminar
function openDeleteModal(userId) {
    userToDelete = userId;
    confirmModal.style.display = 'flex';
}

// Evento para cerrar la ventana modal sin eliminar
confirmNo.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    userToDelete = null;
});

// Evento para eliminar el usuario seleccionado
confirmYes.addEventListener('click', async () => {
    if (userToDelete) {
        try {
            await db.collection("users").doc(userToDelete).delete();
            document.querySelector(`tr[data-id="${userToDelete}"]`).remove();
            showNotification("Usuario eliminado correctamente.", "success");
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            showNotification("No se pudo eliminar el usuario.", "error");
        }
    }
    confirmModal.style.display = 'none';
    userToDelete = null;
});
