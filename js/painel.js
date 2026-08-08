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
    // Já converte a vírgula para ponto caso você digite no formulário
    const divida = parseFloat(document.getElementById("divida-inicial").value.replace(',', '.'));

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
                Dívida: <span class="${cliente.divida > 0 ? 'texto-vermelho' : 'texto-verde'}">R$ ${cliente.divida.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="acoes">
                <button style="background: #28a745; color: white;" onclick="abaterValor('${documento.id}', ${cliente.divida})">💰 Abater</button>
                <button style="background: #ffc107; color: black;" onclick="aumentarDivida('${documento.id}', ${cliente.divida})">📝 Mais Fiado</button>
            </div>
        `;
        listaClientes.appendChild(div);
    });
}

// 1. Função para PAGAMENTO (Diminuir a dívida)
window.abaterValor = async (id, dividaAtual) => {
    let valorDigitado = prompt("Quanto o cliente está pagando agora? (Ex: 15,50)");
    
    if (!valorDigitado) return; // Cancela se apertar "Cancelar"

    // Troca a vírgula do Brasil por ponto para o sistema entender
    let valor = parseFloat(valorDigitado.replace(',', '.'));

    if (isNaN(valor) || valor <= 0) {
        alert("Valor inválido! Digite apenas números positivos.");
        return;
    }

    let novaDivida = dividaAtual - valor;
    if (novaDivida < 0) novaDivida = 0; // Não deixa a dívida ficar negativa

    await updateDoc(doc(db, "clientes", id), { divida: novaDivida });
    carregarClientes();
};

// 2. Função para NOVA COMPRA (Aumentar a dívida)
window.aumentarDivida = async (id, dividaAtual) => {
    let valorDigitado = prompt("Qual o valor da nova compra fiado? (Ex: 20,00)");
    
    if (!valorDigitado) return;

    let valor = parseFloat(valorDigitado.replace(',', '.'));

    if (isNaN(valor) || valor <= 0) {
        alert("Valor inválido! Digite apenas números positivos.");
        return;
    }

    let novaDivida = dividaAtual + valor;

    await updateDoc(doc(db, "clientes", id), { divida: novaDivida });
    carregarClientes();
};

// ================= GESTÃO DE ESTOQUE =================
const formEstoque = document.getElementById("form-estoque");
const listaEstoque = document.getElementById("lista-estoque");

formEstoque.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome-produto").value;
    const qtd = parseInt(document.getElementById("qtd-produto").value);
    const preco = parseFloat(document.getElementById("preco-produto").value.replace(',', '.'));

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
                <strong>${produto.nome}</strong> (R$ ${produto.preco.toFixed(2).replace('.', ',')})<br> 
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
    if(confirm("Tem certeza que deseja excluir este produto do estoque?")) {
        await deleteDoc(doc(db, "estoque", id));
        carregarEstoque();
    }
};
