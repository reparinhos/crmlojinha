
// js/painel.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// PROTEÇÃO DE ROTA: Verifica se está logado
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html"; // Expulsa se não estiver logado
    } else {
        carregarClientes();
        carregarEstoque();
    }
});

// SAIR DO SISTEMA
document.getElementById("btn-sair").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "index.html");
});

// ================= GESTÃO DE CLIENTES (FIADOS) =================
const formCliente = document.getElementById("form-cliente");
const listaClientes = document.getElementById("lista-clientes");

formCliente.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome-cliente").value;
    const divida = parseFloat(document.getElementById("divida-inicial").value);

    await addDoc(collection(db, "clientes"), { nome, divida });
    formCliente.reset();
    carregarClientes();
});

async function carregarClientes() {
    listaClientes.innerHTML = "<p>Carregando...</p>";
    const querySnapshot = await getDocs(collection(db, "clientes"));
    listaClientes.innerHTML = "";
    
    querySnapshot.forEach((documento) => {
        const cliente = documento.data();
        const div = document.createElement("div");
        div.className = "item-lista";
        div.innerHTML = `
            <div>
                <strong>${cliente.nome}</strong> <br> 
                Dívida: <span class="${cliente.divida > 0 ? 'texto-vermelho' : 'texto-verde'}">R$ ${cliente.divida.toFixed(2)}</span>
            </div>
            <div class="acoes">
                <button onclick="alterarDivida('${documento.id}', ${cliente.divida}, -10)">Abater R$10</button>
                <button onclick="alterarDivida('${documento.id}', ${cliente.divida}, 10)">+ R$10 (Fiado)</button>
            </div>
        `;
        listaClientes.appendChild(div);
    });
}

window.alterarDivida = async (id, dividaAtual, valorMudanca) => {
    const novaDivida = dividaAtual + valorMudanca;
    await updateDoc(doc(db, "clientes", id), { divida: novaDivida < 0 ? 0 : novaDivida });
    carregarClientes();
};

// ================= GESTÃO DE ESTOQUE =================
const formEstoque = document.getElementById("form-estoque");
const listaEstoque = document.getElementById("lista-estoque");

formEstoque.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome-produto").value;
    const qtd = parseInt(document.getElementById("qtd-produto").value);
    const preco = parseFloat(document.getElementById("preco-produto").value);

    await addDoc(collection(db, "estoque"), { nome, qtd, preco });
    formEstoque.reset();
    carregarEstoque();
});

async function carregarEstoque() {
    listaEstoque.innerHTML = "<p>Carregando...</p>";
    const querySnapshot = await getDocs(collection(db, "estoque"));
    listaEstoque.innerHTML = "";
    
    querySnapshot.forEach((documento) => {
        const produto = documento.data();
        const div = document.createElement("div");
        div.className = "item-lista";
        div.innerHTML = `
            <div>
                <strong>${produto.nome}</strong> (R$ ${produto.preco.toFixed(2)})<br> 
                Qtd no Estoque: <strong>${produto.qtd}</strong>
            </div>
            <div class="acoes">
                <button onclick="alterarEstoque('${documento.id}', ${produto.qtd}, -1)">Vendeu 1</button>
                <button onclick="alterarEstoque('${documento.id}', ${produto.qtd}, 1)">Repôs 1</button>
                <button class="btn-danger" onclick="excluirProduto('${documento.id}')">Excluir</button>
            </div>
        `;
        listaEstoque.appendChild(div);
    });
}

window.alterarEstoque = async (id, qtdAtual, valorMudanca) => {
    const novaQtd = qtdAtual + valorMudanca;
    await updateDoc(doc(db, "estoque", id), { qtd: novaQtd < 0 ? 0 : novaQtd });
    carregarEstoque();
};

window.excluirProduto = async (id) => {
    if(confirm("Tem certeza que deseja excluir?")) {
        await deleteDoc(doc(db, "estoque", id));
        carregarEstoque();
    }
};
