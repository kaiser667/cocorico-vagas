// Configurações do Firebase
var firebaseConfig = {
    apiKey: "AIzaSyADo00TjuhutvIKrGSfc2VV_sY8fnPlOtI",
    authDomain: "cocorico-9ee1d.firebaseapp.com",
    projectId: "cocorico-9ee1d",
    storageBucket: "cocorico-9ee1d.appspot.com",
    messagingSenderId: "849216569702",
    appId: "1:849216569702:web:213adf6e40ad92238288a7",
};
firebase.initializeApp(firebaseConfig);

// Inicializa serviços do Firebase
var auth = firebase.auth();
var db = firebase.firestore();
var clickCount = 0;
var maxClicks = 2;
var allowedEmails = ['zeusbruno01@gmail.com']; // Substitua pelo seu email

// Função para carregar dados do Firestore e preencher a lista de usuários
function loadData() {
    db.collection("clicks").doc("counter").get().then((doc) => {
        if (doc.exists) {
            clickCount = doc.data().count;
            document.getElementById('click-count').innerText = "Vagas preenchidas: " + clickCount;
        }
    });

    db.collection("clicks").doc("users").get().then((doc) => {
        if (doc.exists) {
            var names = doc.data().names;
            var userList = document.getElementById('user-list');
            userList.innerHTML = "";
            names.forEach(name => {
                var userItem = document.createElement('div');
                userItem.textContent = name;
                userList.appendChild(userItem);
            });
        }
    });

    db.collection("clicks").doc("reservations").get().then((doc) => {
        if (doc.exists) {
            var reservations = doc.data().names;
            reservations.forEach(reservation => {
                var reservationItem = document.createElement('div');
                reservationItem.textContent = reservation;
                document.getElementById('user-list').appendChild(reservationItem);
            });
        }
    });
}

// Função para lidar com o clique no botão
function handleClick() {
    var user = firebase.auth().currentUser;
    if (user) {
        db.collection("clicks").doc("counter").get().then((doc) => {
            if (doc.exists) {
                clickCount = doc.data().count;
                if (clickCount < maxClicks) {
                    clickCount++;
                    db.collection("clicks").doc("counter").set({ count: clickCount });
                    db.collection("clicks").doc("users").update({
                        names: firebase.firestore.FieldValue.arrayUnion(user.displayName)
                    });
                    document.getElementById('click-count').innerText = "Vagas preenchidas: " + clickCount;
                    var userList = document.getElementById('user-list');
                    var userItem = document.createElement('div');
                    userItem.textContent = user.displayName;
                    userList.appendChild(userItem);
                } else {
                    db.collection("clicks").doc("reservations").update({
                        names: firebase.firestore.FieldValue.arrayUnion(user.displayName + " (Reserva)")
                    });
                    var userList = document.getElementById('user-list');
                    var userItem = document.createElement('div');
                    userItem.textContent = user.displayName + " (Reserva)";
                    userList.appendChild(userItem);
                    alert("Todas as vagas foram preenchidas. Você está na lista de espera (reserva).");
                }
            } else {
                db.collection("clicks").doc("counter").set({ count: 1 });
                db.collection("clicks").doc("users").set({ names: [user.displayName] });
                document.getElementById('click-count').innerText = "Vagas preenchidas: 1";
                var userList = document.getElementById('user-list');
                var userItem = document.createElement('div');
                userItem.textContent = user.displayName;
                userList.appendChild(userItem);
            }
        });
    } else {
        alert("Por favor, faça login para registrar sua participação.");
    }
}

// Função para resetar a contagem
function resetCount() {
    var user = firebase.auth().currentUser;
    if (user && allowedEmails.includes(user.email)) {
        db.collection("clicks").doc("counter").set({ count: 0 });
        db.collection("clicks").doc("users").set({ names: [] });
        db.collection("clicks").doc("reservations").set({ names: [] });
        document.getElementById('click-count').innerText = "Vagas preenchidas: 0";
        document.getElementById('user-list').innerHTML = "";
        alert("Contagem resetada com sucesso.");
    } else {
        alert("Apenas administradores podem resetar a contagem.");
    }
}

// Função de login
function login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
        var user = result.user;
        document.getElementById('login-button').style.display = 'none';
        document.getElementById('logout-button').style.display = 'block';
        if (allowedEmails.includes(user.email)) {
            document.getElementById('reset-button').style.display = 'block';
        }
    }).catch((error) => {
        console.log(error);
    });
}

// Função de logout
function logout() {
    firebase.auth().signOut().then(() => {
        document.getElementById('login-button').style.display = 'block';
        document.getElementById('logout-button').style.display = 'none';
        document.getElementById('reset-button').style.display = 'none';
    }).catch((error) => {
        console.log(error);
    });
}

// Chama a função para carregar os dados ao carregar a página
window.onload = function() {
    loadData();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            document.getElementById('login-button').style.display = 'none';
            document.getElementById('logout-button').style.display = 'block';
            if (allowedEmails.includes(user.email)) {
                document.getElementById('reset-button').style.display = 'block';
            }
        } else {
            document.getElementById('login-button').style.display = 'block';
            document.getElementById('logout-button').style.display = 'none';
            document.getElementById('reset-button').style.display = 'none';
        }
    });
};
