
// js/auth.js
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Se já estiver logado, manda direto pro painel
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "painel.html";
    }
});

const loginForm = document.getElementById("login-form");
const erroMsg = document.getElementById("erro-msg");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            window.location.href = "painel.html";
        })
        .catch((error) => {
            console.error(error);
            erroMsg.innerText = "Erro: E-mail ou senha incorretos.";
        });
});
