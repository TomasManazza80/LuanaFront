import React, { useState, useEffect } from 'react';
import { 
  Landmark, TrendingUp, TrendingDown, MoreVertical, Syringe, Activity, Monitor, 
  Briefcase, Plus, Stethoscope, Loader2, X, History, Edit2, ArrowLeft, Search, 
  Calendar, Filter, Receipt, DollarSign, ArrowDownRight, FileText 
} from 'lucide-react';
import { 
  useGetBalanceQuery, 
  useCreateTransactionMutation, 
  useGetTransactionHistoryQuery, 
  useUpdateTransactionMutation, 
  useGetExpensesQuery 
} from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast.tsx';
import moment from 'moment';

const FinancialOverview = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'expenses'
  const [timeFilter, setTimeFilter] = useState('Mes');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(50);
  const [selectedDayGroup, setSelectedDayGroup] = useState(null);
  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'income', category: 'OTHER', paymentMethod: 'Efectivo', date: moment().format('YYYY-MM-DDTHH:mm') });
  
  const [selectedTx, setSelectedTx] = useState(null);
  const [isEditingTx, setIsEditingTx] = useState(false);

  // Expenses Date Range Search State
  const [expenseStartDate, setExpenseStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [expenseEndDate, setExpenseEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  
  const { data, isLoading, refetch } = useGetBalanceQuery(timeFilter, { pollingInterval: 5000 });
  const { data: historyData, isLoading: isLoadingHistory, isFetching: isFetchingHistory } = useGetTransactionHistoryQuery({ offset: 0, limit: historyLimit }, { skip: !showHistoryModal, pollingInterval: 5000 });
  const { data: expensesData, isLoading: isLoadingExpenses, refetch: refetchExpenses } = useGetExpensesQuery({ startDate: expenseStartDate, endDate: expenseEndDate });

  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();

  const handleCreate = async () => {
    if (!newTx.title || !newTx.amount) return;
    try {
        await createTransaction(newTx).unwrap();
        toast({ title: 'Éxito', description: 'Transacción creada', variant: 'success' });
        setShowModal(false);
        setNewTx({ title: '', amount: '', type: 'income', category: 'OTHER', paymentMethod: 'Efectivo' });
        refetch();
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo guardar la transacción', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
      if (!selectedTx.title || !selectedTx.amount) return toast({ title: 'Atención', description: 'Completa los campos obligatorios' });
      try {
          await updateTransaction({
              id: selectedTx.id,
              title: selectedTx.title,
              amount: selectedTx.amount,
              type: selectedTx.type,
              paymentMethod: selectedTx.payment_method,
              date: selectedTx.date || selectedTx.created_at
          }).unwrap();
          toast({ title: 'Éxito', description: 'Transacción actualizada correctamente' });
          setIsEditingTx(false);
          setSelectedTx(null);
      } catch (error) {
          toast({ title: 'Error', description: 'No se pudo actualizar la transacción', variant: 'destructive' });
      }
  };

  const getIcon = (category) => {
      switch(category) {
          case 'PAYROLL': return { icon: <Briefcase size={20} className="text-[#F59E0B]" />, bg: 'bg-yellow-50' };
          case 'OTHER': default: return { icon: <Landmark size={20} className="text-[#6B7280]" />, bg: 'bg-gray-50' };
      }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  const groupedHistory = historyData?.data?.reduce((groups, tx) => {
      const txDate = tx.date || tx.created_at;
      const dateKey = moment(txDate).format('YYYY-MM-DD');
      if (!groups[dateKey]) {
          groups[dateKey] = {
              date: dateKey,
              formattedDate: moment(dateKey).format('DD [de] MMMM'),
              transactions: [],
              totalIncome: 0,
              totalExpense: 0,
              get balance() { return this.totalIncome - this.totalExpense }
          };
      }
      groups[dateKey].transactions.push(tx);
      if (tx.type === 'income') {
          groups[dateKey].totalIncome += Number(tx.amount);
      } else {
          groups[dateKey].totalExpense += Number(tx.amount);
      }
      return groups;
  }, {});

  const groupedArray = groupedHistory ? Object.values(groupedHistory).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

  if (isLoading) {
      return <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#0a47d4]" size={40} /></div>;
  }

  const { totalBalance = 0, totalIncome = 0, totalExpense = 0, transactions = [] } = data || {};

  return (
    <>
    <div className="w-full max-w-full overflow-x-hidden bg-[#F8FAFC] p-3 md:p-5 flex flex-col gap-4 font-sans">
      
      {/* Header Navigation & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">Resumen Financiero</h1>
          <p className="text-xs text-gray-500 mt-0.5">Controla los ingresos, gastos y egresos por período.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Filters for Overview */}
            {activeTab === 'overview' && (
              <div className="flex bg-gray-100 p-0.5 rounded-lg">
                {['Dia', 'Semana', 'Mes'].map((t) => (
                    <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        timeFilter === t
                        ? 'bg-[#0A58CA] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    >
                    {t}
                    </button>
                ))}
              </div>
            )}
            
            {/* Historial de Cierres de Caja */}
            <button 
               onClick={() => { setShowHistoryModal(true); setHistoryLimit(50); setSelectedDayGroup(null); }}
               className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-semibold shadow-xs transition-all flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
               <History size={15} /> Historial de Cierres de Caja
            </button>

            {/* Botón para cargar nuevo movimiento */}
            <button 
               onClick={() => setShowModal(true)}
               className="bg-[#0A58CA] hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-semibold shadow-xs transition-all flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
               <Plus size={15} /> Nueva Transacción
            </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[#0A58CA] text-[#0A58CA]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Landmark size={15} /> Resumen General
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'expenses'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <TrendingDown size={15} /> Consulta de Egresos por Rango
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Total Balance */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5 text-gray-500 font-semibold text-xs">
                  <Landmark size={15} /> Balance Total
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</div>
            </div>

            {/* Income */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-gray-500 font-semibold text-xs mb-1">
                <TrendingUp size={15} className="text-[#3B82F6]" /> Ingresos
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#3B82F6]">{formatCurrency(totalIncome)}</div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-gray-500 font-semibold text-xs mb-1">
                <TrendingDown size={15} className="text-[#EF4444]" /> Gastos
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#EF4444]">{formatCurrency(totalExpense)}</div>
            </div>

          </div>

          {/* Main Content: Recent Transactions */}
          <div className="flex flex-col flex-1 min-h-[400px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Transacciones Recientes</h2>
                <button className="text-sm font-bold text-[#0A58CA] hover:text-blue-800 transition-colors">
                  Ver Todo
                </button>
              </div>
              
              <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2">
                {data?.transactions?.length === 0 ? (
                    <div className="flex items-center justify-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        No hay movimientos registrados
                    </div>
                ) : (
                    data?.transactions?.slice(0, 10).map(tx => {
                        const txDate = tx.date || tx.created_at;
                        return (
                            <div 
                                key={tx.id} 
                                onClick={() => { setSelectedTx({...tx}); setIsEditingTx(false); }}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 bg-white shadow-sm mb-3 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${getIcon(tx.category).bg}`}>
                                        {getIcon(tx.category).icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm md:text-base">{tx.title}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500 font-medium">
                                                {moment(txDate).format('DD MMM YYYY, HH:mm')}
                                            </p>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">{tx.payment_method || 'Efectivo'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-base md:text-lg font-black tracking-tight ${tx.type === 'income' ? 'text-[#059669]' : 'text-gray-700'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </div>
                            </div>
                        );
                    })
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* EXPENSES TAB BY DATE RANGE */}
      {activeTab === 'expenses' && (() => {
        const rawExpenses = expensesData?.data || [];
        const filteredExpenses = rawExpenses.filter(item => {
          if (!expenseSearchQuery.trim()) return true;
          const q = expenseSearchQuery.toLowerCase();
          return (
            item.title?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            item.payment_method?.toLowerCase().includes(q)
          );
        });

        const filteredExpensesTotal = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const avgExpense = filteredExpenses.length ? filteredExpensesTotal / filteredExpenses.length : 0;

        return (
          <div className="flex flex-col gap-6">
            {/* Search & Filter Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Receipt className="text-red-600" size={20} /> Búsqueda y Reporte de Egresos
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Selecciona un rango de fechas para consultar todos los egresos del período.</p>
                </div>

                {/* Quick Date Presets */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <button
                    onClick={() => {
                      setExpenseStartDate(moment().startOf('day').format('YYYY-MM-DD'));
                      setExpenseEndDate(moment().endOf('day').format('YYYY-MM-DD'));
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => {
                      setExpenseStartDate(moment().startOf('isoWeek').format('YYYY-MM-DD'));
                      setExpenseEndDate(moment().format('YYYY-MM-DD'));
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    Esta Semana
                  </button>
                  <button
                    onClick={() => {
                      setExpenseStartDate(moment().startOf('month').format('YYYY-MM-DD'));
                      setExpenseEndDate(moment().endOf('month').format('YYYY-MM-DD'));
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-700 font-bold border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Este Mes
                  </button>
                  <button
                    onClick={() => {
                      setExpenseStartDate(moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'));
                      setExpenseEndDate(moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'));
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    Mes Anterior
                  </button>
                </div>
              </div>

              {/* Date Inputs & Search Query Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-gray-100">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Desde (Fecha Inicio)
                  </label>
                  <input
                    type="date"
                    value={expenseStartDate}
                    onChange={(e) => setExpenseStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Hasta (Fecha Fin)
                  </label>
                  <input
                    type="date"
                    value={expenseEndDate}
                    onChange={(e) => setExpenseEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Filtrar por concepto o medio de pago
                  </label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por descripción, tipo o forma de pago..."
                      value={expenseSearchQuery}
                      onChange={(e) => setExpenseSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-6 text-white shadow-md flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1 opacity-90">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Egresos en Período</span>
                  <TrendingDown size={22} />
                </div>
                <div className="text-3xl font-black">{formatCurrency(filteredExpensesTotal)}</div>
                <p className="text-xs mt-1.5 opacity-80 font-medium">Del {moment(expenseStartDate).format('DD/MM/YYYY')} al {moment(expenseEndDate).format('DD/MM/YYYY')}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1 text-gray-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Registros de Egreso</span>
                  <Receipt size={20} className="text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{filteredExpenses.length} <span className="text-sm font-normal text-gray-500">comprobantes</span></div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1 text-gray-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Promedio por Egreso</span>
                  <DollarSign size={20} className="text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(avgExpense)}</div>
              </div>
            </div>

            {/* Expenses Table List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-red-600" /> Detalle de Egresos Encontrados ({filteredExpenses.length})
                </h3>
                {isLoadingExpenses && <Loader2 className="animate-spin text-red-600" size={18} />}
              </div>

              {isLoadingExpenses ? (
                <div className="py-12 flex justify-center items-center text-gray-500">
                  <Loader2 className="animate-spin text-red-600 mr-2" size={24} /> Cargando egresos...
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Receipt size={36} className="text-gray-300 mb-2" />
                  <p className="font-bold text-gray-700 text-sm">No se encontraron egresos en el rango seleccionado</p>
                  <p className="text-xs text-gray-400 mt-1">Prueba cambiando el rango de fechas o los términos de búsqueda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <th className="py-3 px-4 rounded-l-xl">Fecha y Hora</th>
                        <th className="py-3 px-4">Concepto / Título</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4">Medio de Pago</th>
                        <th className="py-3 px-4 text-right">Monto</th>
                        <th className="py-3 px-4 text-center rounded-r-xl">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredExpenses.map((tx) => {
                        const txDate = tx.date || tx.created_at;
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="py-3.5 px-4 font-semibold text-gray-600">
                              {moment(txDate).format('DD/MM/YYYY • HH:mm [hs]')}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">
                              {tx.title}
                              {tx.subtitle && <p className="text-xs text-gray-400 font-normal">{tx.subtitle}</p>}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                                {tx.category || 'VARIOS'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-gray-700">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase">
                                {tx.payment_method || 'Efectivo'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-red-600 text-base">
                              -{formatCurrency(tx.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => { setSelectedTx({...tx}); setIsEditingTx(false); }}
                                className="p-1.5 bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-800 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="Ver / Editar egreso"
                              >
                                <Edit2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>

    {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Nueva Transacción</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1">Tipo</label>
                        <select 
                            value={newTx.type}
                            onChange={e => setNewTx({...newTx, type: e.target.value})}
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                        >
                            <option value="income">Ingreso</option>
                            <option value="expense">Gasto</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1">Título / Descripción</label>
                        <input 
                            type="text" 
                            value={newTx.title}
                            onChange={e => setNewTx({...newTx, title: e.target.value})}
                            placeholder="Ej: Insumos, Luz, etc."
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                            <input 
                                type="number" 
                                value={newTx.amount}
                                onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0a47d4] outline-none"
                                placeholder="Ej: 5000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
                            <input 
                                type="datetime-local" 
                                value={newTx.date}
                                onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0a47d4] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1">Medio de Pago</label>
                        <select 
                            value={newTx.paymentMethod}
                            onChange={e => setNewTx({...newTx, paymentMethod: e.target.value})}
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Débito">Débito</option>
                            <option value="Mixto">Mixto</option>
                            {Array.from({length: 12}).map((_, i) => (
                                <option key={i} value={`Crédito ${i + 1} cuota${i > 0 ? 's' : ''}`}>
                                    Crédito {i + 1} cuota{i > 0 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={isCreating || !newTx.title || !newTx.amount}
                        className="w-full mt-4 bg-[#0A58CA] text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Guardar Transacción'}
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* Historial Modal */}
    {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 flex flex-col h-[85vh]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <History className="text-[#0a47d4]" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Historial de Cierres de Caja y Movimientos
                            </h2>
                            <p className="text-sm text-gray-500">
                                Explora todos los movimientos registrados separados por día.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => { setShowHistoryModal(false); setSelectedDayGroup(null); }} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col">
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#0a47d4]" size={32} />
                        </div>
                    ) : selectedDayGroup ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedDayGroup(null)}
                                        className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full text-gray-600 transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Cierre del {selectedDayGroup.formattedDate}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Ingresos</p>
                                        <p className="text-sm font-black text-[#059669]">+{formatCurrency(selectedDayGroup.totalIncome)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Egresos</p>
                                        <p className="text-sm font-black text-[#EF4444]">-{formatCurrency(selectedDayGroup.totalExpense)}</p>
                                    </div>
                                    <div className="text-right pl-6 border-l border-gray-200">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Balance del Día</p>
                                        <p className={`text-base font-black ${selectedDayGroup.balance >= 0 ? 'text-[#0a47d4]' : 'text-[#EF4444]'}`}>
                                            {formatCurrency(selectedDayGroup.balance)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Concepto / Entidad</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Medio Pago</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {selectedDayGroup.transactions.map((tx) => {
                                                const txDate = tx.date || tx.created_at;
                                                return (
                                                <tr key={tx.id} onClick={() => { setSelectedTx({...tx}); setIsEditingTx(false); }} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {moment(txDate).format('HH:mm')}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                                                        {tx.title}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                        {tx.payment_method || '-'}
                                                    </td>
                                                    <td className={`px-6 py-3 whitespace-nowrap text-sm font-bold text-right ${tx.type === 'income' ? 'text-[#059669]' : 'text-[#EF4444]'}`}>
                                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.values(groupedHistory || {}).length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No hay movimientos registrados en el historial.</div>
                            ) : (
                                Object.values(groupedHistory).map(group => (
                                    <button 
                                        key={group.date} 
                                        onClick={() => setSelectedDayGroup(group)}
                                        className="w-full text-left bg-white rounded-xl border border-gray-200 hover:border-[#0a47d4] hover:shadow-md transition-all duration-200 overflow-hidden flex items-center justify-between p-5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 text-[#0a47d4] p-3 rounded-lg flex flex-col items-center justify-center min-w-[70px]">
                                                <span className="text-sm font-bold uppercase leading-none mb-1">{moment(group.date).format('MMM')}</span>
                                                <span className="text-2xl font-black leading-none">{moment(group.date).format('DD')}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{group.formattedDate}</h3>
                                                <p className="text-sm text-gray-500 font-medium">{group.transactions.length} movimientos registrados</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="hidden sm:flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Ingresos</p>
                                                    <p className="text-sm font-bold text-[#059669]">+{formatCurrency(group.totalIncome)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Egresos</p>
                                                    <p className="text-sm font-bold text-[#EF4444]">-{formatCurrency(group.totalExpense)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right pl-6 border-l border-gray-200">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Balance</p>
                                                <p className={`text-xl font-black ${group.balance >= 0 ? 'text-[#0a47d4]' : 'text-[#EF4444]'}`}>
                                                    {formatCurrency(group.balance)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                            {historyData?.data?.length < historyData?.total && (
                            <button 
                                onClick={() => setHistoryLimit(prev => prev + 50)}
                                disabled={isFetchingHistory}
                                className="mt-6 mx-auto bg-white border border-gray-200 hover:border-[#0a47d4] text-[#0a47d4] hover:bg-blue-50 font-bold py-3 px-8 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                {isFetchingHistory ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isFetchingHistory ? 'Cargando...' : 'Cargar más movimientos'}
                            </button>
                        )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}

    {/* Transaction Details Modal */}
    {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 flex flex-col shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Detalles del Movimiento</h2>
                    <div className="flex items-center gap-2">
                        {!isEditingTx && (
                            <button onClick={() => setIsEditingTx(true)} className="text-[#0a47d4] hover:bg-blue-50 p-2 rounded-full transition-colors">
                                <Edit2 size={20} />
                            </button>
                        )}
                        <button onClick={() => { setSelectedTx(null); setIsEditingTx(false); }} className="text-gray-400 hover:text-gray-600 p-2 rounded-full">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Concepto / Entidad</label>
                        <input 
                            type="text" 
                            value={selectedTx.title}
                            disabled={!isEditingTx}
                            onChange={(e) => setSelectedTx({...selectedTx, title: e.target.value})}
                            className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0a47d4] outline-none ${!isEditingTx ? 'bg-gray-100 text-gray-700 border-transparent font-semibold' : 'border-gray-300'}`}
                        />
                    </div>
                    {selectedTx.subtitle && !isEditingTx && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción extra</label>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{selectedTx.subtitle}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                            <input 
                                type="number" 
                                value={selectedTx.amount}
                                disabled={!isEditingTx}
                                onChange={(e) => setSelectedTx({...selectedTx, amount: e.target.value})}
                                className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0a47d4] outline-none font-bold ${!isEditingTx ? 'bg-gray-100 text-gray-800 border-transparent' : 'border-gray-300'} ${selectedTx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select 
                                value={selectedTx.type}
                                disabled={!isEditingTx}
                                onChange={(e) => setSelectedTx({...selectedTx, type: e.target.value})}
                                className={`w-full border rounded-lg p-2 outline-none font-semibold ${!isEditingTx ? 'bg-gray-100 border-transparent appearance-none' : 'border-gray-300'} ${selectedTx.type === 'income' ? 'text-green-700' : 'text-red-700'}`}
                            >
                                <option value="income">Ingreso</option>
                                <option value="expense">Egreso</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
                            <input 
                                type="datetime-local" 
                                value={moment(selectedTx.date || selectedTx.created_at).format('YYYY-MM-DDTHH:mm')}
                                disabled={!isEditingTx}
                                onChange={(e) => setSelectedTx({...selectedTx, date: e.target.value})}
                                className={`w-full border rounded-lg p-2 outline-none ${!isEditingTx ? 'bg-gray-100 text-gray-700 border-transparent font-medium' : 'border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medio Pago</label>
                            <select 
                                value={selectedTx.payment_method || ''}
                                disabled={!isEditingTx}
                                onChange={(e) => setSelectedTx({...selectedTx, payment_method: e.target.value})}
                                className={`w-full border rounded-lg p-2 outline-none ${!isEditingTx ? 'bg-gray-100 text-gray-700 border-transparent appearance-none font-medium' : 'border-gray-300'}`}
                            >
                                <option value="">Ninguno</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Débito">Débito</option>
                                <option value="Mixto">Mixto</option>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                                    <option key={`credito-${num}`} value={`Crédito ${num}`}>Crédito {num}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                {isEditingTx && (
                    <button 
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="mt-6 w-full bg-[#0a47d4] hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isUpdating ? <Loader2 className="animate-spin" size={20} /> : null}
                        Guardar Cambios
                    </button>
                )}
            </div>
        </div>
    )}
    </>
  );
};

export default FinancialOverview;
