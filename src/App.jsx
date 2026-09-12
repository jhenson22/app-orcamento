import React, { useState, useMemo } from "react";
import {
  User,
  Home,
  Wallet,
  Paintbrush,
  FileText,
  Plus,
  Trash2,
  Settings2,
  ArrowLeft,
  Printer,
  CheckCircle2,
  Circle,
  Droplets,
  Layers,
} from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

const formatBRL = (value) =>
  (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const toNumber = (v) => {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const SERVICOS_PADRAO = [
  { id: uid(), nome: "Pintura Simples", valor: 15 },
  { id: uid(), nome: "Massa Corrida", valor: 20 },
  { id: uid(), nome: "Textura / Grafiato", valor: 25 },
  { id: uid(), nome: "Pintura de Teto", valor: 12 },
];

const TABS = [
  { key: "cliente", label: "Cliente", icon: User },
  { key: "ambientes", label: "Ambientes", icon: Home },
  { key: "custos", label: "Custos", icon: Wallet },
  { key: "materiais", label: "Materiais", icon: Paintbrush },
  { key: "resumo", label: "Resumo", icon: FileText },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("cliente");
  const [showProposta, setShowProposta] = useState(false);

  const [profissional, setProfissional] = useState({ nome: "", telefone: "" });
  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    data: new Date().toISOString().slice(0, 10),
  });

  const [servicos, setServicos] = useState(SERVICOS_PADRAO);
  const [mostrarConfigServicos, setMostrarConfigServicos] = useState(false);
  const [ambientes, setAmbientes] = useState([
    { id: uid(), nome: "", observacao: "", m2: "", servicoIds: [] },
  ]);

  const [diarias, setDiarias] = useState([]);
  const [materiaisExtras, setMateriaisExtras] = useState([]);

  const [tintaRows, setTintaRows] = useState([
    { id: uid(), ambiente: "", metragem: "", rendimento: 350, demaos: 2 },
  ]);

  const [massaRows, setMassaRows] = useState([
    { id: uid(), ambiente: "", metragem: "", consumo: 1.2, demaos: 1, pesoEmbalagem: 20 },
  ]);

  const ambientesCalculados = useMemo(() => {
    return ambientes.map((amb) => {
      const m2 = toNumber(amb.m2);
      const valorM2 = amb.servicoIds.reduce((acc, sid) => {
        const s = servicos.find((s) => s.id === sid);
        return acc + (s ? toNumber(s.valor) : 0);
      }, 0);
      return { ...amb, m2, valorM2, subtotal: m2 * valorM2 };
    });
  }, [ambientes, servicos]);

  const totalAmbientes = ambientesCalculados.reduce((acc, a) => acc + a.subtotal, 0);
  const totalDiarias = diarias.reduce((acc, d) => acc + toNumber(d.valor), 0);
  const totalMateriaisExtras = materiaisExtras.reduce((acc, m) => acc + toNumber(m.valor), 0);
  const totalGeral = totalAmbientes + totalDiarias + totalMateriaisExtras;

  const tintaCalculada = tintaRows.map((r) => {
    const metragem = toNumber(r.metragem);
    const rendimento = toNumber(r.rendimento) || 1;
    const demaos = toNumber(r.demaos) || 1;
    const m2Total = metragem * demaos;
    const latas = metragem > 0 ? Math.ceil(m2Total / rendimento) : 0;
    return { ...r, m2Total, latas };
  });

  const massaCalculada = massaRows.map((r) => {
    const metragem = toNumber(r.metragem);
    const consumo = toNumber(r.consumo);
    const demaos = toNumber(r.demaos) || 1;
    const pesoEmbalagem = toNumber(r.pesoEmbalagem) || 1;
    const kgTotal = metragem * consumo * demaos;
    const embalagens = metragem > 0 ? Math.ceil(kgTotal / pesoEmbalagem) : 0;
    return { ...r, kgTotal, embalagens };
  });

  const addAmbiente = () =>
    setAmbientes((prev) => [...prev, { id: uid(), nome: "", observacao: "", m2: "", servicoIds: [] }]);
  const removeAmbiente = (id) => setAmbientes((prev) => prev.filter((a) => a.id !== id));
  const updateAmbiente = (id, field, value) =>
    setAmbientes((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  const toggleServicoAmbiente = (ambId, servId) =>
    setAmbientes((prev) =>
      prev.map((a) => {
        if (a.id !== ambId) return a;
        const has = a.servicoIds.includes(servId);
        return {
          ...a,
          servicoIds: has ? a.servicoIds.filter((s) => s !== servId) : [...a.servicoIds, servId],
        };
      })
    );

  const updateServico = (id, field, value) =>
    setServicos((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  const addServico = () => setServicos((prev) => [...prev, { id: uid(), nome: "Novo serviço", valor: 0 }]);
  const removeServico = (id) => {
    setServicos((prev) => prev.filter((s) => s.id !== id));
    setAmbientes((prev) =>
      prev.map((a) => ({ ...a, servicoIds: a.servicoIds.filter((sid) => sid !== id) }))
    );
  };

  const addDiaria = () => setDiarias((prev) => [...prev, { id: uid(), descricao: "Ajudante", valor: "" }]);
  const removeDiaria = (id) => setDiarias((prev) => prev.filter((d) => d.id !== id));
  const updateDiaria = (id, field, value) =>
    setDiarias((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));

  const addMaterialExtra = () => setMateriaisExtras((prev) => [...prev, { id: uid(), descricao: "", valor: "" }]);
  const removeMaterialExtra = (id) => setMateriaisExtras((prev) => prev.filter((m) => m.id !== id));
  const updateMaterialExtra = (id, field, value) =>
    setMateriaisExtras((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

  const addTintaRow = () =>
    setTintaRows((prev) => [...prev, { id: uid(), ambiente: "", metragem: "", rendimento: 350, demaos: 2 }]);
  const updateTintaRow = (id, field, value) =>
    setTintaRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const addMassaRow = () =>
    setMassaRows((prev) => [
      ...prev,
      { id: uid(), ambiente: "", metragem: "", consumo: 1.2, demaos: 1, pesoEmbalagem: 20 },
    ]);
  const updateMassaRow = (id, field, value) =>
    setMassaRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const FieldLabel = ({ children }) => (
    <label className="block text-sm font-medium text-slate-600 mb-1">{children}</label>
  );

  const TextInput = (props) => (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 " +
        (props.className || "")
      }
    />
  );

  const Card = ({ children, className = "" }) => (
    <div className={"bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 " + className}>
      {children}
    </div>
  );

  if (showProposta) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="sticky top-0 z-10 bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
          <button onClick={() => setShowProposta(false)} className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={18} /> Voltar e editar
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            <Printer size={18} /> Imprimir / PDF
          </button>
        </div>
        <div className="max-w-2xl mx-auto py-6 px-3">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-6">
              <p className="text-xs uppercase tracking-wide text-blue-200">Proposta de Serviço</p>
              <h1 className="text-2xl font-bold mt-1">{profissional.nome || "Serviços de Pintura"}</h1>
              {profissional.telefone && <p className="text-sm text-blue-100 mt-1">{profissional.telefone}</p>}
            </div>
            <div className="px-6 py-5 border-b border-slate-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Cliente</p>
                <p className="font-semibold text-slate-800">{cliente.nome || "-"}</p>
              </div>
              <div>
                <p className="text-slate-400">Telefone</p>
                <p className="font-semibold text-slate-800">{cliente.telefone || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Endereço</p>
                <p className="font-semibold text-slate-800">{cliente.endereco || "-"}</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Ambientes e Serviços</h2>
              <div className="space-y-3">
                {ambientesCalculados.map((a) => (
                  <div key={a.id} className="flex justify-between items-start gap-3 pb-3 border-b border-dashed border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800">{a.nome || "Ambiente"}</p>
                      <p className="text-xs text-slate-500">{a.m2} m²</p>
                    </div>
                    <p className="font-semibold text-slate-800">{formatBRL(a.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-emerald-50 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-emerald-800">Valor Total</span>
                <span className="text-2xl font-extrabold text-emerald-700">{formatBRL(totalGeral)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-blue-900 text-white px-4 pt-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Paintbrush size={24} className="text-emerald-400" />
            <h1 className="text-xl font-bold">Orçamento Pintor</h1>
          </div>
          <p className="text-blue-200 text-sm mt-1">Monte e envie orçamentos profissionais em minutos</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={
                  "flex-1 min-w-[76px] flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors " +
                  (active ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100")
                }
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-4">
          {activeTab === "cliente" && (
            <>
              <Card>
                <h2 className="font-bold text-slate-800 mb-3">Dados do Profissional</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Seu nome / Nome da empresa</FieldLabel>
                    <TextInput value={profissional.nome} onChange={(e) => setProfissional((p) => ({ ...p, nome: e.target.value }))} placeholder="Ex: João Pinturas" />
                  </div>
                  <div>
                    <FieldLabel>Seu telefone</FieldLabel>
                    <TextInput value={profissional.telefone} onChange={(e) => setProfissional((p) => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="font-bold text-slate-800 mb-3">Dados do Cliente e da Obra</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Nome do cliente</FieldLabel>
                    <TextInput value={cliente.nome} onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))} placeholder="Ex: Maria Souza" />
                  </div>
                  <div>
                    <FieldLabel>Telefone do cliente</FieldLabel>
                    <TextInput value={cliente.telefone} onChange={(e) => setCliente((c) => ({ ...c, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Endereço da obra</FieldLabel>
                    <TextInput value={cliente.endereco} onChange={(e) => setCliente((c) => ({ ...c, endereco: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === "ambientes" && (
            <>
              <Card>
                <button onClick={() => setMostrarConfigServicos((v) => !v)} className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2 font-bold text-slate-800">
                    <Settings2 size={18} className="text-emerald-600" /> Valores dos Serviços (por m²)
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">{mostrarConfigServicos ? "ocultar" : "editar"}</span>
                </button>
                {mostrarConfigServicos && (
                  <div className="mt-3 space-y-2">
                    {servicos.map((s) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <TextInput value={s.nome} onChange={(e) => updateServico(s.id, "nome", e.target.value)} className="flex-1" />
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-slate-400 text-sm">R$</span>
                          <TextInput type="number" value={s.valor} onChange={(e) => updateServico(s.id, "valor", e.target.value)} className="w-20 text-right" />
                          <span className="text-slate-400 text-sm">/m²</span>
                        </div>
                        <button onClick={() => removeServico(s.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button onClick={addServico} className="flex items-center gap-1 text-sm font-medium text-emerald-700 mt-1">
                      <Plus size={16} /> Adicionar serviço
                    </button>
                  </div>
                )}
              </Card>

              {ambientesCalculados.map((amb, idx) => (
                <Card key={amb.id}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <TextInput value={amb.nome} onChange={(e) => updateAmbiente(amb.id, "nome", e.target.value)} placeholder={`Ambiente ${idx + 1}`} className="font-semibold" />
                    {ambientes.length > 1 && (
                      <button onClick={() => removeAmbiente(amb.id)} className="text-slate-300 hover:text-red-500 mt-2 shrink-0">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <FieldLabel>Metragem (m²)</FieldLabel>
                      <TextInput type="number" value={amb.m2} onChange={(e) => updateAmbiente(amb.id, "m2", e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <FieldLabel>Observação</FieldLabel>
                      <TextInput value={amb.observacao} onChange={(e) => updateAmbiente(amb.id, "observacao", e.target.value)} placeholder="Ex: parede com infiltração" />
                    </div>
                  </div>
                  <FieldLabel>Tipo de serviço</FieldLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {servicos.map((s) => {
                      const checked = amb.servicoIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleServicoAmbiente(amb.id, s.id)}
                          className={
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                            (checked ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")
                          }
                        >
                          {checked ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <Circle size={18} className="text-slate-300 shrink-0" />}
                          <span className="flex-1">{s.nome}</span>
                          <span className="text-xs text-slate-400">R$ {toNumber(s.valor).toFixed(2)}/m²</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Subtotal</span>
                    <span className="font-bold text-blue-900">{formatBRL(amb.subtotal)}</span>
                  </div>
                </Card>
              ))}

              <button onClick={addAmbiente} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl py-3 font-medium hover:border-emerald-400 hover:text-emerald-600">
                <Plus size={18} /> Adicionar ambiente
              </button>
            </>
          )}

          {activeTab === "custos" && (
            <>
              <Card>
                <h2 className="font-bold text-slate-800 mb-3">Diárias de Ajudantes</h2>
                <div className="space-y-2">
                  {diarias.map((d) => (
                    <div key={d.id} className="flex items-center gap-2">
                      <TextInput value={d.descricao} onChange={(e) => updateDiaria(d.id, "descricao", e.target.value)} placeholder="Ajudante" className="flex-1" />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-slate-400 text-sm">R$</span>
                        <TextInput type="number" value={d.valor} onChange={(e) => updateDiaria(d.id, "valor", e.target.value)} className="w-24 text-right" />
                      </div>
                      <button onClick={() => removeDiaria(d.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addDiaria} className="flex items-center gap-1 text-sm font-medium text-emerald-700 mt-1">
                    <Plus size={16} /> Adicionar diária
                  </button>
                </div>
              </Card>

              <Card>
                <h2 className="font-bold text-slate-800 mb-3">Materiais Extras</h2>
                <div className="space-y-2">
                  {materiaisExtras.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <TextInput value={m.descricao} onChange={(e) => updateMaterialExtra(m.id, "descricao", e.target.value)} placeholder="Ex: Lixas, fitas" className="flex-1" />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-slate-400 text-sm">R$</span>
                        <TextInput type="number" value={m.valor} onChange={(e) => updateMaterialExtra(m.id, "valor", e.target.value)} className="w-24 text-right" />
                      </div>
                      <button onClick={() => removeMaterialExtra(m.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addMaterialExtra} className="flex items-center gap-1 text-sm font-medium text-emerald-700 mt-1">
                    <Plus size={16} /> Adicionar material
                  </button>
                </div>
              </Card>
            </>
          )}

          {activeTab === "materiais" && (
            <>
              <Card>
                <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                  <Droplets size={18} className="text-emerald-600" /> Calculadora de Tinta
                </h2>
                {tintaCalculada.map((r) => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-3 mb-3">
                    <TextInput value={r.ambiente} onChange={(e) => updateTintaRow(r.id, "ambiente", e.target.value)} placeholder="Identificação (ex: Sala)" className="mb-2 text-sm" />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <FieldLabel>m²</FieldLabel>
                        <TextInput type="number" value={r.metragem} onChange={(e) => updateTintaRow(r.id, "metragem", e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>Demãos</FieldLabel>
                        <TextInput type="number" value={r.demaos} onChange={(e) => updateTintaRow(r.id, "demaos", e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>Rendimento</FieldLabel>
                        <TextInput type="number" value={r.rendimento} onChange={(e) => updateTintaRow(r.id, "rendimento", e.target.value)} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 text-sm">
                      <span className="text-slate-500">{r.m2Total.toFixed(1)} m² a cobrir</span>
                      <span className="font-bold text-emerald-700">≈ {r.latas} lata(s) 18L</span>
                    </div>
                  </div>
                ))}
                <button onClick={addTintaRow} className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                  <Plus size={16} /> Adicionar metragem
                </button>
              </Card>

              <Card>
                <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                  <Layers size={18} className="text-emerald-600" /> Calculadora de Massa Corrida
                </h2>
                {massaCalculada.map((r) => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-3 mb-3">
                    <TextInput value={r.ambiente} onChange={(e) => updateMassaRow(r.id, "ambiente", e.target.value)} placeholder="Identificação (ex: Quarto)" className="mb-2 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>m²</FieldLabel>
                        <TextInput type="number" value={r.metragem} onChange={(e) => updateMassaRow(r.id, "metragem", e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>Demãos</FieldLabel>
                        <TextInput type="number" value={r.demaos} onChange={(e) => updateMassaRow(r.id, "demaos", e.target.value)} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 text-sm">
                      <span className="text-slate-500">{r.kgTotal.toFixed(1)} kg necessários</span>
                      <span className="font-bold text-emerald-700">≈ {r.embalagens} embalagem(ns)</span>
                    </div>
                  </div>
                ))}
                <button onClick={addMassaRow} className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                  <Plus size={16} /> Adicionar metragem
                </button>
              </Card>
            </>
          )}

          {activeTab === "resumo" && (
            <>
              <Card>
                <h2 className="font-bold text-slate-800 mb-3">Resumo do Orçamento</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ambientes</span>
                    <span className="font-medium text-slate-700">{formatBRL(totalAmbientes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diárias</span>
                    <span className="font-medium text-slate-700">{formatBRL(totalDiarias)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Materiais</span>
                    <span className="font-medium text-slate-700">{formatBRL(totalMateriaisExtras)}</span>
                  </div>
                </div>
                <div className="mt-4 bg-emerald-50 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-emerald-800">Valor Total</span>
                  <span className="text-2xl font-extrabold text-emerald-700">{formatBRL(totalGeral)}</span>
                </div>
              </Card>

              <button onClick={() => setShowProposta(true)} className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl py-4 font-bold shadow-md">
                <FileText size={20} /> Gerar Proposta Profissional
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}