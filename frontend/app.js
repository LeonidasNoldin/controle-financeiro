// ===== Configuração =====
const API = "http://localhost:8080";
// Valores do enum TipoMovimentacao no seu back-end. Se o nome da saída for outro, troque aqui.
const ENTRADA = "ENTRADA";
const SAIDA = "SAIDA";

const $ = (id) => document.getElementById(id);
const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const dataBR = (iso) => iso.split("-").reverse().join("/");
const hoje = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso local

let usuario = JSON.parse(localStorage.getItem("moneta_usuario") || "null");
let movs = [];
let tipoAtual = SAIDA;

// ===== API =====
async function lerErro(r) {
  const texto = await r.text();
  try {
    const obj = JSON.parse(texto);
    if (typeof obj === "string") return obj;
    return obj.message || Object.values(obj).join(" · ");
  } catch {
    return texto || "Erro " + r.status;
  }
}

async function req(caminho, opcoes) {
  let r;
  try {
    r = await fetch(API + caminho, opcoes);
  } catch {
    throw new Error("Não foi possível falar com a API. Confira se ela está rodando na porta 8080.");
  }
  if (!r.ok) throw new Error(await lerErro(r));
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

const postJSON = (caminho, corpo) =>
  req(caminho, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

// ===== Interface =====
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function abrirApp() {
  $("acesso").hidden = true;
  $("app").hidden = false;
  $("saudacao").textContent = `${saudacao()}, ${usuario.nome.split(" ")[0]}`;
  $("user-nome").textContent = usuario.nome;
  $("user-email").textContent = usuario.email;
  $("avatar").textContent = usuario.nome[0].toUpperCase();
  carregar();
}

function entrar(u) {
  usuario = u;
  localStorage.setItem("moneta_usuario", JSON.stringify(u));
  abrirApp();
}

async function carregar() {
  carregando();
  try {
    const [lista, saldo] = await Promise.all([
      req(`/movimentacoes/usuario?usuarioId=${usuario.id}`),
      req(`/movimentacoes/total?usuarioId=${usuario.id}`),
    ]);
    movs = lista;
    $("kpi-saldo").textContent = brl(saldo);
    desenhar();
    desenharGraficos();
  } catch (e) {
    falhou(e.message);
  }
}

function celula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

function desenhar() {
  const entradas = movs.filter((m) => m.tipo === ENTRADA);
  const saidas = movs.filter((m) => m.tipo !== ENTRADA);
  const soma = (l) => l.reduce((s, m) => s + Number(m.valor), 0);
  $("kpi-entradas").textContent = brl(soma(entradas));
  $("kpi-saidas").textContent = brl(soma(saidas));
  $("kpi-qtd-ent").textContent = `${entradas.length} ${entradas.length === 1 ? "lançamento" : "lançamentos"}`;
  $("kpi-qtd-sai").textContent = `${saidas.length} ${saidas.length === 1 ? "lançamento" : "lançamentos"}`;

  const termo = $("busca").value.trim().toLowerCase();
  const visiveis = movs
    .filter((m) => (m.descricao || "").toLowerCase().includes(termo))
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);

  const tbody = $("tbody");
  tbody.replaceChildren();
  visiveis.forEach((m) => {
    const entrada = m.tipo === ENTRADA;
    const tr = document.createElement("tr");
    tr.append(celula(dataBR(m.data)), celula(m.descricao || "—"));

    const tdTipo = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge" + (entrada ? " entrada" : "");
    badge.textContent = entrada ? "Receita" : "Despesa";
    tdTipo.append(badge);

    const valor = celula((entrada ? "+" : "−") + brl(m.valor), "dir " + (entrada ? "pos" : "neg"));

    const tdAcao = document.createElement("td");
    tdAcao.className = "dir";
    const del = document.createElement("button");
    del.className = "btn-del";
    del.textContent = "Excluir";
    del.setAttribute("aria-label", `Excluir ${m.descricao || "transação"}`);
    del.addEventListener("click", () => excluir(m.id));
    tdAcao.append(del);

    tr.append(tdTipo, valor, tdAcao);
    tbody.append(tr);
  });
  $("vazio").hidden = visiveis.length > 0;
}

async function excluir(id) {
  if (!confirm("Excluir esta transação?")) return;
  try {
    await req(`/movimentacoes/${id}`, { method: "DELETE" });
    toast("Transação excluída");
    carregar();
  } catch (e) {
    toast(e.message);
  }
}

// ===== Eventos: acesso =====
$("abas-acesso").addEventListener("click", (ev) => {
  const aba = ev.target.dataset.aba;
  if (!aba) return;
  document.querySelectorAll("#abas-acesso button").forEach((b) => b.classList.toggle("ativa", b === ev.target));
  $("form-entrar").hidden = aba !== "entrar";
  $("form-criar").hidden = aba !== "criar";
  $("acesso-msg").textContent = "";
});

$("form-entrar").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  $("acesso-msg").textContent = "";
  try {
    entrar(await req(`/usuarios/buscar?email=${encodeURIComponent($("entrar-email").value.trim())}`));
  } catch (e) {
    $("acesso-msg").textContent = e.message;
  }
});

$("form-criar").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  $("acesso-msg").textContent = "";
  try {
    entrar(await postJSON("/usuarios", {
      nome: $("criar-nome").value.trim(),
      email: $("criar-email").value.trim(),
      senha: $("criar-senha").value,
    }));
  } catch (e) {
    $("acesso-msg").textContent = e.message;
  }
});

$("btn-sair").addEventListener("click", () => {
  localStorage.removeItem("moneta_usuario");
  location.reload();
});

// ===== Eventos: transação =====
$("btn-add").addEventListener("click", () => {
  $("form-mov").reset();
  $("mov-data").value = hoje();
  $("mov-msg").textContent = "";
  $("modal").showModal();
  $("mov-valor").focus();
});
$("fechar").addEventListener("click", () => $("modal").close());

$("abas-tipo").addEventListener("click", (ev) => {
  if (!ev.target.dataset.tipo) return;
  tipoAtual = ev.target.dataset.tipo;
  document.querySelectorAll("#abas-tipo button").forEach((b) => b.classList.toggle("ativa", b === ev.target));
});

$("form-mov").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  $("mov-msg").textContent = "";
  try {
    await postJSON("/movimentacoes", {
      valor: Number($("mov-valor").value),
      data: $("mov-data").value,
      tipo: tipoAtual,
      descricao: $("mov-desc").value.trim(),
      usuarioId: usuario.id,
    });
    $("modal").close();
    toast("Transação salva");
    carregar();
  } catch (e) {
    $("mov-msg").textContent = e.message;
  }
});

$("busca").addEventListener("input", desenhar);

// ===== Gráficos (Chart.js) =====
const GR = ["saldo", "mensal", "despesas"];
const graficos = {};
const cor = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact" });
const mesBR = (ym) => new Date(ym + "-01T12:00").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");

// Mostra carregando, erro ou vazio no cartão do gráfico (tipo = null limpa o estado)
function estado(id, tipo, msg) {
  const corpo = document.querySelector(`[data-g="${id}"]`);
  const el = corpo.querySelector(".estado");
  corpo.classList.toggle("sem-canvas", !!tipo);
  el.hidden = !tipo;
  el.className = "estado " + (tipo || "");
  el.replaceChildren();
  if (!tipo) return;
  const t = document.createElement("span");
  t.textContent = msg;
  el.append(t);
  if (tipo === "erro") {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn"; b.textContent = "Tentar de novo";
    b.addEventListener("click", carregar);
    el.append(b);
  }
}

function carregando() {
  document.querySelectorAll(".kpi .valor").forEach((e) => e.classList.add("sk"));
  GR.forEach((g) => estado(g, "carregando", "Carregando dados…"));
}

function falhou(msg) {
  document.querySelectorAll(".sk").forEach((e) => e.classList.remove("sk"));
  GR.forEach((g) => estado(g, "erro", msg));
  toast(msg);
}

// Só usa movimentações com data AAAA-MM-DD, valor numérico e tipo conhecido
const validas = () => movs.filter((m) =>
  /^\d{4}-\d{2}-\d{2}$/.test(m.data || "") && Number.isFinite(Number(m.valor)) && (m.tipo === ENTRADA || m.tipo === SAIDA));

function plotar(id, cfg) {
  graficos[id]?.destroy();
  estado(id, null);
  graficos[id] = new Chart($("g-" + id), cfg);
}

function desenharGraficos() {
  document.querySelectorAll(".sk").forEach((e) => e.classList.remove("sk"));
  if (typeof Chart === "undefined") {
    GR.forEach((g) => estado(g, "erro", "A biblioteca de gráficos não carregou. Verifique a conexão com a internet."));
    return;
  }
  const v = validas().sort((a, b) => a.data.localeCompare(b.data));
  if (!v.length) {
    GR.forEach((g) => estado(g, "vazio", "Adicione transações para ver os gráficos."));
    return;
  }
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = cor("--muted");
  const grade = cor("--border");
  const base = { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } } };
  const dinheiro = (eixo) => (c) => ` ${c.dataset.label}: ${brl(c.parsed[eixo])}`;

  // 1) Saldo acumulado por dia
  let acc = 0;
  const porDia = new Map();
  v.forEach((m) => { acc += (m.tipo === ENTRADA ? 1 : -1) * Number(m.valor); porDia.set(m.data, acc); });
  plotar("saldo", { type: "line", data: {
      labels: [...porDia.keys()].map((d) => dataBR(d).replace(/\/20(\d\d)$/, "/$1")),
      datasets: [{ label: "Saldo acumulado", data: [...porDia.values()], borderColor: cor("--accent"),
        backgroundColor: cor("--accent-soft"), fill: true, tension: .3, borderWidth: 2, pointRadius: porDia.size <= 31 ? 3 : 0 }] },
    options: { ...base, plugins: { ...base.plugins, tooltip: { callbacks: { label: dinheiro("y") } } },
      scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { grid: { color: grade }, ticks: { callback: (n) => compacto.format(n) } } } } });

  // 2) Entradas x saídas por mês
  const meses = {};
  v.forEach((m) => { const k = m.data.slice(0, 7); meses[k] ??= { e: 0, s: 0 }; meses[k][m.tipo === ENTRADA ? "e" : "s"] += Number(m.valor); });
  const ks = Object.keys(meses).sort();
  plotar("mensal", { type: "bar", data: { labels: ks.map(mesBR), datasets: [
      { label: "Entradas", data: ks.map((k) => meses[k].e), backgroundColor: cor("--pos"), borderRadius: 6 },
      { label: "Saídas", data: ks.map((k) => meses[k].s), backgroundColor: cor("--neg"), borderRadius: 6 }] },
    options: { ...base, plugins: { ...base.plugins, tooltip: { callbacks: { label: dinheiro("y") } } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: grade }, beginAtZero: true, ticks: { callback: (n) => compacto.format(n) } } } } });

  // 3) Maiores despesas por descrição
  const desp = {};
  v.filter((m) => m.tipo === SAIDA).forEach((m) => { const k = (m.descricao || "").trim() || "Sem descrição"; desp[k] = (desp[k] || 0) + Number(m.valor); });
  const top = Object.entries(desp).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!top.length) { estado("despesas", "vazio", "Nenhuma despesa registrada ainda."); return; }
  plotar("despesas", { type: "bar", data: { labels: top.map((t) => t[0]),
      datasets: [{ label: "Despesas", data: top.map((t) => t[1]), backgroundColor: cor("--neg"), borderRadius: 6 }] },
    options: { ...base, indexAxis: "y", plugins: { ...base.plugins, legend: { display: false }, tooltip: { callbacks: { label: dinheiro("x") } } },
      scales: { x: { grid: { color: grade }, beginAtZero: true, ticks: { callback: (n) => compacto.format(n) } }, y: { grid: { display: false } } } } });
}

// ===== Tema =====
function aplicarTema(t) { document.documentElement.dataset.theme = t; localStorage.setItem("moneta_tema", t); if (movs.length) desenharGraficos(); }
aplicarTema(localStorage.getItem("moneta_tema") ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("btn-tema").addEventListener("click", () =>
  aplicarTema(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

// ===== Início =====
if (usuario) abrirApp();
