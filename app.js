firebase.initializeApp({
    apiKey: "AIzaSyCDz-lBvMN1B97fcJHOp3Q_By8CoZI-zIs",
    authDomain: "proyecto2-32df6.firebaseapp.com",
    projectId: "proyecto2-32df6",
});

var db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("boton").addEventListener("click", guardar);
});

function mostrarNotificacion(mensaje, tipo = "success") {
    var notificacion = document.getElementById("notification");
    notificacion.textContent = mensaje;
    notificacion.style.backgroundColor = tipo === "error" ? "#dc3545" : "#28a745";
    notificacion.style.top = "10px";

    setTimeout(() => {
        notificacion.style.top = "-50px";
    }, 3000);
}

function guardar(event) {
    event.preventDefault();

    var startDateValue = document.getElementById("startDate").value;
    var endDateValue = document.getElementById("endDate").value;

    if (!startDateValue) {
        mostrarNotificacion("Por favor, selecciona una Fecha Inicial.", "error");
        return;
    }

    var FechaInicial = new Date(startDateValue);
    var FechaFinal = endDateValue ? new Date(endDateValue) : null;

    if (isNaN(FechaInicial.getTime())) {
        mostrarNotificacion("La Fecha Inicial es inválida.", "error");
        return;
    }
    if (FechaFinal && isNaN(FechaFinal.getTime())) {
        mostrarNotificacion("La Fecha Final es inválida.", "error");
        return;
    }

    var Descripción = document.getElementById("description").value;
    var Tanque = document.getElementById("tank").value;
    var Área = document.getElementById("area").value;

    db.collection("mantenimiento").add({
        FechaInicial: firebase.firestore.Timestamp.fromDate(FechaInicial),
        FechaFinal: FechaFinal ? firebase.firestore.Timestamp.fromDate(FechaFinal) : null,
        Descripción: Descripción,
        Tanque: Tanque,
        Área: Área
    })
    .then(function(docRef) {
        mostrarNotificacion("Datos guardados correctamente.");
        document.getElementById("dataForm").reset();
    })
    .catch(function(error) {
        mostrarNotificacion("Error al guardar los datos.", "error");
    });
}
