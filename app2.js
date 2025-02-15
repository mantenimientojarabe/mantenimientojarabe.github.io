// Inicializar Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCDz-lBvMN1B97fcJHOp3Q_By8CoZI-zIs",
    authDomain: "proyecto2-32df6.firebaseapp.com",
    projectId: "proyecto2-32df6",
});

var db = firebase.firestore();
var tabla = document.getElementById("tabla");
var databaseData = [];
var currentDeleteId = null;

// Notificación
function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = "block";
    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// Diálogo de confirmación
function showConfirmationDialog(id) {
    const dialog = document.getElementById("confirmationDialog");
    dialog.style.display = "block";
    currentDeleteId = id;
}

function hideConfirmationDialog() {
    const dialog = document.getElementById("confirmationDialog");
    dialog.style.display = "none";
    currentDeleteId = null;
}

document.getElementById("confirmYes").addEventListener("click", () => {
    if (currentDeleteId) {
        eliminar(currentDeleteId);
        hideConfirmationDialog();
    }
});

document.getElementById("confirmNo").addEventListener("click", hideConfirmationDialog);

// Cargar datos al inicio
cargarDatos();

// Leer documentos y actualizar la tabla
function cargarDatos() {
    console.log("Cargando datos desde Firebase...");
    db.collection("mantenimiento").onSnapshot((querySnapshot) => {
        console.log("Datos recibidos de Firebase.");
        if (querySnapshot.empty) {
            console.log("No hay documentos en la colección 'mantenimiento'.");
            return;
        }

        tabla.innerHTML = "";
        databaseData = [];

        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            databaseData.push(data);

            let fechaInicial = data.FechaInicial?.toDate().toISOString().split("T")[0] || "";
            let fechaFinal = data.FechaFinal ? data.FechaFinal.toDate().toISOString().split("T")[0] : "";
            let total = data.Total ?? calcularTotal(fechaInicial, fechaFinal);

            tabla.innerHTML += `
                <tr id="row-${doc.id}">
                    <td><input type='date' value='${fechaInicial}' id='fechaInicial-${doc.id}' disabled></td>
                    <td><input type='text' value='${data.Descripción || ""}' id='descripcion-${doc.id}' disabled></td>
                    <td><input type='text' value='${data.Tanque || ""}' id='tanque-${doc.id}' disabled></td>
                    <td><input type='text' value='${data.Área || ""}' id='area-${doc.id}' disabled></td>
                    <td><input type='date' value='${fechaFinal}' id='fechaFinal-${doc.id}' disabled></td>
                    <td id='total-${doc.id}'>${total}</td>
                    <td>
                        <button class='edit-button' id='edit-btn-${doc.id}' onclick="activarEdicion('${doc.id}')">Editar</button>
                        <button class='save-button' id='save-btn-${doc.id}' onclick="guardarEdicion('${doc.id}')" style="display:none;">Guardar</button>
                    </td>
                    <td><button class='btn-danger' onclick="showConfirmationDialog('${doc.id}')">Eliminar</button></td>
                </tr>
            `;
        });

        updateChart(databaseData); // Actualizar la gráfica con los nuevos datos
    }, (error) => {
        console.error("Error al obtener datos de Firebase:", error);
        showNotification("Error al cargar los datos.", "error");
    });
}

// Función para activar la edición de un registro
function activarEdicion(id) {
    document.querySelectorAll(`#row-${id} input`).forEach(input => input.removeAttribute("disabled"));
    document.getElementById(`edit-btn-${id}`).style.display = "none";
    document.getElementById(`save-btn-${id}`).style.display = "inline-block";
}

// Función para guardar la edición en Firebase
function guardarEdicion(id) {
    let fechaInicial = document.getElementById(`fechaInicial-${id}`).value;
    let descripcion = document.getElementById(`descripcion-${id}`).value;
    let tanque = document.getElementById(`tanque-${id}`).value;
    let area = document.getElementById(`area-${id}`).value;
    let fechaFinal = document.getElementById(`fechaFinal-${id}`).value;
    let total = calcularTotal(fechaInicial, fechaFinal);

    let nuevosValores = {
        FechaInicial: firebase.firestore.Timestamp.fromDate(new Date(fechaInicial)),
        FechaFinal: fechaFinal ? firebase.firestore.Timestamp.fromDate(new Date(fechaFinal)) : null,
        Descripción: descripcion,
        Tanque: tanque,
        Área: area,
        Total: total
    };

    db.collection("mantenimiento").doc(id).update(nuevosValores)
        .then(() => {
            showNotification("Registro actualizado correctamente.");
            cargarDatos(); // Recargar los datos y actualizar la gráfica
        })
        .catch((error) => {
            showNotification("Error al actualizar el registro.", "error");
        });
}

// Función para calcular la diferencia de días entre dos fechas
function calcularTotal(fechaInicial, fechaFinal) {
    if (!fechaFinal) return 0;
    let inicio = new Date(fechaInicial);
    let fin = new Date(fechaFinal);
    let diferencia = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    return diferencia >= 0 ? diferencia : 0;
}

// Función para eliminar un documento
function eliminar(id) {
    db.collection("mantenimiento").doc(id).delete()
        .then(() => {
            showNotification("Registro eliminado correctamente.");
            // Actualizar databaseData eliminando el registro
            databaseData = databaseData.filter(item => item.id !== id);
            // Actualizar la gráfica con los datos actualizados
            updateChart(databaseData);
        })
        .catch((error) => {
            showNotification("Error al eliminar el registro.", "error");
        });
}

// Función para buscar en la tabla
document.getElementById("searchInput").addEventListener("keyup", function() {
    let filtro = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tabla tr");
    let datosFiltrados = [];

    filas.forEach(fila => {
        if (fila.id === "") return; // Ignorar la fila de encabezado
        let id = fila.id.replace("row-", "");
        let encontrado = databaseData.some(item => item.id === id && (
            (item.FechaInicial?.toDate().toISOString().split("T")[0] || "").includes(filtro) ||
            (item.FechaFinal?.toDate().toISOString().split("T")[0] || "").includes(filtro) ||
            (item.Descripción || "").toLowerCase().includes(filtro) ||
            (item.Tanque || "").toLowerCase().includes(filtro) ||
            (item.Área || "").toLowerCase().includes(filtro)
        ));
        fila.style.display = encontrado ? "" : "none";
        if (encontrado) {
            datosFiltrados.push(databaseData.find(item => item.id === id));
        }
    });

    updateChart(datosFiltrados); // Actualizar la gráfica con los datos filtrados
});

// Función para actualizar la gráfica
function updateChart(data) {
    const ctx = document.getElementById('totalChart').getContext('2d');
    const labels = data.map(item => item.FechaInicial.toDate().toLocaleDateString('es-ES'));
    const totals = data.map(item => item.Total || calcularTotal(item.FechaInicial.toDate().toISOString().split("T")[0], item.FechaFinal?.toDate().toISOString().split("T")[0]));

    if (window.chart) {
        window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Días de diferencia',
                data: totals,
                borderColor: 'blue',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}